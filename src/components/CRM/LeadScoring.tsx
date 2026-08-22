import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { sentryUtils } from '../../monitoring/sentry';

interface LeadScoringRule {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'demographic' | 'behavioral' | 'engagement' | 'intent';
  condition: (leadData: LeadData) => boolean;
  weight: number;
}

interface LeadData {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  location?: string;
  source: string;
  
  // Demographic data
  poolBudget?: string;
  timeline?: string;
  propertyType?: string;
  
  // Behavioral data
  pageViews: number;
  timeOnSite: number;
  pagesVisited: string[];
  documentsDownloaded: string[];
  formsSubmitted: string[];
  
  // Engagement data
  emailOpens: number;
  emailClicks: number;
  whatsappInteractions: number;
  phoneCallsMade: number;
  
  // Intent signals
  quotesRequested: number;
  technicalVisitsRequested: number;
  productViewsDetailed: number;
  pricePageViews: number;
  competitorComparisons: number;
  
  // Timestamps
  firstVisit: Date;
  lastActivity: Date;
  createdAt: Date;
}

interface LeadScore {
  total: number;
  breakdown: {
    demographic: number;
    behavioral: number;
    engagement: number;
    intent: number;
  };
  grade: 'A' | 'B' | 'C' | 'D';
  priority: 'hot' | 'warm' | 'cold';
  recommendations: string[];
}

interface LeadScoringContextType {
  calculateScore: (leadData: LeadData) => LeadScore;
  updateLeadData: (leadId: string, updates: Partial<LeadData>) => void;
  getLeadScore: (leadId: string) => LeadScore | null;
  trackBehavior: (leadId: string, behavior: string, metadata?: Record<string, any>) => void;
  getTopLeads: (limit?: number) => Array<{ leadId: string; score: LeadScore; data: LeadData }>;
}

const LeadScoringContext = createContext<LeadScoringContextType | null>(null);

export const useLeadScoring = () => {
  const context = useContext(LeadScoringContext);
  if (!context) {
    throw new Error('useLeadScoring must be used within a LeadScoringProvider');
  }
  return context;
};

// Lead scoring rules for Piscinas Andinas
const scoringRules: LeadScoringRule[] = [
  // Demographic Scoring
  {
    id: 'high_budget',
    name: 'High Budget Range',
    description: 'Budget over $35M CLP',
    points: 25,
    category: 'demographic',
    weight: 1.0,
    condition: (lead) => {
      const budget = lead.poolBudget;
      return budget === '$35.000.000 - $50.000.000' || budget === 'Más de $50.000.000';
    }
  },
  {
    id: 'medium_budget',
    name: 'Medium Budget Range',
    description: 'Budget $25M-$35M CLP',
    points: 15,
    category: 'demographic',
    weight: 1.0,
    condition: (lead) => lead.poolBudget === '$25.000.000 - $35.000.000'
  },
  {
    id: 'urgent_timeline',
    name: 'Urgent Timeline',
    description: 'Wants installation ASAP',
    points: 20,
    category: 'demographic',
    weight: 1.0,
    condition: (lead) => lead.timeline === 'Lo antes posible'
  },
  {
    id: 'premium_location',
    name: 'Premium Location',
    description: 'Located in high-value areas',
    points: 10,
    category: 'demographic',
    weight: 0.8,
    condition: (lead) => {
      const location = lead.location?.toLowerCase() || '';
      return ['las condes', 'vitacura', 'lo barnechea', 'la dehesa'].some(area => 
        location.includes(area)
      );
    }
  },

  // Behavioral Scoring
  {
    id: 'high_engagement',
    name: 'High Site Engagement',
    description: 'More than 10 page views',
    points: 15,
    category: 'behavioral',
    weight: 1.0,
    condition: (lead) => lead.pageViews > 10
  },
  {
    id: 'long_session',
    name: 'Long Session Duration',
    description: 'More than 5 minutes on site',
    points: 10,
    category: 'behavioral',
    weight: 0.9,
    condition: (lead) => lead.timeOnSite > 300 // 5 minutes
  },
  {
    id: 'multiple_visits',
    name: 'Multiple Visits',
    description: 'Visited key pages multiple times',
    points: 12,
    category: 'behavioral',
    weight: 1.0,
    condition: (lead) => {
      const keyPages = ['/servicios', '/nosotros', '/contacto'];
      return keyPages.filter(page => lead.pagesVisited.includes(page)).length >= 2;
    }
  },
  {
    id: 'document_download',
    name: 'Document Downloads',
    description: 'Downloaded catalogs or guides',
    points: 18,
    category: 'behavioral',
    weight: 1.2,
    condition: (lead) => lead.documentsDownloaded.length > 0
  },

  // Engagement Scoring
  {
    id: 'form_submission',
    name: 'Form Submissions',
    description: 'Submitted contact or quote forms',
    points: 30,
    category: 'engagement',
    weight: 1.5,
    condition: (lead) => lead.formsSubmitted.length > 0
  },
  {
    id: 'email_engagement',
    name: 'Email Engagement',
    description: 'Opens and clicks emails',
    points: 8,
    category: 'engagement',
    weight: 0.7,
    condition: (lead) => lead.emailOpens > 0 && lead.emailClicks > 0
  },
  {
    id: 'whatsapp_interaction',
    name: 'WhatsApp Interaction',
    description: 'Initiated WhatsApp conversation',
    points: 25,
    category: 'engagement',
    weight: 1.3,
    condition: (lead) => lead.whatsappInteractions > 0
  },
  {
    id: 'phone_call',
    name: 'Phone Call Made',
    description: 'Called the company',
    points: 35,
    category: 'engagement',
    weight: 1.5,
    condition: (lead) => lead.phoneCallsMade > 0
  },

  // Intent Scoring
  {
    id: 'quote_request',
    name: 'Quote Requested',
    description: 'Requested formal quote',
    points: 40,
    category: 'intent',
    weight: 2.0,
    condition: (lead) => lead.quotesRequested > 0
  },
  {
    id: 'technical_visit',
    name: 'Technical Visit Requested',
    description: 'Requested on-site visit',
    points: 50,
    category: 'intent',
    weight: 2.5,
    condition: (lead) => lead.technicalVisitsRequested > 0
  },
  {
    id: 'detailed_product_view',
    name: 'Detailed Product Views',
    description: 'Viewed product specifications',
    points: 15,
    category: 'intent',
    weight: 1.1,
    condition: (lead) => lead.productViewsDetailed > 2
  },
  {
    id: 'price_research',
    name: 'Price Research',
    description: 'Viewed pricing information multiple times',
    points: 20,
    category: 'intent',
    weight: 1.3,
    condition: (lead) => lead.pricePageViews > 1
  },
  {
    id: 'competitor_comparison',
    name: 'Competitor Comparison',
    description: 'Researched competitors',
    points: 12,
    category: 'intent',
    weight: 1.0,
    condition: (lead) => lead.competitorComparisons > 0
  }
];

export const LeadScoringProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Map<string, LeadData>>(new Map());
  const [scores, setScores] = useState<Map<string, LeadScore>>(new Map());
  const location = useLocation();

  useEffect(() => {
    // Load stored lead data
    const storedLeads = localStorage.getItem('lead_data');
    if (storedLeads) {
      try {
        const leadArray = JSON.parse(storedLeads);
        const leadMap = new Map(leadArray.map((lead: LeadData) => [lead.id, lead]));
        setLeads(leadMap);
        
        // Recalculate scores for all leads
        leadMap.forEach((leadData, leadId) => {
          const score = calculateScore(leadData);
          setScores(prev => new Map(prev.set(leadId, score)));
        });
      } catch (error) {
        console.warn('Failed to load lead data:', error);
      }
    }
  }, []);

  const calculateScore = (leadData: LeadData): LeadScore => {
    const breakdown = {
      demographic: 0,
      behavioral: 0,
      engagement: 0,
      intent: 0
    };

    let totalPoints = 0;
    const appliedRules: string[] = [];

    scoringRules.forEach(rule => {
      if (rule.condition(leadData)) {
        const weightedPoints = rule.points * rule.weight;
        breakdown[rule.category] += weightedPoints;
        totalPoints += weightedPoints;
        appliedRules.push(rule.name);
      }
    });

    // Apply time decay for older leads
    const daysSinceLastActivity = Math.floor(
      (Date.now() - leadData.lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastActivity > 7) {
      const decayFactor = Math.max(0.5, 1 - (daysSinceLastActivity - 7) * 0.05);
      totalPoints *= decayFactor;
      Object.keys(breakdown).forEach(key => {
        breakdown[key as keyof typeof breakdown] *= decayFactor;
      });
    }

    // Determine grade and priority
    let grade: 'A' | 'B' | 'C' | 'D';
    let priority: 'hot' | 'warm' | 'cold';

    if (totalPoints >= 80) {
      grade = 'A';
      priority = 'hot';
    } else if (totalPoints >= 50) {
      grade = 'B';
      priority = 'warm';
    } else if (totalPoints >= 25) {
      grade = 'C';
      priority = 'warm';
    } else {
      grade = 'D';
      priority = 'cold';
    }

    // Generate recommendations
    const recommendations = generateRecommendations(leadData, totalPoints, appliedRules);

    return {
      total: Math.round(totalPoints),
      breakdown: {
        demographic: Math.round(breakdown.demographic),
        behavioral: Math.round(breakdown.behavioral),
        engagement: Math.round(breakdown.engagement),
        intent: Math.round(breakdown.intent)
      },
      grade,
      priority,
      recommendations
    };
  };

  const generateRecommendations = (
    leadData: LeadData, 
    score: number, 
    appliedRules: string[]
  ): string[] => {
    const recommendations: string[] = [];

    // High-priority recommendations
    if (score >= 80) {
      recommendations.push('🔥 CONTACTAR INMEDIATAMENTE - Lead de alta prioridad');
      recommendations.push('📞 Llamar dentro de 1 hora');
      recommendations.push('📅 Agendar visita técnica urgente');
    } else if (score >= 50) {
      recommendations.push('⚡ Contactar dentro de 24 horas');
      recommendations.push('📧 Enviar propuesta personalizada');
    }

    // Specific recommendations based on behavior
    if (leadData.quotesRequested > 0) {
      recommendations.push('💰 Preparar cotización detallada');
    }

    if (leadData.technicalVisitsRequested > 0) {
      recommendations.push('🏠 Coordinar visita técnica');
    }

    if (leadData.whatsappInteractions > 0) {
      recommendations.push('💬 Continuar conversación por WhatsApp');
    }

    if (leadData.documentsDownloaded.length > 0) {
      recommendations.push('📋 Hacer seguimiento de documentos descargados');
    }

    if (leadData.pageViews > 10) {
      recommendations.push('🎯 Lead altamente interesado - priorizar');
    }

    if (!appliedRules.includes('Form Submissions') && score < 30) {
      recommendations.push('📝 Incentivar completar formulario de contacto');
    }

    if (leadData.emailOpens === 0 && leadData.email) {
      recommendations.push('📧 Mejorar subject lines de emails');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  };

  const updateLeadData = (leadId: string, updates: Partial<LeadData>) => {
    setLeads(prev => {
      const currentLead = prev.get(leadId);
      if (!currentLead) return prev;

      const updatedLead = {
        ...currentLead,
        ...updates,
        lastActivity: new Date()
      };

      const newMap = new Map(prev);
      newMap.set(leadId, updatedLead);

      // Persist to localStorage
      const leadArray = Array.from(newMap.values());
      localStorage.setItem('lead_data', JSON.stringify(leadArray));

      // Recalculate score
      const newScore = calculateScore(updatedLead);
      setScores(prevScores => new Map(prevScores.set(leadId, newScore)));

      return newMap;
    });
  };

  const getLeadScore = (leadId: string): LeadScore | null => {
    return scores.get(leadId) || null;
  };

  const trackBehavior = (leadId: string, behavior: string, metadata?: Record<string, any>) => {
    const lead = leads.get(leadId);
    if (!lead) return;

    const updates: Partial<LeadData> = {};

    switch (behavior) {
      case 'page_view':
        updates.pageViews = (lead.pageViews || 0) + 1;
        if (metadata?.page) {
          updates.pagesVisited = [...(lead.pagesVisited || []), metadata.page];
        }
        break;
      case 'document_download':
        if (metadata?.document) {
          updates.documentsDownloaded = [...(lead.documentsDownloaded || []), metadata.document];
        }
        break;
      case 'form_submit':
        if (metadata?.formType) {
          updates.formsSubmitted = [...(lead.formsSubmitted || []), metadata.formType];
        }
        break;
      case 'whatsapp_click':
        updates.whatsappInteractions = (lead.whatsappInteractions || 0) + 1;
        break;
      case 'phone_click':
        updates.phoneCallsMade = (lead.phoneCallsMade || 0) + 1;
        break;
      case 'quote_request':
        updates.quotesRequested = (lead.quotesRequested || 0) + 1;
        break;
      case 'technical_visit_request':
        updates.technicalVisitsRequested = (lead.technicalVisitsRequested || 0) + 1;
        break;
      case 'product_view_detailed':
        updates.productViewsDetailed = (lead.productViewsDetailed || 0) + 1;
        break;
      case 'price_page_view':
        updates.pricePageViews = (lead.pricePageViews || 0) + 1;
        break;
    }

    if (Object.keys(updates).length > 0) {
      updateLeadData(leadId, updates);
      
      // Track in analytics
      sentryUtils.trackUserInteraction('lead_behavior', behavior, JSON.stringify(metadata));
    }
  };

  const getTopLeads = (limit: number = 10) => {
    const leadScores = Array.from(scores.entries())
      .map(([leadId, score]) => ({
        leadId,
        score,
        data: leads.get(leadId)!
      }))
      .filter(item => item.data)
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit);

    return leadScores;
  };

  return (
    <LeadScoringContext.Provider value={{
      calculateScore,
      updateLeadData,
      getLeadScore,
      trackBehavior,
      getTopLeads
    }}>
      {children}
    </LeadScoringContext.Provider>
  );
};

export default LeadScoringProvider;