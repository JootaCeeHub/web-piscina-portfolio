import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hotjarUtils } from './HotjarIntegration';
import { sentryUtils } from '../../monitoring/sentry';

interface AdvancedAnalyticsProps {
  children: React.ReactNode;
}

const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Only initialize analytics in production or when explicitly enabled
    const shouldTrack = import.meta.env.MODE === 'production' || 
                       import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

    if (!shouldTrack) {
      console.log('Analytics disabled in development');
      return;
    }

    // Track page views
    trackPageView();
    
    // Track scroll depth
    const scrollTracker = trackScrollDepth();
    
    // Track time on page
    const timeTracker = trackTimeOnPage();
    
    // Track user engagement
    const engagementTracker = trackUserEngagement();

    return () => {
      try {
        scrollTracker?.cleanup();
        timeTracker?.cleanup();
        engagementTracker?.cleanup();
      } catch (error) {
        console.warn('Failed to cleanup analytics trackers:', error);
      }
    };
  }, [location]);

  const trackPageView = () => {
    const pageName = getPageName(location.pathname);
    
    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX', {
        page_path: location.pathname,
        page_title: pageName,
        custom_map: {
          custom_parameter_1: 'page_category'
        }
      });
    }

    // Hotjar
    hotjarUtils.trigger('page_view');
    
    // Sentry
    sentryUtils.trackUserInteraction('page_view', pageName);
  };

  const getPageName = (pathname: string): string => {
    const pageMap: Record<string, string> = {
      '/': 'Home',
      '/servicios': 'Services',
      '/nosotros': 'About',
      '/contacto': 'Contact'
    };
    return pageMap[pathname] || 'Unknown Page';
  };

  const trackScrollDepth = () => {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            
            // Track in GA
            if (window.gtag) {
              window.gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                event_label: `${milestone}%`,
                value: milestone
              });
            }
            
            // Track in Hotjar
            hotjarUtils.trigger(`scroll_${milestone}`);
            
            // Track in Sentry
            sentryUtils.trackUserInteraction('scroll_depth', 'page', `${milestone}%`);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return {
      cleanup: () => window.removeEventListener('scroll', handleScroll)
    };
  };

  const trackTimeOnPage = () => {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const tracked = new Set<number>();

    const checkTimeOnPage = () => {
      const timeOnPage = Math.floor((Date.now() - startTime) / 1000);
      
      intervals.forEach(interval => {
        if (timeOnPage >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          
          // Track in GA
          if (window.gtag) {
            window.gtag('event', 'time_on_page', {
              event_category: 'engagement',
              event_label: `${interval}s`,
              value: interval
            });
          }
          
          // Track in Hotjar
          hotjarUtils.trigger(`time_on_page_${interval}s`);
        }
      });
    };

    const timer = setInterval(checkTimeOnPage, 10000); // Check every 10 seconds
    
    return {
      cleanup: () => clearInterval(timer)
    };
  };

  const trackUserEngagement = () => {
    let clickCount = 0;
    let keyboardInteractions = 0;
    let mouseMovements = 0;

    const handleClick = () => {
      clickCount++;
      if (clickCount === 1) {
        // First click - user is engaged
        hotjarUtils.trigger('user_engaged');
        sentryUtils.trackUserInteraction('first_click', 'engagement');
      }
    };

    const handleKeyboard = () => {
      keyboardInteractions++;
      if (keyboardInteractions === 1) {
        hotjarUtils.trigger('keyboard_interaction');
      }
    };

    const handleMouseMove = () => {
      mouseMovements++;
      if (mouseMovements === 10) {
        // Significant mouse movement indicates engagement
        hotjarUtils.trigger('mouse_engagement');
      }
    };

    // Throttled mouse move handler
    let mouseTimeout: NodeJS.Timeout;
    const throttledMouseMove = () => {
      if (mouseTimeout) return;
      mouseTimeout = setTimeout(() => {
        handleMouseMove();
        mouseTimeout = null as any;
      }, 1000);
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('mousemove', throttledMouseMove);

    return {
      cleanup: () => {
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeyboard);
        document.removeEventListener('mousemove', throttledMouseMove);
        if (mouseTimeout) clearTimeout(mouseTimeout);
      }
    };
  };

  return <>{children}</>;
};

// Enhanced analytics utilities
export const advancedAnalyticsUtils = {
  // Track form interactions
  trackFormInteraction: (formName: string, action: string, field?: string) => {
    if (window.gtag) {
      window.gtag('event', 'form_interaction', {
        event_category: 'forms',
        event_label: `${formName}_${action}`,
        custom_parameter_1: field
      });
    }
    
    hotjarUtils.trigger(`form_${formName}_${action}`);
    sentryUtils.trackUserInteraction('form_interaction', formName, action);
  },

  // Track video interactions
  trackVideoInteraction: (videoId: string, action: string, progress?: number) => {
    if (window.gtag) {
      window.gtag('event', 'video_interaction', {
        event_category: 'video',
        event_label: `${videoId}_${action}`,
        value: progress
      });
    }
    
    hotjarUtils.trigger(`video_${action}`);
  },

  // Track search interactions
  trackSearch: (query: string, results: number) => {
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        event_category: 'search',
        value: results
      });
    }
    
    hotjarUtils.trigger('search_performed');
  },

  // Track download events
  trackDownload: (fileName: string, fileType: string) => {
    if (window.gtag) {
      window.gtag('event', 'file_download', {
        event_category: 'downloads',
        event_label: fileName,
        custom_parameter_1: fileType
      });
    }
    
    hotjarUtils.trigger('file_download');
    sentryUtils.trackUserInteraction('download', fileType, fileName);
  },

  // Track external link clicks
  trackExternalLink: (url: string, linkText: string) => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'external_links',
        event_label: url,
        transport_type: 'beacon'
      });
    }
    
    hotjarUtils.trigger('external_link_click');
  },

  // Track error events
  trackError: (errorType: string, errorMessage: string, errorLocation: string) => {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: errorMessage,
        fatal: false,
        custom_parameter_1: errorType,
        custom_parameter_2: errorLocation
      });
    }
    
    hotjarUtils.trackError(errorType, errorMessage);
    sentryUtils.captureMessage(`Analytics Error: ${errorType} - ${errorMessage}`, 'error');
  },

  // Track performance metrics
  trackPerformance: (metricName: string, value: number, unit: string) => {
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: metricName,
        value: Math.round(value),
        event_category: 'performance'
      });
    }
    
    sentryUtils.trackPerformanceMetric(metricName, value, unit);
  },

  // Track user preferences
  trackPreference: (preferenceType: string, value: string) => {
    if (window.gtag) {
      window.gtag('event', 'user_preference', {
        event_category: 'preferences',
        event_label: preferenceType,
        custom_parameter_1: value
      });
    }
    
    hotjarUtils.trigger(`preference_${preferenceType}`);
  }
};

export default AdvancedAnalytics;