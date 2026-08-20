import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface GAConversion {
  conversionId: string;
  value?: number;
  currency?: string;
  transactionId?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

export interface GAEnhancedEcommerce {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    item_category: string;
    item_variant?: string;
    price: number;
    quantity: number;
  }>;
}

class GoogleAnalyticsService {
  private measurementId = apiConfig.googleAnalytics.measurementId;
  private apiSecret = apiConfig.googleAnalytics.apiSecret;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true,
      anonymize_ip: true,
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
      cookie_flags: 'SameSite=None;Secure',
      custom_map: {
        custom_parameter_1: 'lead_source',
        custom_parameter_2: 'lead_score',
        custom_parameter_3: 'ab_test_variant',
        custom_parameter_4: 'user_segment'
      }
    });

    // Enhanced ecommerce setup
    window.gtag('config', this.measurementId, {
      enhanced_ecommerce: true
    });

    this.isInitialized = true;
    console.log('Google Analytics initialized successfully');
  }

  trackPageView(path: string, title?: string): void {
    if (!this.isInitialized) return;

    window.gtag('config', this.measurementId, {
      page_path: path,
      page_title: title || document.title,
      page_location: window.location.href
    });

    // Track page engagement
    this.trackEvent({
      action: 'page_view',
      category: 'engagement',
      label: path
    });
  }

  trackEvent(event: GAEvent): void {
    if (!this.isInitialized) return;

    const eventData: Record<string, any> = {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    };

    // Add custom parameters
    if (event.customParameters) {
      Object.entries(event.customParameters).forEach(([key, value], index) => {
        eventData[`custom_parameter_${index + 1}`] = value;
      });
    }

    window.gtag('event', event.action, eventData);
  }

  trackConversion(conversion: GAConversion): void {
    if (!this.isInitialized) return;

    const conversionData: Record<string, any> = {
      send_to: conversion.conversionId,
      value: conversion.value || 1,
      currency: conversion.currency || 'CLP',
      transaction_id: conversion.transactionId || this.generateTransactionId()
    };

    if (conversion.items) {
      conversionData.items = conversion.items;
    }

    window.gtag('event', 'conversion', conversionData);

    // Also track as purchase for enhanced ecommerce
    if (conversion.value && conversion.items) {
      this.trackPurchase({
        currency: conversion.currency || 'CLP',
        value: conversion.value,
        items: conversion.items.map(item => ({
          item_id: item.item_id,
          item_name: item.item_name,
          item_category: item.category,
          price: item.price,
          quantity: item.quantity
        }))
      });
    }
  }

  trackPurchase(ecommerce: GAEnhancedEcommerce): void {
    if (!this.isInitialized) return;

    window.gtag('event', 'purchase', {
      transaction_id: this.generateTransactionId(),
      value: ecommerce.value,
      currency: ecommerce.currency,
      items: ecommerce.items
    });
  }

  trackLeadGeneration(leadData: {
    formType: string;
    leadValue: number;
    leadScore: number;
    source: string;
    poolType?: string;
    budget?: string;
    location?: string;
  }): void {
    // Track as conversion
    this.trackConversion({
      conversionId: apiConfig.googleAnalytics.conversionIds.leadGeneration,
      value: leadData.leadValue,
      currency: 'CLP'
    });

    // Track detailed lead event
    this.trackEvent({
      action: 'generate_lead',
      category: 'lead_generation',
      label: leadData.formType,
      value: leadData.leadValue,
      customParameters: {
        lead_source: leadData.source,
        lead_score: leadData.leadScore,
        pool_type: leadData.poolType,
        budget_range: leadData.budget,
        location: leadData.location
      }
    });

    // Track as enhanced ecommerce event
    window.gtag('event', 'generate_lead', {
      currency: 'CLP',
      value: leadData.leadValue,
      items: [{
        item_id: `lead_${leadData.formType}`,
        item_name: `Lead - ${leadData.formType}`,
        item_category: 'lead_generation',
        price: leadData.leadValue,
        quantity: 1
      }]
    });
  }

  trackQuoteRequest(quoteData: {
    poolModel: string;
    estimatedValue: number;
    location: string;
    timeline: string;
  }): void {
    this.trackConversion({
      conversionId: apiConfig.googleAnalytics.conversionIds.quoteRequest,
      value: quoteData.estimatedValue,
      currency: 'CLP'
    });

    this.trackEvent({
      action: 'request_quote',
      category: 'conversion',
      label: quoteData.poolModel,
      value: quoteData.estimatedValue,
      customParameters: {
        pool_model: quoteData.poolModel,
        location: quoteData.location,
        timeline: quoteData.timeline
      }
    });
  }

  trackTechnicalVisit(visitData: {
    location: string;
    poolType: string;
    urgency: string;
  }): void {
    this.trackConversion({
      conversionId: apiConfig.googleAnalytics.conversionIds.technicalVisit,
      value: 300, // Standard technical visit value
      currency: 'CLP'
    });

    this.trackEvent({
      action: 'schedule_visit',
      category: 'conversion',
      label: visitData.poolType,
      value: 300,
      customParameters: {
        location: visitData.location,
        pool_type: visitData.poolType,
        urgency: visitData.urgency
      }
    });
  }

  trackUserEngagement(engagementData: {
    engagementType: string;
    duration?: number;
    depth?: number;
    interactions?: number;
  }): void {
    this.trackEvent({
      action: 'user_engagement',
      category: 'engagement',
      label: engagementData.engagementType,
      value: engagementData.duration || engagementData.depth || engagementData.interactions,
      customParameters: {
        engagement_type: engagementData.engagementType,
        duration: engagementData.duration,
        scroll_depth: engagementData.depth,
        interactions: engagementData.interactions
      }
    });
  }

  trackABTestConversion(testData: {
    testId: string;
    variantId: string;
    conversionType: string;
    value?: number;
  }): void {
    this.trackEvent({
      action: 'ab_test_conversion',
      category: 'ab_testing',
      label: `${testData.testId}_${testData.variantId}`,
      value: testData.value,
      customParameters: {
        test_id: testData.testId,
        variant_id: testData.variantId,
        conversion_type: testData.conversionType
      }
    });
  }

  // Server-side tracking via Measurement Protocol
  async trackServerSideEvent(event: {
    clientId: string;
    eventName: string;
    parameters: Record<string, any>;
  }): Promise<void> {
    if (!this.apiSecret) {
      console.warn('GA4 API Secret not configured for server-side tracking');
      return;
    }

    try {
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: event.clientId,
            events: [{
              name: event.eventName,
              params: event.parameters
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Server-side tracking failed: ${response.status}`);
      }

    } catch (error) {
      sentryUtils.captureException(error as Error, {
        tags: { service: 'google_analytics_server' }
      });
    }
  }

  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get client ID for server-side tracking
  getClientId(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        resolve(this.generateClientId());
        return;
      }

      window.gtag('get', this.measurementId, 'client_id', (clientId: string) => {
        resolve(clientId || this.generateClientId());
      });
    });
  }

  private generateClientId(): string {
    return `${Date.now()}.${Math.random().toString().substr(2)}`;
  }
}

export const googleAnalyticsService = new GoogleAnalyticsService();