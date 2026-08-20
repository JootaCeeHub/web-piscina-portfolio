import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface FacebookPixelProps {
  pixelId: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    _fbq: any;
  }
}

const FacebookPixel: React.FC<FacebookPixelProps> = ({ 
  pixelId, 
  enabled = true 
}) => {
  const location = useLocation();

  useEffect(() => {
    if (!enabled || !pixelId || pixelId === 'YOUR_FACEBOOK_PIXEL_ID') {
      console.warn('Facebook Pixel not configured or disabled');
      return;
    }

    // Initialize Facebook Pixel
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
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');

    return () => {
      // Cleanup if needed
    };
  }, [pixelId, enabled]);

  // Track page views on route changes
  useEffect(() => {
    if (enabled && pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location, enabled, pixelId]);

  return null;
};

// Facebook Pixel utilities
export const facebookPixelUtils = {
  // Track standard events
  trackEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters);
    }
  },

  // Track custom events
  trackCustomEvent: (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackCustom', eventName, parameters);
    }
  },

  // E-commerce events
  trackPurchase: (value: number, currency: string = 'CLP', contentIds?: string[]) => {
    facebookPixelUtils.trackEvent('Purchase', {
      value,
      currency,
      content_ids: contentIds,
      content_type: 'product'
    });
  },

  trackAddToCart: (value: number, currency: string = 'CLP', contentId?: string) => {
    facebookPixelUtils.trackEvent('AddToCart', {
      value,
      currency,
      content_ids: contentId ? [contentId] : undefined,
      content_type: 'product'
    });
  },

  trackInitiateCheckout: (value: number, currency: string = 'CLP', numItems?: number) => {
    facebookPixelUtils.trackEvent('InitiateCheckout', {
      value,
      currency,
      num_items: numItems,
      content_type: 'product'
    });
  },

  // Lead generation events
  trackLead: (value?: number, currency: string = 'CLP') => {
    facebookPixelUtils.trackEvent('Lead', {
      value,
      currency,
      content_category: 'pool_quote'
    });
  },

  trackCompleteRegistration: (method?: string) => {
    facebookPixelUtils.trackEvent('CompleteRegistration', {
      registration_method: method || 'email'
    });
  },

  // Content engagement events
  trackViewContent: (contentType: string, contentId?: string, value?: number) => {
    facebookPixelUtils.trackEvent('ViewContent', {
      content_type: contentType,
      content_ids: contentId ? [contentId] : undefined,
      value,
      currency: 'CLP'
    });
  },

  trackSearch: (searchTerm: string, contentCategory?: string) => {
    facebookPixelUtils.trackEvent('Search', {
      search_string: searchTerm,
      content_category: contentCategory || 'pool_products'
    });
  },

  // Custom events for Multifibra L.A.
  trackPoolQuoteRequest: (poolModel: string, estimatedValue: number) => {
    facebookPixelUtils.trackCustomEvent('PoolQuoteRequest', {
      pool_model: poolModel,
      estimated_value: estimatedValue,
      currency: 'CLP',
      content_category: 'pool_quote'
    });
  },

  trackTechnicalVisitRequest: (location: string, poolType?: string) => {
    facebookPixelUtils.trackCustomEvent('TechnicalVisitRequest', {
      location,
      pool_type: poolType,
      content_category: 'technical_visit'
    });
  },

  trackWhatsAppClick: (source: string) => {
    facebookPixelUtils.trackCustomEvent('WhatsAppClick', {
      source,
      content_category: 'contact'
    });
  },

  trackCatalogDownload: (catalogType: string) => {
    facebookPixelUtils.trackCustomEvent('CatalogDownload', {
      catalog_type: catalogType,
      content_category: 'lead_magnet'
    });
  },

  trackNewsletterSignup: (interests: string[]) => {
    facebookPixelUtils.trackCustomEvent('NewsletterSignup', {
      interests: interests.join(','),
      content_category: 'email_marketing'
    });
  },

  // Advanced tracking
  trackTimeOnPage: (timeInSeconds: number, page: string) => {
    if (timeInSeconds > 30) { // Only track meaningful engagement
      facebookPixelUtils.trackCustomEvent('TimeOnPage', {
        time_seconds: timeInSeconds,
        page,
        content_category: 'engagement'
      });
    }
  },

  trackScrollDepth: (percentage: number, page: string) => {
    if (percentage >= 75) { // Track deep engagement
      facebookPixelUtils.trackCustomEvent('ScrollDepth', {
        scroll_percentage: percentage,
        page,
        content_category: 'engagement'
      });
    }
  },

  // Conversion value optimization
  trackHighValueAction: (action: string, value: number) => {
    facebookPixelUtils.trackCustomEvent('HighValueAction', {
      action,
      value,
      currency: 'CLP',
      content_category: 'high_intent'
    });
  }
};

export default FacebookPixel;