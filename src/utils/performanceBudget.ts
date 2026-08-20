// Performance Budget Configuration and Monitoring
export interface PerformanceBudget {
  // Bundle size limits (in bytes)
  maxBundleSize: number;
  maxVendorSize: number;
  maxAssetSize: number;
  
  // Performance metrics limits (in milliseconds)
  maxLCP: number;
  maxFID: number;
  maxCLS: number;
  maxTTFB: number;
  
  // Resource limits
  maxImageSize: number;
  maxFontSize: number;
  maxCSSSize: number;
  maxJSSize: number;
}

export const performanceBudget: PerformanceBudget = {
  // Bundle size limits (300KB total budget)
  maxBundleSize: 300 * 1024, // 300KB
  maxVendorSize: 150 * 1024,  // 150KB
  maxAssetSize: 50 * 1024,    // 50KB per asset
  
  // Core Web Vitals targets
  maxLCP: 2500,  // 2.5 seconds
  maxFID: 100,   // 100 milliseconds
  maxCLS: 0.1,   // 0.1 cumulative layout shift
  maxTTFB: 800,  // 800 milliseconds
  
  // Resource size limits
  maxImageSize: 500 * 1024,  // 500KB per image
  maxFontSize: 100 * 1024,   // 100KB per font
  maxCSSSize: 50 * 1024,     // 50KB per CSS file
  maxJSSize: 200 * 1024,     // 200KB per JS file
};

export class PerformanceBudgetMonitor {
  private budget: PerformanceBudget;
  private violations: Array<{
    type: string;
    metric: string;
    actual: number;
    budget: number;
    severity: 'warning' | 'error';
    timestamp: Date;
  }> = [];

  constructor(budget: PerformanceBudget = performanceBudget) {
    this.budget = budget;
  }

  // Monitor Core Web Vitals
  async monitorCoreWebVitals(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Monitor LCP
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const lcp = entry.startTime;
          this.checkMetric('LCP', lcp, this.budget.maxLCP, 'core-web-vitals');
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Monitor FID
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime;
          this.checkMetric('FID', fid, this.budget.maxFID, 'core-web-vitals');
        }
      }).observe({ type: 'first-input', buffered: true });

      // Monitor CLS
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.checkMetric('CLS', entry.value, this.budget.maxCLS, 'core-web-vitals');
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

    } catch (error) {
      console.warn('Failed to monitor Core Web Vitals:', error);
    }
  }

  // Monitor resource loading
  monitorResourceLoading(): void {
    if (typeof window === 'undefined') return;

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          this.checkResourceSize(resource);
        }
      }).observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('Failed to monitor resource loading:', error);
    }
  }

  // Monitor bundle sizes
  async monitorBundleSizes(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      let totalBundleSize = 0;
      let vendorSize = 0;

      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          try {
            const response = await fetch(src);
            const size = parseInt(response.headers.get('content-length') || '0');
            
            totalBundleSize += size;
            
            if (src.includes('vendor') || src.includes('node_modules')) {
              vendorSize += size;
            }
            
            this.checkMetric('JS Bundle', size, this.budget.maxJSSize, 'bundle-size');
          } catch (error) {
            console.warn(`Failed to check bundle size for ${src}:`, error);
          }
        }
      }

      this.checkMetric('Total Bundle', totalBundleSize, this.budget.maxBundleSize, 'bundle-size');
      this.checkMetric('Vendor Bundle', vendorSize, this.budget.maxVendorSize, 'bundle-size');
    } catch (error) {
      console.warn('Failed to monitor bundle sizes:', error);
    }
  }

  // Check individual metric against budget
  private checkMetric(
    metric: string, 
    actual: number, 
    budget: number, 
    type: string
  ): void {
    if (actual > budget) {
      const severity = actual > budget * 1.5 ? 'error' : 'warning';
      const violation = {
        type,
        metric,
        actual,
        budget,
        severity,
        timestamp: new Date()
      };

      this.violations.push(violation);
      this.reportViolation(violation);
    }
  }

  // Check resource size against budget
  private checkResourceSize(resource: PerformanceResourceTiming): void {
    const size = resource.transferSize || 0;
    const name = resource.name;

    if (name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      this.checkMetric('Image', size, this.budget.maxImageSize, 'resource-size');
    } else if (name.match(/\.(woff|woff2|ttf|otf)$/i)) {
      this.checkMetric('Font', size, this.budget.maxFontSize, 'resource-size');
    } else if (name.match(/\.css$/i)) {
      this.checkMetric('CSS', size, this.budget.maxCSSSize, 'resource-size');
    } else if (name.match(/\.js$/i)) {
      this.checkMetric('JavaScript', size, this.budget.maxJSSize, 'resource-size');
    }
  }

  // Report budget violation
  private reportViolation(violation: any): void {
    const message = `Performance Budget Violation: ${violation.metric} (${violation.actual}) exceeds budget (${violation.budget})`;
    
    if (violation.severity === 'error') {
      console.error(message, violation);
    } else {
      console.warn(message, violation);
    }

    // Report to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_budget_violation', {
        event_category: 'performance',
        event_label: violation.metric,
        value: violation.actual,
        custom_parameter_1: violation.severity
      });
    }

    // Report to Sentry in production
    if (import.meta.env.MODE === 'production') {
      try {
        const { sentryUtils } = require('../monitoring/sentry');
        sentryUtils.captureMessage(message, violation.severity === 'error' ? 'error' : 'warning');
      } catch (error) {
        console.warn('Failed to report to Sentry:', error);
      }
    }
  }

  // Get performance budget report
  getReport(): {
    violations: typeof this.violations;
    summary: {
      totalViolations: number;
      errorViolations: number;
      warningViolations: number;
      categories: Record<string, number>;
    };
  } {
    const summary = {
      totalViolations: this.violations.length,
      errorViolations: this.violations.filter(v => v.severity === 'error').length,
      warningViolations: this.violations.filter(v => v.severity === 'warning').length,
      categories: {} as Record<string, number>
    };

    this.violations.forEach(violation => {
      summary.categories[violation.type] = (summary.categories[violation.type] || 0) + 1;
    });

    return {
      violations: this.violations,
      summary
    };
  }

  // Initialize monitoring
  initialize(): void {
    if (typeof window === 'undefined') return;

    // Start monitoring immediately
    this.monitorCoreWebVitals();
    this.monitorResourceLoading();

    // Monitor bundle sizes after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.monitorBundleSizes();
      }, 1000);
    });
  }

  // Clear violations
  clearViolations(): void {
    this.violations = [];
  }
}

// Global performance budget monitor instance
export const performanceBudgetMonitor = new PerformanceBudgetMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Only monitor in production or when explicitly enabled
  const shouldMonitor = import.meta.env.MODE === 'production' || 
                       import.meta.env.VITE_ENABLE_PERFORMANCE_BUDGET === 'true';
  
  if (shouldMonitor) {
    performanceBudgetMonitor.initialize();
  }
}