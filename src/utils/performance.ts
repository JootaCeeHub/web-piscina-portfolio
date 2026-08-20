// Performance monitoring utilities
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

  // Resource loading performance
  getResourceTimings: () => {
    return performance.getEntriesByType('resource').map(entry => ({
      name: entry.name,
      duration: entry.duration,
      size: (entry as any).transferSize || 0,
      type: entry.initiatorType
    }));
  },

  // Memory usage (if available)
  getMemoryUsage: () => {
    if ('memory' in performance) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Network information (if available)
  getNetworkInfo: () => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }
};

// Image optimization utilities
export const imageOptimizer = {
  // Generate responsive image URLs
  generateSrcSet: (baseUrl: string, sizes: number[]) => {
    return sizes.map(size => {
      if (baseUrl.includes('pexels.com')) {
        return `${baseUrl}&w=${size} ${size}w`;
      }
      return `${baseUrl}?w=${size} ${size}w`;
    }).join(', ');
  },

  // Preload critical images
  preloadImage: (src: string, priority: 'high' | 'low' = 'low') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    document.head.appendChild(link);
  },

  // Lazy load images with intersection observer
  lazyLoadImages: (selector: string = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src!;
      });
    }
  }
};

// Bundle analysis utilities
export const bundleAnalyzer = {
  // Analyze loaded chunks
  getLoadedChunks: () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return scripts.map(script => ({
      src: script.getAttribute('src'),
      async: script.hasAttribute('async'),
      defer: script.hasAttribute('defer')
    }));
  },

  // Monitor chunk loading
  monitorChunkLoading: () => {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0] as string;
      if (url.includes('.js') || url.includes('.css')) {
        console.log('Loading chunk:', url);
      }
      return originalFetch.apply(this, args);
    };
  }
};