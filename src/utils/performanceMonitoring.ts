// Performance monitoring utilities with enhanced error handling
export const performanceMonitor = {
  // Measure Core Web Vitals
  measureCLS: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            resolve(entry.value);
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
  },

  measureFID: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          resolve(entry.processingStart - entry.startTime);
        }
      }).observe({ type: 'first-input', buffered: true });
    });
  },

  measureLCP: () => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  },

  // Enhanced resource loading monitoring with intelligent filtering
  monitorResourceLoading: () => {
    if (!('PerformanceObserver' in window)) {
      console.warn('PerformanceObserver not supported');
      return;
    }

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;
          
          // Enhanced filtering to avoid false positives
          if (performanceMonitor.shouldIgnoreResource(resource)) {
            continue;
          }
          
          // Only report actual failures, not development server issues
          if (performanceMonitor.isActualResourceFailure(resource)) {
            performanceMonitor.recordMetric({
              name: 'resource_failure',
              value: resource.duration,
              unit: 'ms',
              timestamp: Date.now(),
              context: {
                name: resource.name,
                type: resource.initiatorType,
                size: resource.transferSize,
                status: 'failed'
              }
            });
          }
          
          // Track slow resources (>2s for actual performance issues)
          if (resource.duration > 2000 && resource.transferSize > 0) {
            performanceMonitor.recordMetric({
              name: 'slow_resource',
              value: resource.duration,
              unit: 'ms',
              timestamp: Date.now(),
              context: {
                name: resource.name,
                type: resource.initiatorType,
                size: resource.transferSize
              }
            });
          }
        }
      }).observe({ type: 'resource', buffered: true });
    } catch (error) {
      console.warn('Failed to initialize resource monitoring:', error);
    }
  },

  // Intelligent resource filtering
  shouldIgnoreResource: (resource: PerformanceResourceTiming): boolean => {
    const url = resource.name;
    
    // Ignore development server specific resources
    if (import.meta.env.MODE === 'development') {
      // Ignore HMR and dev server resources
      if (url.includes('/@vite/') || 
          url.includes('/@fs/') || 
          url.includes('?t=') || 
          url.includes('?import') ||
          url.includes('.tsx?') ||
          url.includes('.ts?') ||
          url.includes('node_modules') ||
          url.includes('__vite_ping')) {
        return true;
      }
    }
    
    // Ignore browser extensions
    if (url.startsWith('chrome-extension://') || 
        url.startsWith('moz-extension://') ||
        url.startsWith('safari-extension://')) {
      return true;
    }
    
    // Ignore data URLs and blob URLs
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      return true;
    }
    
    return false;
  },

  // Determine if it's an actual resource failure
  isActualResourceFailure: (resource: PerformanceResourceTiming): boolean => {
    // In development, be more lenient
    if (import.meta.env.MODE === 'development') {
      return false;
    }
    
    // Check for actual network failures
    return resource.transferSize === 0 && 
           resource.duration > 0 && 
           resource.responseEnd === 0;
  },

  // Record performance metrics with enhanced context
  recordMetric: (metric: {
    name: string;
    value: number;
    unit: string;
    timestamp: number;
    context?: Record<string, any>;
  }) => {
    try {
      // Store locally for analysis
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      metrics.push(metric);
      
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics.splice(0, metrics.length - 100);
      }
      
      localStorage.setItem('performance_metrics', JSON.stringify(metrics));

      // Send to analytics only for production or significant issues
      if (import.meta.env.MODE === 'production' || metric.value > 5000) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: metric.name,
            value: Math.round(metric.value),
            event_category: 'performance'
          });
        }
      }
    } catch (error) {
      console.warn('Failed to record performance metric:', error);
    }
  },

  // Enhanced navigation timing monitoring
  monitorNavigationTiming: () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          if (navigation) {
            const metrics = {
              dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
              connectionTime: navigation.connectEnd - navigation.connectStart,
              responseTime: navigation.responseEnd - navigation.requestStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              pageLoad: navigation.loadEventEnd - navigation.fetchStart
            };

            // Record each metric
            Object.entries(metrics).forEach(([name, value]) => {
              if (value > 0) {
                performanceMonitor.recordMetric({
                  name,
                  value,
                  unit: 'ms',
                  timestamp: Date.now()
                });
              }
            });

            // Report slow page loads only in production
            if (import.meta.env.MODE === 'production' && metrics.pageLoad > 3000) {
              console.warn('Slow page load detected:', metrics.pageLoad + 'ms');
            }
          }
        } catch (error) {
          console.warn('Failed to monitor navigation timing:', error);
        }
      }, 0);
    });
  },

  // Memory usage monitoring with safeguards
  monitorMemoryUsage: () => {
    if (!('memory' in performance)) return;

    try {
      setInterval(() => {
        const memory = (performance as any).memory;
        
        if (memory && memory.usedJSHeapSize) {
          performanceMonitor.recordMetric({
            name: 'memory_used',
            value: memory.usedJSHeapSize,
            unit: 'bytes',
            timestamp: Date.now()
          });

          // Report high memory usage only in production
          if (import.meta.env.MODE === 'production' && memory.usedJSHeapSize > 100 * 1024 * 1024) {
            console.warn('High memory usage detected:', Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB');
          }
        }
      }, 60000); // Check every minute
    } catch (error) {
      console.warn('Failed to monitor memory usage:', error);
    }
  },

  // Frame rate monitoring with throttling
  monitorFrameRate: () => {
    if (typeof window === 'undefined') return;

    let lastTime = performance.now();
    let frameCount = 0;
    let isMonitoring = true;
    
    const measureFPS = () => {
      if (!isMonitoring) return;
      
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 5000) { // Check every 5 seconds
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        performanceMonitor.recordMetric({
          name: 'fps',
          value: fps,
          unit: 'fps',
          timestamp: Date.now()
        });

        // Report low FPS only in production
        if (import.meta.env.MODE === 'production' && fps < 30) {
          console.warn('Low FPS detected:', fps);
        }

        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);

    // Stop monitoring after 5 minutes to prevent memory leaks
    setTimeout(() => {
      isMonitoring = false;
    }, 300000);
  },

  // Get performance summary with error handling
  getPerformanceSummary: () => {
    try {
      const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      const summary: Record<string, any> = {};
      
      metrics.forEach((metric: any) => {
        if (!summary[metric.name]) {
          summary[metric.name] = {
            values: [],
            unit: metric.unit
          };
        }
        summary[metric.name].values.push(metric.value);
      });

      // Calculate statistics
      Object.keys(summary).forEach(metricName => {
        const values = summary[metricName].values;
        if (values.length > 0) {
          summary[metricName].avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          summary[metricName].min = Math.min(...values);
          summary[metricName].max = Math.max(...values);
          summary[metricName].count = values.length;
        }
      });

      return summary;
    } catch (error) {
      console.warn('Failed to get performance summary:', error);
      return {};
    }
  },

  // Initialize all monitoring with error handling
  initialize: () => {
    if (typeof window === 'undefined') return;

    try {
      // Only initialize in production or when explicitly enabled
      const shouldMonitor = import.meta.env.MODE === 'production' || 
                           import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

      if (!shouldMonitor) {
        console.log('Performance monitoring disabled in development');
        return;
      }

      performanceMonitor.monitorResourceLoading();
      performanceMonitor.monitorNavigationTiming();
      
      // Optional monitoring (less critical)
      setTimeout(() => {
        performanceMonitor.monitorMemoryUsage();
        performanceMonitor.monitorFrameRate();
      }, 5000);

    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }
  }
};

// Auto-initialize with safeguards
if (typeof window !== 'undefined') {
  // Delay initialization to avoid blocking page load
  setTimeout(() => {
    performanceMonitor.initialize();
  }, 1000);
}