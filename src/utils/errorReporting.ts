import { sentryUtils } from '../monitoring/sentry';

export interface ErrorReport {
  error: Error;
  context?: {
    component?: string;
    action?: string;
    userId?: string;
    additionalData?: Record<string, any>;
  };
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const errorReporting = {
  // Enhanced error reporting with intelligent filtering
  reportError: ({ error, context, severity = 'medium' }: ErrorReport) => {
    // Filter out non-critical development errors
    if (errorReporting.shouldIgnoreError(error, context)) {
      return;
    }

    // Log to console in development with better formatting
    if (import.meta.env.MODE === 'development') {
      console.group(`🚨 Error Report [${severity.toUpperCase()}]`);
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      if (context) {
        console.table(context);
      }
      console.groupEnd();
    }

    // Report to Sentry only for significant errors
    if (errorReporting.shouldReportToSentry(error, context, severity)) {
      sentryUtils.captureException(error, {
        tags: {
          component: context?.component || 'unknown',
          action: context?.action || 'unknown',
          severity
        },
        extra: context?.additionalData,
        user: context?.userId ? { id: context.userId } : undefined
      });
    }

    // Track in analytics for production errors
    if (import.meta.env.MODE === 'production' && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: severity === 'critical',
        custom_parameter_1: error.name || 'UnknownError',
        custom_parameter_2: context?.component || 'unknown'
      });
    }
  },

  // Intelligent error filtering
  shouldIgnoreError: (error: Error, context?: any): boolean => {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Ignore development-specific errors
    if (import.meta.env.MODE === 'development') {
      // Ignore HMR and dev server errors
      if (message.includes('loading css chunk') ||
          message.includes('loading chunk') ||
          message.includes('dynamically imported module') ||
          message.includes('vite') ||
          stack.includes('/@vite/') ||
          stack.includes('?t=')) {
        return true;
      }

      // Ignore resource loading errors for development files
      if (context?.component === 'resource' && 
          context?.additionalData?.resourceName?.includes('.tsx')) {
        return true;
      }
    }

    // Ignore browser extension errors
    if (stack.includes('extension://') || 
        stack.includes('moz-extension://')) {
      return true;
    }

    // Ignore network errors that are user-related
    if (message.includes('network error') ||
        message.includes('fetch') ||
        message.includes('cors')) {
      return true;
    }

    // Ignore React DevTools errors
    if (message.includes('react devtools') ||
        stack.includes('react-devtools')) {
      return true;
    }

    return false;
  },

  // Determine if error should be reported to Sentry
  shouldReportToSentry: (error: Error, context?: any, severity?: string): boolean => {
    // Only report to Sentry in production or for critical errors
    if (import.meta.env.MODE === 'development' && severity !== 'critical') {
      return false;
    }

    // Always report critical errors
    if (severity === 'critical') {
      return true;
    }

    // Report high severity errors in production
    if (import.meta.env.MODE === 'production' && severity === 'high') {
      return true;
    }

    return false;
  },

  // Enhanced API error reporting
  reportAPIError: (
    url: string,
    method: string,
    status: number,
    response?: any,
    context?: Record<string, any>
  ) => {
    // Only report actual API errors, not development server issues
    if (import.meta.env.MODE === 'development' && url.includes('localhost')) {
      return;
    }

    const error = new Error(`API Error: ${method} ${url} returned ${status}`);
    
    errorReporting.reportError({
      error,
      context: {
        component: 'api',
        action: `${method}_${url}`,
        additionalData: {
          url,
          method,
          status,
          response: response ? JSON.stringify(response).substring(0, 500) : undefined,
          ...context
        }
      },
      severity: status >= 500 ? 'high' : 'medium'
    });
  },

  // Enhanced form error reporting
  reportFormError: (
    formName: string,
    fieldName: string,
    validationError: string,
    formData?: Record<string, any>
  ) => {
    const error = new Error(`Form Validation Error: ${validationError}`);
    
    errorReporting.reportError({
      error,
      context: {
        component: 'form',
        action: 'validation_error',
        additionalData: {
          formName,
          fieldName,
          validationError,
          hasFormData: !!formData,
          fieldCount: formData ? Object.keys(formData).length : 0
        }
      },
      severity: 'low'
    });
  },

  // Enhanced performance issue reporting
  reportPerformanceIssue: (
    metricName: string,
    value: number,
    threshold: number,
    context?: Record<string, any>
  ) => {
    // Only report significant performance issues
    if (value <= threshold * 1.5) return;

    const error = new Error(`Performance Issue: ${metricName} exceeded threshold significantly`);
    
    errorReporting.reportError({
      error,
      context: {
        component: 'performance',
        action: 'threshold_exceeded',
        additionalData: {
          metricName,
          value,
          threshold,
          exceedanceRatio: value / threshold,
          ...context
        }
      },
      severity: value > threshold * 3 ? 'high' : 'medium'
    });
  },

  // Enhanced UX issue reporting
  reportUXIssue: (
    issueType: string,
    description: string,
    userAgent?: string,
    context?: Record<string, any>
  ) => {
    const error = new Error(`UX Issue: ${issueType} - ${description}`);
    
    errorReporting.reportError({
      error,
      context: {
        component: 'ux',
        action: issueType,
        additionalData: {
          description,
          userAgent,
          viewport: typeof window !== 'undefined' ? {
            width: window.innerWidth,
            height: window.innerHeight
          } : undefined,
          ...context
        }
      },
      severity: 'low'
    });
  },

  // Enhanced security issue reporting
  reportSecurityIssue: (
    issueType: string,
    description: string,
    context?: Record<string, any>
  ) => {
    const error = new Error(`Security Issue: ${issueType} - ${description}`);
    
    errorReporting.reportError({
      error,
      context: {
        component: 'security',
        action: issueType,
        additionalData: {
          description,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          ...context
        }
      },
      severity: 'critical'
    });
  },

  // Enhanced global error handlers
  setupGlobalErrorHandlers: () => {
    if (typeof window === 'undefined') return;

    // Enhanced unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      const error = event.error || new Error(event.message);
      
      errorReporting.reportError({
        error,
        context: {
          component: 'global',
          action: 'unhandled_error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            type: 'javascript_error'
          }
        },
        severity: 'high'
      });
    });

    // Enhanced unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? 
        event.reason : 
        new Error(String(event.reason));
      
      errorReporting.reportError({
        error,
        context: {
          component: 'global',
          action: 'unhandled_promise_rejection',
          additionalData: {
            type: 'promise_rejection',
            reasonType: typeof event.reason
          }
        },
        severity: 'high'
      });
    });

    // Enhanced resource loading errors with filtering
    window.addEventListener('error', (event) => {
      if (event.target !== window && event.target) {
        const target = event.target as HTMLElement;
        const src = (target as any).src || (target as any).href;
        
        // Filter out development server and non-critical resources
        if (errorReporting.shouldIgnoreResourceError(src)) {
          return;
        }
        
        errorReporting.reportError({
          error: new Error(`Resource loading error: ${target.tagName}`),
          context: {
            component: 'resource',
            action: 'load_error',
            additionalData: {
              tagName: target.tagName,
              src,
              type: 'resource_error'
            }
          },
          severity: 'medium'
        });
      }
    }, true);
  },

  // Filter resource errors
  shouldIgnoreResourceError: (src: string): boolean => {
    if (!src) return true;

    // Ignore development server resources
    if (import.meta.env.MODE === 'development') {
      if (src.includes('/@vite/') ||
          src.includes('?t=') ||
          src.includes('.tsx') ||
          src.includes('.ts') ||
          src.includes('node_modules')) {
        return true;
      }
    }

    // Ignore browser extensions
    if (src.includes('extension://')) {
      return true;
    }

    // Ignore data URLs
    if (src.startsWith('data:') || src.startsWith('blob:')) {
      return true;
    }

    return false;
  },

  // Get error statistics
  getErrorStatistics: () => {
    try {
      const errors = JSON.parse(localStorage.getItem('error_reports') || '[]');
      const stats = {
        total: errors.length,
        bySeverity: {} as Record<string, number>,
        byComponent: {} as Record<string, number>,
        recent: errors.filter((e: any) => 
          Date.now() - new Date(e.timestamp).getTime() < 24 * 60 * 60 * 1000
        ).length
      };

      errors.forEach((error: any) => {
        stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        stats.byComponent[error.component] = (stats.byComponent[error.component] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.warn('Failed to get error statistics:', error);
      return { total: 0, bySeverity: {}, byComponent: {}, recent: 0 };
    }
  }
};

// Initialize global error handlers with delay
if (typeof window !== 'undefined') {
  // Delay to avoid interfering with app initialization
  setTimeout(() => {
    errorReporting.setupGlobalErrorHandlers();
  }, 1000);
}