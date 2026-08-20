// Configuración centralizada de APIs y servicios externos
export interface APIConfig {
  formspree: {
    endpoint: string;
    formIds: {
      contact: string;
      quote: string;
      newsletter: string;
      technicalVisit: string;
    };
    apiKey?: string;
  };
  googleAnalytics: {
    measurementId: string;
    apiSecret?: string;
    conversionIds: {
      leadGeneration: string;
      quoteRequest: string;
      technicalVisit: string;
      purchase: string;
    };
  };
  facebookPixel: {
    pixelId: string;
    accessToken?: string;
    testEventCode?: string;
    conversionApiUrl: string;
  };
  crm: {
    webhookUrl: string;
    apiKey: string;
    leadScoringEndpoint: string;
    automationTriggers: {
      newLead: string;
      qualifiedLead: string;
      hotLead: string;
      customerConversion: string;
    };
  };
  aiChatbot: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    knowledgeBaseUrl: string;
    fallbackResponses: boolean;
    learningMode: boolean;
  };
  monitoring: {
    sentry: {
      dsn: string;
      environment: string;
      tracesSampleRate: number;
    };
    performanceBudget: {
      enabled: boolean;
      alertWebhook: string;
      thresholds: {
        lcp: number;
        fid: number;
        cls: number;
        bundleSize: number;
      };
    };
  };
}

export const apiConfig: APIConfig = {
  formspree: {
    endpoint: 'https://formspree.io/f',
    formIds: {
      contact: import.meta.env.VITE_FORMSPREE_CONTACT_ID || 'xpwagdkv',
      quote: import.meta.env.VITE_FORMSPREE_QUOTE_ID || 'xpwagdkv',
      newsletter: import.meta.env.VITE_FORMSPREE_NEWSLETTER_ID || 'xpwagdkv',
      technicalVisit: import.meta.env.VITE_FORMSPREE_VISIT_ID || 'xpwagdkv'
    },
    apiKey: import.meta.env.VITE_FORMSPREE_API_KEY
  },
  googleAnalytics: {
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    apiSecret: import.meta.env.VITE_GA_API_SECRET,
    conversionIds: {
      leadGeneration: import.meta.env.VITE_GA_CONVERSION_LEAD || 'AW-123456789/abc123',
      quoteRequest: import.meta.env.VITE_GA_CONVERSION_QUOTE || 'AW-123456789/def456',
      technicalVisit: import.meta.env.VITE_GA_CONVERSION_VISIT || 'AW-123456789/ghi789',
      purchase: import.meta.env.VITE_GA_CONVERSION_PURCHASE || 'AW-123456789/jkl012'
    }
  },
  facebookPixel: {
    pixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID || 'YOUR_FACEBOOK_PIXEL_ID',
    accessToken: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN,
    testEventCode: import.meta.env.VITE_FACEBOOK_TEST_EVENT_CODE,
    conversionApiUrl: 'https://graph.facebook.com/v18.0'
  },
  crm: {
    webhookUrl: import.meta.env.VITE_CRM_WEBHOOK_URL || 'https://hooks.zapier.com/hooks/catch/your-webhook',
    apiKey: import.meta.env.VITE_CRM_API_KEY || '',
    leadScoringEndpoint: import.meta.env.VITE_CRM_LEAD_SCORING_URL || '',
    automationTriggers: {
      newLead: import.meta.env.VITE_CRM_TRIGGER_NEW_LEAD || '',
      qualifiedLead: import.meta.env.VITE_CRM_TRIGGER_QUALIFIED || '',
      hotLead: import.meta.env.VITE_CRM_TRIGGER_HOT || '',
      customerConversion: import.meta.env.VITE_CRM_TRIGGER_CONVERSION || ''
    }
  },
  aiChatbot: {
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    anthropicApiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    knowledgeBaseUrl: import.meta.env.VITE_KNOWLEDGE_BASE_URL || '/api/knowledge-base',
    fallbackResponses: true,
    learningMode: import.meta.env.VITE_AI_LEARNING_MODE === 'true'
  },
  monitoring: {
    sentry: {
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.MODE || 'development',
      tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0
    },
    performanceBudget: {
      enabled: import.meta.env.VITE_PERFORMANCE_MONITORING === 'true',
      alertWebhook: import.meta.env.VITE_PERFORMANCE_ALERT_WEBHOOK || '',
      thresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        bundleSize: 300 * 1024
      }
    }
  }
};

// Validación de configuración
export const validateAPIConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validar Formspree
  if (!apiConfig.formspree.formIds.contact || apiConfig.formspree.formIds.contact === 'xpwagdkv') {
    errors.push('Formspree contact form ID not configured');
  }
  
  // Validar Google Analytics
  if (!apiConfig.googleAnalytics.measurementId || apiConfig.googleAnalytics.measurementId === 'G-XXXXXXXXXX') {
    errors.push('Google Analytics measurement ID not configured');
  }
  
  // Validar Facebook Pixel
  if (!apiConfig.facebookPixel.pixelId || apiConfig.facebookPixel.pixelId === 'YOUR_FACEBOOK_PIXEL_ID') {
    errors.push('Facebook Pixel ID not configured');
  }
  
  // Validar CRM
  if (!apiConfig.crm.webhookUrl || apiConfig.crm.webhookUrl.includes('your-webhook')) {
    errors.push('CRM webhook URL not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};