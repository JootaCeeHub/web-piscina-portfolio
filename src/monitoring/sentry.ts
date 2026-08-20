import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

// Sentry configuration for error monitoring
export const initSentry = () => {
  // Only initialize Sentry if we have a valid DSN
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Skip initialization if no DSN is provided or if it's a placeholder
  if (!sentryDsn || sentryDsn === 'YOUR_SENTRY_DSN_HERE' || sentryDsn === 'your_sentry_dsn_here') {
    console.warn('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/multifibrala\.cl/,
          /^https:\/\/.*\.multifibrala\.cl/,
        ],
      }),
    ],
    
    // Performance Monitoring
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    
    // Error Sampling
    sampleRate: 1.0,
    
    // Release tracking
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // User context
    beforeSend(event, hint) {
      // Filter out non-critical errors in development
      if (import.meta.env.MODE === 'development') {
        const error = hint.originalException;
        if (error instanceof Error) {
          // Skip React DevTools errors
          if (error.message.includes('React DevTools')) {
            return null;
          }
          // Skip network errors in development
          if (error.message.includes('NetworkError')) {
            return null;
          }
        }
      }
      
      return event;
    },
    
    // Additional configuration
    attachStacktrace: true,
    autoSessionTracking: true,
    
    // Privacy settings
    beforeBreadcrumb(breadcrumb) {
      // Filter sensitive data from breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'error') {
        return breadcrumb;
      }
      if (breadcrumb.category === 'navigation') {
        return breadcrumb;
      }
      if (breadcrumb.category === 'ui.click') {
        return breadcrumb;
      }
      return null;
    },
  });
};

// Custom error boundary with Sentry integration
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring utilities
export const sentryUtils = {
  // Track custom transactions
  startTransaction: (name: string, op: string) => {
    return Sentry.startTransaction({ name, op });
  },
  
  // Track form submissions
  trackFormSubmission: (formType: string, success: boolean, error?: Error) => {
    Sentry.addBreadcrumb({
      category: 'form',
      message: `Form submission: ${formType}`,
      level: success ? 'info' : 'error',
      data: {
        formType,
        success,
        error: error?.message,
      },
    });
    
    if (!success && error) {
      Sentry.captureException(error, {
        tags: {
          section: 'form_submission',
          formType,
        },
      });
    }
  },
  
  // Track user interactions
  trackUserInteraction: (action: string, element: string, value?: string) => {
    Sentry.addBreadcrumb({
      category: 'ui.interaction',
      message: `User ${action} on ${element}`,
      level: 'info',
      data: {
        action,
        element,
        value,
      },
    });
  },
  
  // Track API calls
  trackAPICall: (url: string, method: string, status: number, duration: number) => {
    Sentry.addBreadcrumb({
      category: 'http',
      message: `${method} ${url}`,
      level: status >= 400 ? 'error' : 'info',
      data: {
        url,
        method,
        status,
        duration,
      },
    });
    
    if (status >= 400) {
      Sentry.captureMessage(`API Error: ${method} ${url} returned ${status}`, 'error');
    }
  },
  
  // Track performance metrics
  trackPerformanceMetric: (name: string, value: number, unit: string) => {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `Performance metric: ${name}`,
      level: 'info',
      data: {
        name,
        value,
        unit,
      },
    });
  },
  
  // Set user context
  setUserContext: (user: {
    id?: string;
    email?: string;
    name?: string;
    segment?: string;
  }) => {
    Sentry.setUser(user);
  },
  
  // Set custom tags
  setCustomTags: (tags: Record<string, string>) => {
    Sentry.setTags(tags);
  },
  
  // Capture custom message
  captureMessage: (message: string, level: Sentry.SeverityLevel = 'info') => {
    Sentry.captureMessage(message, level);
  },
  
  // Capture exception with context
  captureException: (error: Error, context?: {
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    user?: Record<string, any>;
  }) => {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      
      if (context?.user) {
        scope.setUser(context.user);
      }
      
      Sentry.captureException(error);
    });
  },
};

// React component for Sentry profiling
export const SentryProfiler = Sentry.withProfiler;