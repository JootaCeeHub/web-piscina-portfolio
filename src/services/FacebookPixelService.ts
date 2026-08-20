import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface FacebookEvent {
  eventName: string;
  parameters?: Record<string, any>;
  customData?: Record<string, any>;
  userData?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface FacebookConversionEvent {
  eventName: string;
  eventTime: number;
  userData: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    fn?: string; // hashed first name
    ln?: string; // hashed last name
    ct?: string; // hashed city
    st?: string; // hashed state
    country?: string;
    zp?: string; // hashed zip code
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // Facebook click ID
    fbp?: string; // Facebook browser ID
  };
  customData?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_type?: string;
    content_name?: string;
    content_category?: string;
    num_items?: number;
    predicted_ltv?: number;
    custom_properties?: Record<string, any>;
  };
  actionSource: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
}

class FacebookPixelService {
  private pixelId = apiConfig.facebookPixel.pixelId;
  private accessToken = apiConfig.facebookPixel.accessToken;
  private testEventCode = apiConfig.facebookPixel.testEventCode;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    if (!this.pixelId || this.pixelId === 'YOUR_FACEBOOK_PIXEL_ID') {
      console.warn('Facebook Pixel ID not configured');
      return;
    }

    // Load Facebook Pixel
    (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function(...args: any[]) {
        n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Initialize pixel
    window.fbq('init', this.pixelId, {
      autoConfig: true,
      debug: import.meta.env.MODE === 'development'
    });

    // Track page view
    window.fbq('track', 'PageView');

    // Set up advanced matching if available
    this.setupAdvancedMatching();

    this.isInitialized = true;
    console.log('Facebook Pixel initialized successfully');
  }

  private setupAdvancedMatching(): void {
    // Get user data from localStorage or other sources
    const userData = this.getUserData();
    if (userData && Object.keys(userData).length > 0) {
      window.fbq('init', this.pixelId, userData);
    }
  }

  private getUserData(): Record<string, any> | null {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        return {
          em: userData.email ? this.hashData(userData.email) : undefined,
          ph: userData.phone ? this.hashData(userData.phone) : undefined,
          fn: userData.firstName ? this.hashData(userData.firstName) : undefined,
          ln: userData.lastName ? this.hashData(userData.lastName) : undefined
        };
      }
    } catch (error) {
      console.warn('Failed to get user data for advanced matching:', error);
    }
    return null;
  }

  trackEvent(event: FacebookEvent): void {
    if (!this.isInitialized) return;

    const eventData = {
      ...event.parameters,
      ...event.customData
    };

    window.fbq('track', event.eventName, eventData);

    // Also send to Conversions API if configured
    if (this.accessToken) {
      this.sendToConversionsAPI({
        eventName: event.eventName,
        eventTime: Math.floor(Date.now() / 1000),
        userData: this.prepareUserDataForAPI(event.userData),
        customData: event.customData,
        actionSource: 'website'
      });
    }
  }

  trackCustomEvent(eventName: string, parameters?: Record<string, any>): void {
    if (!this.isInitialized) return;

    window.fbq('trackCustom', eventName, parameters);

    // Send to Conversions API
    if (this.accessToken) {
      this.sendToConversionsAPI({
        eventName,
        eventTime: Math.floor(Date.now() / 1000),
        userData: this.prepareUserDataForAPI(),
        customData: parameters,
        actionSource: 'website'
      });
    }
  }

  // Standard e-commerce events
  trackPurchase(value: number, currency: string = 'CLP', contentIds?: string[]): void {
    this.trackEvent({
      eventName: 'Purchase',
      parameters: {
        value,
        currency,
        content_ids: contentIds,
        content_type: 'product'
      }
    });
  }

  trackLead(value?: number, currency: string = 'CLP'): void {
    this.trackEvent({
      eventName: 'Lead',
      parameters: {
        value,
        currency,
        content_category: 'pool_quote'
      }
    });
  }

  trackCompleteRegistration(method?: string): void {
    this.trackEvent({
      eventName: 'CompleteRegistration',
      parameters: {
        registration_method: method || 'email'
      }
    });
  }

  trackViewContent(contentType: string, contentId?: string, value?: number): void {
    this.trackEvent({
      eventName: 'ViewContent',
      parameters: {
        content_type: contentType,
        content_ids: contentId ? [contentId] : undefined,
        value,
        currency: 'CLP'
      }
    });
  }

  trackSearch(searchTerm: string, contentCategory?: string): void {
    this.trackEvent({
      eventName: 'Search',
      parameters: {
        search_string: searchTerm,
        content_category: contentCategory || 'pool_products'
      }
    });
  }

  trackInitiateCheckout(value: number, currency: string = 'CLP', numItems?: number): void {
    this.trackEvent({
      eventName: 'InitiateCheckout',
      parameters: {
        value,
        currency,
        num_items: numItems,
        content_type: 'product'
      }
    });
  }

  // Custom events for Multifibra L.A.
  trackPoolQuoteRequest(poolModel: string, estimatedValue: number): void {
    this.trackCustomEvent('PoolQuoteRequest', {
      pool_model: poolModel,
      estimated_value: estimatedValue,
      currency: 'CLP',
      content_category: 'pool_quote'
    });
  }

  trackTechnicalVisitRequest(location: string, poolType?: string): void {
    this.trackCustomEvent('TechnicalVisitRequest', {
      location,
      pool_type: poolType,
      content_category: 'technical_visit'
    });
  }

  trackWhatsAppClick(source: string): void {
    this.trackCustomEvent('WhatsAppClick', {
      source,
      content_category: 'contact'
    });
  }

  trackCatalogDownload(catalogType: string): void {
    this.trackCustomEvent('CatalogDownload', {
      catalog_type: catalogType,
      content_category: 'lead_magnet'
    });
  }

  trackNewsletterSignup(interests: string[]): void {
    this.trackCustomEvent('NewsletterSignup', {
      interests: interests.join(','),
      content_category: 'email_marketing'
    });
  }

  // Conversions API for server-side tracking
  private async sendToConversionsAPI(event: FacebookConversionEvent): Promise<void> {
    if (!this.accessToken) return;

    try {
      const url = `${apiConfig.facebookPixel.conversionApiUrl}/${this.pixelId}/events`;
      
      const payload = {
        data: [event],
        test_event_code: this.testEventCode
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Conversions API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.events_received !== 1) {
        console.warn('Conversions API warning:', result);
      }

    } catch (error) {
      console.warn('Conversions API failed:', error);
      sentryUtils.captureException(error as Error, {
        tags: { service: 'facebook_conversions_api' }
      });
    }
  }

  private prepareUserDataForAPI(userData?: FacebookEvent['userData']): FacebookConversionEvent['userData'] {
    const result: FacebookConversionEvent['userData'] = {
      client_ip_address: this.getClientIP(),
      client_user_agent: navigator.userAgent,
      fbc: this.getFacebookClickId(),
      fbp: this.getFacebookBrowserId()
    };

    if (userData) {
      if (userData.email) result.em = this.hashData(userData.email);
      if (userData.phone) result.ph = this.hashData(userData.phone);
      if (userData.firstName) result.fn = this.hashData(userData.firstName);
      if (userData.lastName) result.ln = this.hashData(userData.lastName);
      if (userData.city) result.ct = this.hashData(userData.city);
      if (userData.state) result.st = this.hashData(userData.state);
      if (userData.country) result.country = userData.country;
      if (userData.zipCode) result.zp = this.hashData(userData.zipCode);
    }

    return result;
  }

  private hashData(data: string): string {
    // Simple hash function for demo - in production use crypto.subtle.digest
    return btoa(data.toLowerCase().trim());
  }

  private getClientIP(): string {
    // This would typically be set by your server
    return ''; // Facebook will use the request IP
  }

  private getFacebookClickId(): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('fbclid') || undefined;
  }

  private getFacebookBrowserId(): string | undefined {
    // Get from Facebook pixel cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbp') {
        return value;
      }
    }
    return undefined;
  }

  // Set user data for advanced matching
  setUserData(userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  }): void {
    try {
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Update advanced matching
      if (this.isInitialized) {
        const hashedUserData = {
          em: userData.email ? this.hashData(userData.email) : undefined,
          ph: userData.phone ? this.hashData(userData.phone) : undefined,
          fn: userData.firstName ? this.hashData(userData.firstName) : undefined,
          ln: userData.lastName ? this.hashData(userData.lastName) : undefined
        };
        
        window.fbq('init', this.pixelId, hashedUserData);
      }
    } catch (error) {
      console.warn('Failed to set user data:', error);
    }
  }
}

export const facebookPixelService = new FacebookPixelService();