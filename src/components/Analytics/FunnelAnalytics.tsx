import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { sentryUtils } from '../../monitoring/sentry';

// Funnel step definitions
interface FunnelStep {
  id: string;
  name: string;
  page?: string;
  action?: string;
  element?: string;
  required?: boolean;
  weight?: number;
}

interface FunnelDefinition {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  conversionGoal: string;
}

interface UserJourneyEvent {
  id: string;
  stepId: string;
  funnelId: string;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface FunnelAnalyticsContextType {
  trackFunnelStep: (funnelId: string, stepId: string, metadata?: Record<string, any>) => void;
  trackConversion: (funnelId: string, value?: number, metadata?: Record<string, any>) => void;
  getUserJourney: (sessionId: string) => UserJourneyEvent[];
  getFunnelMetrics: (funnelId: string) => FunnelMetrics;
  startFunnel: (funnelId: string, metadata?: Record<string, any>) => void;
}

interface FunnelMetrics {
  totalSessions: number;
  conversions: number;
  conversionRate: number;
  stepConversions: Record<string, number>;
  dropoffRates: Record<string, number>;
  averageTimeToConvert: number;
  topDropoffPoints: Array<{ stepId: string; dropoffRate: number }>;
}

const FunnelAnalyticsContext = createContext<FunnelAnalyticsContextType | null>(null);

export const useFunnelAnalytics = () => {
  const context = useContext(FunnelAnalyticsContext);
  if (!context) {
    throw new Error('useFunnelAnalytics must be used within a FunnelAnalyticsProvider');
  }
  return context;
};

// Predefined funnels for Piscinas Andinas
const funnelDefinitions: FunnelDefinition[] = [
  {
    id: 'lead_generation',
    name: 'Lead Generation Funnel',
    description: 'Complete lead generation journey from landing to form submission',
    conversionGoal: 'form_submission',
    steps: [
      { id: 'landing', name: 'Landing Page Visit', page: '/', required: true, weight: 1 },
      { id: 'product_view', name: 'Product Catalog View', page: '/servicios', weight: 0.8 },
      { id: 'product_detail', name: 'Product Detail View', action: 'product_click', weight: 0.6 },
      { id: 'contact_page', name: 'Contact Page Visit', page: '/contacto', weight: 0.4 },
      { id: 'form_start', name: 'Form Interaction Start', action: 'form_start', weight: 0.3 },
      { id: 'form_submit', name: 'Form Submission', action: 'form_submit', required: true, weight: 0.2 }
    ]
  },
  {
    id: 'whatsapp_conversion',
    name: 'WhatsApp Conversion Funnel',
    description: 'Users who convert through WhatsApp channel',
    conversionGoal: 'whatsapp_click',
    steps: [
      { id: 'landing', name: 'Landing Page Visit', page: '/', required: true, weight: 1 },
      { id: 'engagement', name: 'Page Engagement', action: 'scroll_50', weight: 0.7 },
      { id: 'whatsapp_click', name: 'WhatsApp Click', action: 'whatsapp_click', required: true, weight: 0.3 }
    ]
  },
  {
    id: 'quote_request',
    name: 'Quote Request Funnel',
    description: 'Users requesting detailed quotes',
    conversionGoal: 'quote_request',
    steps: [
      { id: 'landing', name: 'Landing Page Visit', page: '/', required: true, weight: 1 },
      { id: 'product_browse', name: 'Product Browsing', page: '/servicios', weight: 0.8 },
      { id: 'price_view', name: 'Price Information View', action: 'price_click', weight: 0.6 },
      { id: 'quote_cta', name: 'Quote CTA Click', action: 'quote_cta_click', weight: 0.4 },
      { id: 'quote_form', name: 'Quote Form Start', action: 'quote_form_start', weight: 0.3 },
      { id: 'quote_submit', name: 'Quote Submission', action: 'quote_submit', required: true, weight: 0.2 }
    ]
  }
];

export const FunnelAnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionId] = useState(() => generateSessionId());
  const [userJourney, setUserJourney] = useState<UserJourneyEvent[]>([]);
  const [activeFunnels, setActiveFunnels] = useState<Set<string>>(new Set());
  const location = useLocation();

  useEffect(() => {
    // Auto-track page visits for relevant funnels
    trackPageVisit(location.pathname);
  }, [location]);

  const generateSessionId = (): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateEventId = (): string => {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const trackPageVisit = (pathname: string) => {
    funnelDefinitions.forEach(funnel => {
      const matchingSteps = funnel.steps.filter(step => step.page === pathname);
      matchingSteps.forEach(step => {
        if (step.id === 'landing' || activeFunnels.has(funnel.id)) {
          trackFunnelStep(funnel.id, step.id, { pathname, automatic: true });
        }
      });
    });
  };

  const startFunnel = (funnelId: string, metadata?: Record<string, any>) => {
    setActiveFunnels(prev => new Set([...prev, funnelId]));
    
    // Track funnel start
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'funnel_start', {
        event_category: 'funnel',
        event_label: funnelId,
        custom_parameter_1: 'funnel_analytics'
      });
    }

    sentryUtils.trackUserInteraction('funnel_start', funnelId, JSON.stringify(metadata));
  };

  const trackFunnelStep = (funnelId: string, stepId: string, metadata?: Record<string, any>) => {
    const event: UserJourneyEvent = {
      id: generateEventId(),
      stepId,
      funnelId,
      timestamp: new Date(),
      sessionId,
      metadata
    };

    setUserJourney(prev => [...prev, event]);
    
    // Ensure funnel is active
    setActiveFunnels(prev => new Set([...prev, funnelId]));

    // Store in localStorage for persistence
    const storedJourney = JSON.parse(localStorage.getItem('user_journey') || '[]');
    storedJourney.push(event);
    localStorage.setItem('user_journey', JSON.stringify(storedJourney.slice(-100))); // Keep last 100 events

    // Track in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'funnel_step', {
        event_category: 'funnel',
        event_label: `${funnelId}_${stepId}`,
        value: getFunnelStepWeight(funnelId, stepId),
        custom_parameter_1: funnelId,
        custom_parameter_2: stepId
      });
    }

    // Track in Sentry
    sentryUtils.trackUserInteraction('funnel_step', funnelId, stepId);

    console.log(`Funnel Step Tracked: ${funnelId} -> ${stepId}`, metadata);
  };

  const trackConversion = (funnelId: string, value?: number, metadata?: Record<string, any>) => {
    const funnel = funnelDefinitions.find(f => f.id === funnelId);
    if (!funnel) return;

    // Track conversion step
    trackFunnelStep(funnelId, funnel.conversionGoal, { ...metadata, conversion: true, value });

    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: 'AW-CONVERSION-ID', // Replace with actual conversion ID
        value: value || 1,
        currency: 'CLP',
        event_category: 'funnel_conversion',
        event_label: funnelId
      });
    }

    // Calculate conversion metrics
    const metrics = getFunnelMetrics(funnelId);
    console.log(`Conversion Tracked: ${funnelId}`, { value, metrics });

    sentryUtils.trackUserInteraction('funnel_conversion', funnelId, JSON.stringify({ value, ...metadata }));
  };

  const getFunnelStepWeight = (funnelId: string, stepId: string): number => {
    const funnel = funnelDefinitions.find(f => f.id === funnelId);
    const step = funnel?.steps.find(s => s.id === stepId);
    return Math.round((step?.weight || 0) * 100);
  };

  const getUserJourney = (sessionId: string): UserJourneyEvent[] => {
    return userJourney.filter(event => event.sessionId === sessionId);
  };

  const getFunnelMetrics = (funnelId: string): FunnelMetrics => {
    const funnel = funnelDefinitions.find(f => f.id === funnelId);
    if (!funnel) {
      return {
        totalSessions: 0,
        conversions: 0,
        conversionRate: 0,
        stepConversions: {},
        dropoffRates: {},
        averageTimeToConvert: 0,
        topDropoffPoints: []
      };
    }

    const funnelEvents = userJourney.filter(event => event.funnelId === funnelId);
    const sessions = new Set(funnelEvents.map(event => event.sessionId));
    const totalSessions = sessions.size;

    // Calculate step conversions
    const stepConversions: Record<string, number> = {};
    const sessionSteps: Record<string, Set<string>> = {};

    funnelEvents.forEach(event => {
      if (!sessionSteps[event.sessionId]) {
        sessionSteps[event.sessionId] = new Set();
      }
      sessionSteps[event.sessionId].add(event.stepId);
    });

    funnel.steps.forEach(step => {
      stepConversions[step.id] = Array.from(sessions).filter(sessionId => 
        sessionSteps[sessionId]?.has(step.id)
      ).length;
    });

    // Calculate dropoff rates
    const dropoffRates: Record<string, number> = {};
    for (let i = 0; i < funnel.steps.length - 1; i++) {
      const currentStep = funnel.steps[i];
      const nextStep = funnel.steps[i + 1];
      const currentStepSessions = stepConversions[currentStep.id];
      const nextStepSessions = stepConversions[nextStep.id];
      
      if (currentStepSessions > 0) {
        dropoffRates[currentStep.id] = ((currentStepSessions - nextStepSessions) / currentStepSessions) * 100;
      }
    }

    // Calculate conversions (users who completed the conversion goal)
    const conversions = stepConversions[funnel.conversionGoal] || 0;
    const conversionRate = totalSessions > 0 ? (conversions / totalSessions) * 100 : 0;

    // Calculate average time to convert
    const conversionEvents = funnelEvents.filter(event => 
      event.stepId === funnel.conversionGoal && event.metadata?.conversion
    );
    
    let totalConversionTime = 0;
    conversionEvents.forEach(conversionEvent => {
      const sessionEvents = funnelEvents.filter(event => 
        event.sessionId === conversionEvent.sessionId
      ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (sessionEvents.length > 1) {
        const firstEvent = sessionEvents[0];
        const conversionTime = conversionEvent.timestamp.getTime() - firstEvent.timestamp.getTime();
        totalConversionTime += conversionTime;
      }
    });

    const averageTimeToConvert = conversions > 0 ? totalConversionTime / conversions / 1000 : 0; // in seconds

    // Top dropoff points
    const topDropoffPoints = Object.entries(dropoffRates)
      .map(([stepId, dropoffRate]) => ({ stepId, dropoffRate }))
      .sort((a, b) => b.dropoffRate - a.dropoffRate)
      .slice(0, 3);

    return {
      totalSessions,
      conversions,
      conversionRate,
      stepConversions,
      dropoffRates,
      averageTimeToConvert,
      topDropoffPoints
    };
  };

  return (
    <FunnelAnalyticsContext.Provider value={{
      trackFunnelStep,
      trackConversion,
      getUserJourney,
      getFunnelMetrics,
      startFunnel
    }}>
      {children}
    </FunnelAnalyticsContext.Provider>
  );
};

// Hook for specific funnel tracking
export const useLeadGenerationFunnel = () => {
  const { trackFunnelStep, trackConversion, getFunnelMetrics } = useFunnelAnalytics();
  
  return {
    trackProductView: (productId: string) => 
      trackFunnelStep('lead_generation', 'product_view', { productId }),
    trackProductDetail: (productId: string) => 
      trackFunnelStep('lead_generation', 'product_detail', { productId }),
    trackContactPage: () => 
      trackFunnelStep('lead_generation', 'contact_page'),
    trackFormStart: (formType: string) => 
      trackFunnelStep('lead_generation', 'form_start', { formType }),
    trackFormSubmit: (formType: string, leadValue?: number) => {
      trackFunnelStep('lead_generation', 'form_submit', { formType });
      trackConversion('lead_generation', leadValue, { formType });
    },
    getMetrics: () => getFunnelMetrics('lead_generation')
  };
};

export const useWhatsAppFunnel = () => {
  const { trackFunnelStep, trackConversion, getFunnelMetrics } = useFunnelAnalytics();
  
  return {
    trackEngagement: (engagementType: string) => 
      trackFunnelStep('whatsapp_conversion', 'engagement', { engagementType }),
    trackWhatsAppClick: (source: string) => {
      trackFunnelStep('whatsapp_conversion', 'whatsapp_click', { source });
      trackConversion('whatsapp_conversion', 1, { source });
    },
    getMetrics: () => getFunnelMetrics('whatsapp_conversion')
  };
};

export default FunnelAnalyticsProvider;