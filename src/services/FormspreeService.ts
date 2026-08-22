import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface FormSubmissionData {
  formType: 'contact' | 'quote' | 'newsletter' | 'technicalVisit';
  data: Record<string, any>;
  metadata?: {
    timestamp: string;
    userAgent: string;
    referrer: string;
    sessionId: string;
    abTestVariants?: Record<string, string>;
    leadScore?: number;
  };
}

export interface FormspreeResponse {
  ok: boolean;
  next?: string;
  errors?: Array<{
    field: string;
    code: string;
    message: string;
  }>;
}

class FormspreeService {
  private baseUrl = apiConfig.formspree.endpoint;
  private apiKey = apiConfig.formspree.apiKey;

  async submitForm(submission: FormSubmissionData): Promise<FormspreeResponse> {
    const formId = this.getFormId(submission.formType);
    const url = `${this.baseUrl}/${formId}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const payload = {
      ...submission.data,
      _subject: this.generateSubject(submission.formType, submission.data),
      _replyto: submission.data.email,
      _format: 'json',
      _metadata: JSON.stringify(submission.metadata),
      _formType: submission.formType,
      _timestamp: new Date().toISOString(),
      _source: 'piscinasandinas_website'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`Formspree error: ${response.status} - ${JSON.stringify(result)}`);
      }

      // Track successful submission
      this.trackSubmissionSuccess(submission.formType, submission.data);

      // Trigger CRM webhook
      await this.triggerCRMWebhook(submission);

      return {
        ok: true,
        next: result.next
      };

    } catch (error) {
      // Track submission error
      this.trackSubmissionError(submission.formType, error as Error);
      
      sentryUtils.captureException(error as Error, {
        tags: {
          service: 'formspree',
          formType: submission.formType
        },
        extra: {
          formData: submission.data,
          metadata: submission.metadata
        }
      });

      throw error;
    }
  }

  private getFormId(formType: string): string {
    const formIds = apiConfig.formspree.formIds;
    return formIds[formType as keyof typeof formIds] || formIds.contact;
  }

  private generateSubject(formType: string, data: any): string {
    const subjects = {
      contact: `Nueva consulta de ${data.name || 'Cliente'} - Piscinas Andinas`,
      quote: `Solicitud de cotización de ${data.name || 'Cliente'} - ${data.poolType || 'Piscina'}`,
      newsletter: `Nueva suscripción al newsletter - ${data.email}`,
      technicalVisit: `Solicitud de visita técnica - ${data.name || 'Cliente'} en ${data.location || 'Ubicación'}`
    };
    
    return subjects[formType as keyof typeof subjects] || subjects.contact;
  }

  private trackSubmissionSuccess(formType: string, data: any): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submit_success', {
        event_category: 'forms',
        event_label: formType,
        value: this.calculateLeadValue(formType, data)
      });
    }
  }

  private trackSubmissionError(formType: string, error: Error): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submit_error', {
        event_category: 'forms',
        event_label: formType,
        custom_parameter_1: error.message
      });
    }
  }

  private calculateLeadValue(formType: string, data: any): number {
    const baseValues = {
      contact: 50,
      quote: 200,
      newsletter: 25,
      technicalVisit: 300
    };

    let value = baseValues[formType as keyof typeof baseValues] || 50;

    // Increase value based on budget range
    if (data.budget) {
      if (data.budget.includes('50.000.000')) value *= 3;
      else if (data.budget.includes('35.000.000')) value *= 2;
      else if (data.budget.includes('25.000.000')) value *= 1.5;
    }

    // Increase value for urgent timeline
    if (data.timeline === 'Lo antes posible') {
      value *= 1.5;
    }

    return Math.round(value);
  }

  private async triggerCRMWebhook(submission: FormSubmissionData): Promise<void> {
    if (!apiConfig.crm.webhookUrl || apiConfig.crm.webhookUrl.includes('your-webhook')) {
      return;
    }

    try {
      const webhookPayload = {
        leadData: {
          ...submission.data,
          formType: submission.formType,
          leadValue: this.calculateLeadValue(submission.formType, submission.data),
          source: 'website',
          timestamp: new Date().toISOString()
        },
        metadata: submission.metadata,
        scoring: {
          initialScore: this.calculateInitialLeadScore(submission),
          factors: this.getLeadScoringFactors(submission)
        }
      };

      const response = await fetch(apiConfig.crm.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.crm.apiKey}`,
          'X-Source': 'piscinas-andinas-website'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`CRM webhook failed: ${response.status}`);
      }

    } catch (error) {
      console.warn('CRM webhook failed:', error);
      sentryUtils.captureException(error as Error, {
        tags: { service: 'crm_webhook' }
      });
    }
  }

  private calculateInitialLeadScore(submission: FormSubmissionData): number {
    let score = 0;
    const data = submission.data;

    // Form type scoring
    const formTypeScores = {
      technicalVisit: 50,
      quote: 40,
      contact: 30,
      newsletter: 10
    };
    score += formTypeScores[submission.formType] || 0;

    // Budget scoring
    if (data.budget) {
      if (data.budget.includes('50.000.000')) score += 30;
      else if (data.budget.includes('35.000.000')) score += 25;
      else if (data.budget.includes('25.000.000')) score += 20;
      else score += 10;
    }

    // Timeline urgency
    if (data.timeline === 'Lo antes posible') score += 25;
    else if (data.timeline === 'Próximos 3 meses') score += 15;
    else if (data.timeline === 'Próximos 6 meses') score += 10;

    // Location premium areas
    if (data.location) {
      const premiumAreas = ['las condes', 'vitacura', 'lo barnechea', 'la dehesa'];
      if (premiumAreas.some(area => data.location.toLowerCase().includes(area))) {
        score += 15;
      }
    }

    // Pool type preference
    if (data.poolType) {
      if (data.poolType.includes('Infinity')) score += 20;
      else if (data.poolType.includes('Prestige')) score += 15;
      else if (data.poolType.includes('Elegance')) score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  private getLeadScoringFactors(submission: FormSubmissionData): Record<string, any> {
    return {
      formType: submission.formType,
      hasPhoneNumber: !!submission.data.phone,
      hasLocation: !!submission.data.location,
      hasBudget: !!submission.data.budget,
      hasTimeline: !!submission.data.timeline,
      messageLength: submission.data.message?.length || 0,
      visitRequested: submission.data.visitRequest || false,
      metadata: submission.metadata
    };
  }
}

export const formspreeService = new FormspreeService();