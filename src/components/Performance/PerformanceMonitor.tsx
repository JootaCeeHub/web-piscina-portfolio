import React, { useEffect } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitoring';
import { errorReporting } from '../../utils/errorReporting';

interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableReporting?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  children, 
  enableReporting = true 
}) => {
  useEffect(() => {
    if (!enableReporting || typeof window === 'undefined') return;

    // Initialize performance monitoring with enhanced error handling
    try {
      performanceMonitor.initialize();
    } catch (error) {
      console.warn('Failed to initialize performance monitoring:', error);
    }

    // Monitor specific performance thresholds with intelligent reporting
    const checkPerformanceThresholds = () => {
      try {
        const summary = performanceMonitor.getPerformanceSummary();
        
        // Only report significant performance issues
        if (summary.LCP && summary.LCP.avg > 4000) { // Increased threshold
          errorReporting.reportPerformanceIssue(
            'LCP',
            summary.LCP.avg,
            4000,
            { context: 'performance_monitor', environment: import.meta.env.MODE }
          );
        }

        if (summary.FID && summary.FID.avg > 300) { // Increased threshold
          errorReporting.reportPerformanceIssue(
            'FID',
            summary.FID.avg,
            300,
            { context: 'performance_monitor', environment: import.meta.env.MODE }
          );
        }

        if (summary.CLS && summary.CLS.avg > 0.25) { // Increased threshold
          errorReporting.reportPerformanceIssue(
            'CLS',
            summary.CLS.avg,
            0.25,
            { context: 'performance_monitor', environment: import.meta.env.MODE }
          );
        }
      } catch (error) {
        console.warn('Failed to check performance thresholds:', error);
      }
    };

    // Check thresholds less frequently and only in production
    let interval: NodeJS.Timeout | null = null;
    
    if (import.meta.env.MODE === 'production') {
      interval = setInterval(checkPerformanceThresholds, 60000); // Every minute
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [enableReporting]);

  return <>{children}</>;
};

export default PerformanceMonitor;