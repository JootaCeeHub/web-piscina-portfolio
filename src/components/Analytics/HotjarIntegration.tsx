import React, { useEffect } from 'react';

interface HotjarConfig {
  hjid: number;
  hjsv: number;
  enabled: boolean;
}

const HotjarIntegration: React.FC = () => {
  useEffect(() => {
    const hotjarId = import.meta.env.VITE_HOTJAR_ID;
    const isEnabled = import.meta.env.VITE_ENABLE_HOTJAR === 'true';
    
    if (!hotjarId || !isEnabled || hotjarId === 'your_hotjar_id_here') {
      console.warn('Hotjar not configured or disabled. Skipping initialization.');
      return;
    }

    // Initialize Hotjar
    (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
      h.hj = h.hj || function(...args: any[]) { 
        (h.hj.q = h.hj.q || []).push(args); 
      };
      h._hjSettings = { hjid, hjsv };
      a = o.getElementsByTagName('head')[0];
      r = o.createElement('script');
      r.async = 1;
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

    // Track page view
    if (window.hj) {
      window.hj('trigger', 'page_view');
    }

    return () => {
      // Cleanup if needed
      if (window.hj) {
        window.hj('trigger', 'page_unload');
      }
    };
  }, [hjid, hjsv, enabled]);

  return null;
};

// Hotjar utilities
export const hotjarUtils = {
  // Trigger custom events
  trigger: (eventName: string) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('trigger', eventName);
    }
  },

  // Identify user
  identify: (userId: string, attributes?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('identify', userId, attributes);
    }
  },

  // Track form submissions
  trackFormSubmission: (formName: string, success: boolean) => {
    hotjarUtils.trigger(`form_${formName}_${success ? 'success' : 'error'}`);
  },

  // Track CTA clicks
  trackCTAClick: (ctaName: string, location: string) => {
    hotjarUtils.trigger(`cta_${ctaName}_${location}`);
  },

  // Track user journey milestones
  trackMilestone: (milestone: string) => {
    hotjarUtils.trigger(`milestone_${milestone}`);
  },

  // Track errors
  trackError: (errorType: string, errorMessage: string) => {
    hotjarUtils.trigger(`error_${errorType}`);
  },

  // Start/stop recordings programmatically
  startRecording: () => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('trigger', 'start_recording');
    }
  },

  stopRecording: () => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('trigger', 'stop_recording');
    }
  },

  // Show feedback widget
  showFeedback: (feedbackId?: string) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('trigger', feedbackId || 'feedback');
    }
  },

  // Show survey
  showSurvey: (surveyId: string) => {
    if (typeof window !== 'undefined' && window.hj) {
      window.hj('trigger', surveyId);
    }
  }
};

// Declare global Hotjar interface
declare global {
  interface Window {
    hj: (action: string, ...args: any[]) => void;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
  }
}

export default HotjarIntegration;