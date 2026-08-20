import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sentryUtils } from '../../monitoring/sentry';

interface ABTest {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number;
    config: Record<string, any>;
  }[];
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
}

interface ABTestContextType {
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, conversionType: string, value?: number) => void;
  isTestActive: (testId: string) => boolean;
  getTestConfig: (testId: string, variantId: string) => Record<string, any>;
}

const ABTestContext = createContext<ABTestContextType | null>(null);

export const useABTest = () => {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within an ABTestProvider');
  }
  return context;
};

interface ABTestProviderProps {
  children: ReactNode;
}

export const ABTestProvider: React.FC<ABTestProviderProps> = ({ children }) => {
  const [userVariants, setUserVariants] = useState<Record<string, string>>({});
  const [tests, setTests] = useState<ABTest[]>([]);

  // Define active A/B tests
  const activeTests: ABTest[] = [
    {
      id: 'hero_headline',
      name: 'Hero Section Headlines',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Original Headline',
          weight: 50,
          config: {
            headline: 'Piscinas de Fibra de Vidrio de Alto Estándar',
            subheadline: 'Fabricación e instalación de piscinas de lujo con tecnología de vanguardia. Durabilidad garantizada por 25 años y instalación en solo 7-10 días.'
          }
        },
        {
          id: 'variant_a',
          name: 'Benefit-Focused Headline',
          weight: 50,
          config: {
            headline: 'Tu Piscina de Ensueño en Solo 7 Días',
            subheadline: 'Instalación ultra-rápida, garantía 25 años y tecnología premium. Más de 200 familias ya disfrutan su oasis personal.'
          }
        }
      ]
    },
    {
      id: 'cta_buttons',
      name: 'CTA Button Text',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Original CTA',
          weight: 50,
          config: {
            primaryCTA: 'Cotizar Mi Piscina de Lujo',
            secondaryCTA: 'Ver Proceso de Instalación'
          }
        },
        {
          id: 'variant_a',
          name: 'Urgency CTA',
          weight: 50,
          config: {
            primaryCTA: 'Solicitar Cotización Gratuita',
            secondaryCTA: 'Agendar Visita Técnica'
          }
        }
      ]
    },
    {
      id: 'contact_form',
      name: 'Contact Form Layout',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Single Step Form',
          weight: 50,
          config: {
            layout: 'single_step',
            showProgressBar: false,
            fieldsPerStep: 0
          }
        },
        {
          id: 'variant_a',
          name: 'Multi Step Form',
          weight: 50,
          config: {
            layout: 'multi_step',
            showProgressBar: true,
            fieldsPerStep: 3
          }
        }
      ]
    },
    {
      id: 'pricing_display',
      name: 'Pricing Display Strategy',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Starting From Price',
          weight: 50,
          config: {
            priceFormat: 'starting_from',
            showFinancing: false,
            emphasizeValue: false
          }
        },
        {
          id: 'variant_a',
          name: 'Monthly Payment Focus',
          weight: 50,
          config: {
            priceFormat: 'monthly_payment',
            showFinancing: true,
            emphasizeValue: true
          }
        }
      ]
    }
  ];

  useEffect(() => {
    setTests(activeTests);
    initializeUserVariants();
  }, []);

  const initializeUserVariants = () => {
    const storedVariants = localStorage.getItem('ab_test_variants');
    let variants: Record<string, string> = {};

    if (storedVariants) {
      try {
        variants = JSON.parse(storedVariants);
      } catch (error) {
        console.warn('Failed to parse stored A/B test variants');
      }
    }

    // Assign variants for new tests
    activeTests.forEach(test => {
      if (!variants[test.id] && test.status === 'running') {
        variants[test.id] = selectVariant(test);
      }
    });

    setUserVariants(variants);
    localStorage.setItem('ab_test_variants', JSON.stringify(variants));

    // Track test assignments
    Object.entries(variants).forEach(([testId, variantId]) => {
      sentryUtils.trackUserInteraction('ab_test_assigned', testId, variantId);
    });
  };

  const selectVariant = (test: ABTest): string => {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }

    return test.variants[0].id; // Fallback to first variant
  };

  const getVariant = (testId: string): string | null => {
    return userVariants[testId] || null;
  };

  const trackConversion = (testId: string, conversionType: string, value?: number) => {
    const variantId = userVariants[testId];
    if (!variantId) return;

    // Track conversion in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        conversion_type: conversionType,
        value: value
      });
    }

    // Track in Sentry
    sentryUtils.trackUserInteraction('ab_test_conversion', testId, `${variantId}_${conversionType}`);

    // Store conversion locally for analysis
    const conversions = JSON.parse(localStorage.getItem('ab_test_conversions') || '[]');
    conversions.push({
      testId,
      variantId,
      conversionType,
      value,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('ab_test_conversions', JSON.stringify(conversions));
  };

  const isTestActive = (testId: string): boolean => {
    const test = tests.find(t => t.id === testId);
    return test?.status === 'running' || false;
  };

  const getTestConfig = (testId: string, variantId: string): Record<string, any> => {
    const test = tests.find(t => t.id === testId);
    const variant = test?.variants.find(v => v.id === variantId);
    return variant?.config || {};
  };

  return (
    <ABTestContext.Provider value={{
      getVariant,
      trackConversion,
      isTestActive,
      getTestConfig
    }}>
      {children}
    </ABTestContext.Provider>
  );
};

// Hook for specific A/B tests
export const useHeroTest = () => {
  const { getVariant, getTestConfig, trackConversion } = useABTest();
  const variant = getVariant('hero_headline');
  const config = variant ? getTestConfig('hero_headline', variant) : {};

  return {
    variant,
    config,
    trackConversion: (conversionType: string, value?: number) => 
      trackConversion('hero_headline', conversionType, value)
  };
};

export const useCTATest = () => {
  const { getVariant, getTestConfig, trackConversion } = useABTest();
  const variant = getVariant('cta_buttons');
  const config = variant ? getTestConfig('cta_buttons', variant) : {};

  return {
    variant,
    config,
    trackConversion: (conversionType: string, value?: number) => 
      trackConversion('cta_buttons', conversionType, value)
  };
};

export const useContactFormTest = () => {
  const { getVariant, getTestConfig, trackConversion } = useABTest();
  const variant = getVariant('contact_form');
  const config = variant ? getTestConfig('contact_form', variant) : {};

  return {
    variant,
    config,
    trackConversion: (conversionType: string, value?: number) => 
      trackConversion('contact_form', conversionType, value)
  };
};

export const usePricingTest = () => {
  const { getVariant, getTestConfig, trackConversion } = useABTest();
  const variant = getVariant('pricing_display');
  const config = variant ? getTestConfig('pricing_display', variant) : {};

  return {
    variant,
    config,
    trackConversion: (conversionType: string, value?: number) => 
      trackConversion('pricing_display', conversionType, value)
  };
};