import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface LeadData {
  id: string;
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  projectInfo: {
    poolType?: string;
    budget?: string;
    timeline?: string;
    message: string;
    visitRequested: boolean;
  };
  source: {
    formType: string;
    page: string;
    referrer: string;
    utmParams?: Record<string, string>;
    sessionId: string;
  };
  scoring: {
    initialScore: number;
    factors: Record<string, any>;
    grade: 'A' | 'B' | 'C' | 'D';
    priority: 'hot' | 'warm' | 'cold';
  };
  metadata: {
    timestamp: string;
    userAgent: string;
    ipAddress?: string;
    abTestVariants?: Record<string, string>;
    leadValue: number;
  };
}

export interface CRMResponse {
  success: boolean;
  leadId?: string;
  score?: number;
  nextActions?: string[];
  assignedTo?: string;
  followUpDate?: string;
  errors?: string[];
}

export interface AutomationTrigger {
  type: 'email' | 'sms' | 'call' | 'task' | 'notification';
  template: string;
  delay?: number; // minutes
  conditions?: Record<string, any>;
}

class CRMIntegrationService {
  private webhookUrl = apiConfig.crm.webhookUrl;
  private apiKey = apiConfig.crm.apiKey;
  private leadScoringEndpoint = apiConfig.crm.leadScoringEndpoint;

  async submitLead(leadData: LeadData): Promise<CRMResponse> {
    if (!this.webhookUrl || this.webhookUrl.includes('your-webhook')) {
      console.warn('CRM webhook not configured');
      return { success: false, errors: ['CRM not configured'] };
    }

    try {
      // Enrich lead data
      const enrichedLead = await this.enrichLeadData(leadData);
      
      // Submit to primary CRM webhook
      const response = await this.sendToWebhook(enrichedLead);
      
      // Trigger automation workflows
      await this.triggerAutomations(enrichedLead);
      
      // Update lead scoring
      if (response.success && response.leadId) {
        await this.updateLeadScoring(response.leadId, enrichedLead.scoring);
      }
      
      return response;

    } catch (error) {
      sentryUtils.captureException(error as Error, {
        tags: { service: 'crm_integration' },
        extra: { leadData }
      });
      
      return {
        success: false,
        errors: [(error as Error).message]
      };
    }
  }

  private async sendToWebhook(leadData: LeadData): Promise<CRMResponse> {
    const payload = {
      lead: leadData,
      webhook_version: '2.0',
      source: 'piscinasandinas_website',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'X-Source': 'piscinas-andinas-website',
        'X-Lead-Score': leadData.scoring.initialScore.toString(),
        'X-Lead-Priority': leadData.scoring.priority
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`CRM webhook failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      leadId: result.lead_id || result.id,
      score: result.score,
      nextActions: result.next_actions,
      assignedTo: result.assigned_to,
      followUpDate: result.follow_up_date
    };
  }

  private async enrichLeadData(leadData: LeadData): Promise<LeadData> {
    // Add geolocation data
    const geoData = await this.getGeolocationData(leadData.personalInfo.location);
    
    // Add company enrichment
    const companyData = await this.getCompanyData(leadData.personalInfo.email);
    
    // Add behavioral data
    const behavioralData = this.getBehavioralData(leadData.source.sessionId);
    
    return {
      ...leadData,
      enrichment: {
        geolocation: geoData,
        company: companyData,
        behavioral: behavioralData,
        enrichedAt: new Date().toISOString()
      }
    } as any;
  }

  private async getGeolocationData(location: string): Promise<any> {
    try {
      // Simple geolocation enrichment
      const premiumAreas = [
        'las condes', 'vitacura', 'lo barnechea', 'la dehesa',
        'providencia', 'ñuñoa', 'san miguel'
      ];
      
      const isPremiumArea = premiumAreas.some(area => 
        location.toLowerCase().includes(area)
      );
      
      return {
        isPremiumArea,
        region: this.getRegionFromLocation(location),
        marketSegment: isPremiumArea ? 'premium' : 'standard'
      };
    } catch (error) {
      return { error: 'Geolocation enrichment failed' };
    }
  }

  private async getCompanyData(email: string): Promise<any> {
    try {
      const domain = email.split('@')[1];
      const commonDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'outlook.com'];
      
      return {
        domain,
        isPersonalEmail: commonDomains.includes(domain),
        isPotentialBusiness: !commonDomains.includes(domain)
      };
    } catch (error) {
      return { error: 'Company enrichment failed' };
    }
  }

  private getBehavioralData(sessionId: string): any {
    try {
      const storedJourney = localStorage.getItem('user_journey');
      if (storedJourney) {
        const journey = JSON.parse(storedJourney);
        const sessionEvents = journey.filter((event: any) => 
          event.sessionId === sessionId
        );
        
        return {
          pageViews: sessionEvents.length,
          timeOnSite: this.calculateTimeOnSite(sessionEvents),
          pagesVisited: [...new Set(sessionEvents.map((e: any) => e.page))],
          engagementScore: this.calculateEngagementScore(sessionEvents)
        };
      }
    } catch (error) {
      console.warn('Failed to get behavioral data:', error);
    }
    
    return { error: 'Behavioral data not available' };
  }

  private calculateTimeOnSite(events: any[]): number {
    if (events.length < 2) return 0;
    
    const firstEvent = new Date(events[0].timestamp);
    const lastEvent = new Date(events[events.length - 1].timestamp);
    
    return Math.round((lastEvent.getTime() - firstEvent.getTime()) / 1000);
  }

  private calculateEngagementScore(events: any[]): number {
    let score = 0;
    
    // Base score for page views
    score += events.length * 5;
    
    // Bonus for form interactions
    const formEvents = events.filter((e: any) => e.action?.includes('form'));
    score += formEvents.length * 20;
    
    // Bonus for time on site
    const timeOnSite = this.calculateTimeOnSite(events);
    if (timeOnSite > 300) score += 30; // 5+ minutes
    else if (timeOnSite > 120) score += 20; // 2+ minutes
    else if (timeOnSite > 60) score += 10; // 1+ minute
    
    return Math.min(score, 100);
  }

  private getRegionFromLocation(location: string): string {
    const regionMap: Record<string, string> = {
      'santiago': 'Región Metropolitana',
      'las condes': 'Región Metropolitana',
      'vitacura': 'Región Metropolitana',
      'providencia': 'Región Metropolitana',
      'valparaíso': 'Región de Valparaíso',
      'viña del mar': 'Región de Valparaíso',
      'concepción': 'Región del Biobío',
      'temuco': 'Región de La Araucanía',
      'puerto montt': 'Región de Los Lagos'
    };
    
    const locationLower = location.toLowerCase();
    for (const [key, region] of Object.entries(regionMap)) {
      if (locationLower.includes(key)) {
        return region;
      }
    }
    
    return 'Región no identificada';
  }

  private async triggerAutomations(leadData: LeadData): Promise<void> {
    const automations = this.getAutomationTriggers(leadData);
    
    for (const automation of automations) {
      try {
        await this.executeAutomation(automation, leadData);
      } catch (error) {
        console.warn('Automation trigger failed:', error);
      }
    }
  }

  private getAutomationTriggers(leadData: LeadData): AutomationTrigger[] {
    const triggers: AutomationTrigger[] = [];
    
    // Immediate welcome email
    triggers.push({
      type: 'email',
      template: 'welcome_lead',
      delay: 0
    });
    
    // High priority leads get immediate notification
    if (leadData.scoring.priority === 'hot') {
      triggers.push({
        type: 'notification',
        template: 'hot_lead_alert',
        delay: 0
      });
      
      triggers.push({
        type: 'task',
        template: 'schedule_immediate_call',
        delay: 5 // 5 minutes
      });
    }
    
    // Technical visit requests
    if (leadData.projectInfo.visitRequested) {
      triggers.push({
        type: 'task',
        template: 'schedule_technical_visit',
        delay: 30 // 30 minutes
      });
    }
    
    // Follow-up sequence based on lead score
    if (leadData.scoring.initialScore >= 70) {
      triggers.push({
        type: 'call',
        template: 'high_score_follow_up',
        delay: 60 // 1 hour
      });
    } else if (leadData.scoring.initialScore >= 40) {
      triggers.push({
        type: 'email',
        template: 'medium_score_nurture',
        delay: 120 // 2 hours
      });
    } else {
      triggers.push({
        type: 'email',
        template: 'low_score_education',
        delay: 1440 // 24 hours
      });
    }
    
    return triggers;
  }

  private async executeAutomation(automation: AutomationTrigger, leadData: LeadData): Promise<void> {
    const triggerUrl = this.getAutomationTriggerUrl(automation.type);
    if (!triggerUrl) return;
    
    const payload = {
      automation: automation,
      lead: leadData,
      executedAt: new Date().toISOString()
    };
    
    if (automation.delay && automation.delay > 0) {
      // Schedule for later execution
      setTimeout(async () => {
        await this.sendAutomationTrigger(triggerUrl, payload);
      }, automation.delay * 60 * 1000);
    } else {
      // Execute immediately
      await this.sendAutomationTrigger(triggerUrl, payload);
    }
  }

  private async sendAutomationTrigger(url: string, payload: any): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Automation trigger failed: ${response.status}`);
      }
    } catch (error) {
      sentryUtils.captureException(error as Error, {
        tags: { service: 'crm_automation' }
      });
    }
  }

  private getAutomationTriggerUrl(type: string): string | null {
    const triggers = apiConfig.crm.automationTriggers;
    return triggers[type as keyof typeof triggers] || null;
  }

  private async updateLeadScoring(leadId: string, scoring: LeadData['scoring']): Promise<void> {
    if (!this.leadScoringEndpoint) return;
    
    try {
      await fetch(this.leadScoringEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          lead_id: leadId,
          score: scoring.initialScore,
          grade: scoring.grade,
          priority: scoring.priority,
          factors: scoring.factors,
          updated_at: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Lead scoring update failed:', error);
    }
  }

  // Webhook for receiving CRM updates
  async handleCRMWebhook(webhookData: any): Promise<void> {
    try {
      const { event_type, lead_id, data } = webhookData;
      
      switch (event_type) {
        case 'lead_updated':
          await this.handleLeadUpdate(lead_id, data);
          break;
        case 'lead_assigned':
          await this.handleLeadAssignment(lead_id, data);
          break;
        case 'follow_up_scheduled':
          await this.handleFollowUpScheduled(lead_id, data);
          break;
        case 'lead_converted':
          await this.handleLeadConversion(lead_id, data);
          break;
      }
    } catch (error) {
      sentryUtils.captureException(error as Error, {
        tags: { service: 'crm_webhook_handler' }
      });
    }
  }

  private async handleLeadUpdate(leadId: string, data: any): Promise<void> {
    // Update local lead data if needed
    console.log('Lead updated:', leadId, data);
  }

  private async handleLeadAssignment(leadId: string, data: any): Promise<void> {
    // Notify about lead assignment
    console.log('Lead assigned:', leadId, data);
  }

  private async handleFollowUpScheduled(leadId: string, data: any): Promise<void> {
    // Handle follow-up scheduling
    console.log('Follow-up scheduled:', leadId, data);
  }

  private async handleLeadConversion(leadId: string, data: any): Promise<void> {
    // Track conversion in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: apiConfig.googleAnalytics.conversionIds.purchase,
        value: data.value || 0,
        currency: 'CLP',
        transaction_id: leadId
      });
    }
    
    console.log('Lead converted:', leadId, data);
  }
}

export const crmIntegrationService = new CRMIntegrationService();