import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface PerformanceAlert {
  id: string;
  type: 'core_web_vitals' | 'bundle_size' | 'api_response' | 'error_rate' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  context: Record<string, any>;
  resolved: boolean;
}

export interface AlertRule {
  id: string;
  name: string;
  type: PerformanceAlert['type'];
  metric: string;
  threshold: number;
  severity: PerformanceAlert['severity'];
  enabled: boolean;
  conditions?: Record<string, any>;
}

class PerformanceAlertService {
  private alertRules: AlertRule[] = [];
  private activeAlerts: Map<string, PerformanceAlert> = new Map();
  private alertHistory: PerformanceAlert[] = [];
  private webhookUrl = apiConfig.monitoring.performanceBudget.alertWebhook;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;

    this.setupDefaultAlertRules();
    this.startPerformanceMonitoring();
    this.loadAlertHistory();
    
    this.isInitialized = true;
    console.log('Performance Alert Service initialized');
  }

  private setupDefaultAlertRules(): void {
    this.alertRules = [
      // Core Web Vitals
      {
        id: 'lcp_threshold',
        name: 'Largest Contentful Paint Threshold',
        type: 'core_web_vitals',
        metric: 'LCP',
        threshold: apiConfig.monitoring.performanceBudget.thresholds.lcp,
        severity: 'high',
        enabled: true
      },
      {
        id: 'fid_threshold',
        name: 'First Input Delay Threshold',
        type: 'core_web_vitals',
        metric: 'FID',
        threshold: apiConfig.monitoring.performanceBudget.thresholds.fid,
        severity: 'high',
        enabled: true
      },
      {
        id: 'cls_threshold',
        name: 'Cumulative Layout Shift Threshold',
        type: 'core_web_vitals',
        metric: 'CLS',
        threshold: apiConfig.monitoring.performanceBudget.thresholds.cls,
        severity: 'high',
        enabled: true
      },
      
      // Bundle Size
      {
        id: 'bundle_size_threshold',
        name: 'Bundle Size Threshold',
        type: 'bundle_size',
        metric: 'total_bundle_size',
        threshold: apiConfig.monitoring.performanceBudget.thresholds.bundleSize,
        severity: 'medium',
        enabled: true
      },
      
      // API Response Times
      {
        id: 'api_response_slow',
        name: 'Slow API Response',
        type: 'api_response',
        metric: 'response_time',
        threshold: 5000, // 5 seconds
        severity: 'medium',
        enabled: true
      },
      
      // Error Rates
      {
        id: 'error_rate_high',
        name: 'High Error Rate',
        type: 'error_rate',
        metric: 'error_percentage',
        threshold: 5, // 5%
        severity: 'critical',
        enabled: true
      },
      
      // User Experience
      {
        id: 'bounce_rate_high',
        name: 'High Bounce Rate',
        type: 'user_experience',
        metric: 'bounce_rate',
        threshold: 70, // 70%
        severity: 'medium',
        enabled: true
      }
    ];
  }

  private startPerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor API responses
    this.monitorAPIResponses();
    
    // Monitor error rates
    this.monitorErrorRates();
    
    // Monitor user experience metrics
    this.monitorUserExperience();
    
    // Check bundle sizes periodically
    setInterval(() => {
      this.checkBundleSizes();
    }, 60000); // Every minute
  }

  private monitorCoreWebVitals(): void {
    // LCP Monitoring
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.checkMetric('LCP', entry.startTime, {
          element: entry.element?.tagName,
          url: entry.url
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID Monitoring
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        this.checkMetric('FID', fid, {
          eventType: entry.name,
          target: entry.target?.tagName
        });
      }
    }).observe({ type: 'first-input', buffered: true });

    // CLS Monitoring
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          this.checkMetric('CLS', entry.value, {
            sources: entry.sources?.map((source: any) => source.node?.tagName)
          });
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  }

  private monitorAPIResponses(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.checkMetric('response_time', duration, {
          url: args[0],
          status: response.status,
          method: 'GET'
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.checkMetric('response_time', duration, {
          url: args[0],
          error: (error as Error).message,
          failed: true
        });
        
        throw error;
      }
    };
  }

  private monitorErrorRates(): void {
    let errorCount = 0;
    let totalRequests = 0;
    
    // Track JavaScript errors
    window.addEventListener('error', () => {
      errorCount++;
      this.updateErrorRate(errorCount, totalRequests);
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', () => {
      errorCount++;
      this.updateErrorRate(errorCount, totalRequests);
    });
    
    // Track successful operations
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      totalRequests++;
      
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          errorCount++;
        }
        this.updateErrorRate(errorCount, totalRequests);
        return response;
      } catch (error) {
        errorCount++;
        this.updateErrorRate(errorCount, totalRequests);
        throw error;
      }
    };
  }

  private updateErrorRate(errors: number, total: number): void {
    if (total === 0) return;
    
    const errorRate = (errors / total) * 100;
    this.checkMetric('error_percentage', errorRate, {
      totalErrors: errors,
      totalRequests: total
    });
  }

  private monitorUserExperience(): void {
    let bounceStartTime = Date.now();
    let hasEngaged = false;
    
    // Track user engagement
    const engagementEvents = ['click', 'scroll', 'keydown', 'touchstart'];
    engagementEvents.forEach(event => {
      document.addEventListener(event, () => {
        hasEngaged = true;
      }, { once: true });
    });
    
    // Check bounce rate on page unload
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - bounceStartTime;
      const isBounce = !hasEngaged && timeOnPage < 30000; // Less than 30 seconds without engagement
      
      if (isBounce) {
        this.checkMetric('bounce_rate', 100, {
          timeOnPage,
          engaged: hasEngaged
        });
      }
    });
  }

  private async checkBundleSizes(): Promise<void> {
    try {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      let totalSize = 0;
      
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          try {
            const response = await fetch(src, { method: 'HEAD' });
            const size = parseInt(response.headers.get('content-length') || '0');
            totalSize += size;
          } catch (error) {
            // Ignore errors for bundle size checking
          }
        }
      }
      
      this.checkMetric('total_bundle_size', totalSize, {
        scriptCount: scripts.length
      });
      
    } catch (error) {
      console.warn('Bundle size check failed:', error);
    }
  }

  private checkMetric(metric: string, value: number, context: Record<string, any> = {}): void {
    const rule = this.alertRules.find(r => r.metric === metric && r.enabled);
    if (!rule) return;
    
    if (value > rule.threshold) {
      this.triggerAlert(rule, value, context);
    } else {
      this.resolveAlert(rule.id);
    }
  }

  private triggerAlert(rule: AlertRule, value: number, context: Record<string, any>): void {
    const alertId = `${rule.id}_${Date.now()}`;
    
    const alert: PerformanceAlert = {
      id: alertId,
      type: rule.type,
      severity: rule.severity,
      metric: rule.metric,
      value,
      threshold: rule.threshold,
      timestamp: new Date(),
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      resolved: false
    };
    
    // Check if similar alert is already active
    const existingAlert = Array.from(this.activeAlerts.values()).find(
      a => a.metric === alert.metric && !a.resolved
    );
    
    if (existingAlert) {
      // Update existing alert
      existingAlert.value = Math.max(existingAlert.value, value);
      existingAlert.timestamp = new Date();
      existingAlert.context = { ...existingAlert.context, ...context };
    } else {
      // Create new alert
      this.activeAlerts.set(alertId, alert);
      this.alertHistory.push(alert);
      
      // Send alert notification
      this.sendAlertNotification(alert);
      
      // Store in localStorage
      this.saveAlertHistory();
    }
  }

  private resolveAlert(ruleId: string): void {
    for (const [alertId, alert] of this.activeAlerts.entries()) {
      if (alert.id.startsWith(ruleId) && !alert.resolved) {
        alert.resolved = true;
        alert.context.resolvedAt = new Date().toISOString();
        this.activeAlerts.delete(alertId);
        
        // Send resolution notification
        this.sendResolutionNotification(alert);
        break;
      }
    }
  }

  private async sendAlertNotification(alert: PerformanceAlert): Promise<void> {
    // Console logging for development
    console.warn(`🚨 Performance Alert: ${alert.metric} (${alert.value}) exceeds threshold (${alert.threshold})`);
    
    // Send to webhook if configured
    if (this.webhookUrl && !this.webhookUrl.includes('your-webhook')) {
      try {
        await this.sendWebhookNotification(alert, 'triggered');
      } catch (error) {
        console.warn('Failed to send alert webhook:', error);
      }
    }
    
    // Send to Sentry
    sentryUtils.captureMessage(
      `Performance Alert: ${alert.metric} exceeded threshold`,
      alert.severity === 'critical' ? 'error' : 'warning'
    );
    
    // Track in analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_alert', {
        event_category: 'performance',
        event_label: alert.metric,
        value: alert.value,
        custom_parameter_1: alert.severity
      });
    }
  }

  private async sendResolutionNotification(alert: PerformanceAlert): Promise<void> {
    console.info(`✅ Performance Alert Resolved: ${alert.metric}`);
    
    if (this.webhookUrl && !this.webhookUrl.includes('your-webhook')) {
      try {
        await this.sendWebhookNotification(alert, 'resolved');
      } catch (error) {
        console.warn('Failed to send resolution webhook:', error);
      }
    }
  }

  private async sendWebhookNotification(alert: PerformanceAlert, action: 'triggered' | 'resolved'): Promise<void> {
    const payload = {
      action,
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
        timestamp: alert.timestamp.toISOString(),
        context: alert.context
      },
      site: {
        url: window.location.origin,
        environment: import.meta.env.MODE
      }
    };
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Alert-Source': 'piscinasandinas-performance-monitor'
      },
      body: JSON.stringify(payload)
    });
  }

  private loadAlertHistory(): void {
    try {
      const stored = localStorage.getItem('performance_alerts');
      if (stored) {
        this.alertHistory = JSON.parse(stored).map((alert: any) => ({
          ...alert,
          timestamp: new Date(alert.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load alert history:', error);
    }
  }

  private saveAlertHistory(): void {
    try {
      // Keep only last 100 alerts
      const recentAlerts = this.alertHistory.slice(-100);
      localStorage.setItem('performance_alerts', JSON.stringify(recentAlerts));
    } catch (error) {
      console.warn('Failed to save alert history:', error);
    }
  }

  // Public API methods
  getActiveAlerts(): PerformanceAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(limit: number = 50): PerformanceAlert[] {
    return this.alertHistory.slice(-limit);
  }

  getAlertSummary(): {
    total: number;
    active: number;
    critical: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const active = this.getActiveAlerts();
    const total = this.alertHistory.length;
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    
    this.alertHistory.forEach(alert => {
      byType[alert.type] = (byType[alert.type] || 0) + 1;
      bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
    });
    
    return {
      total,
      active: active.length,
      critical: active.filter(a => a.severity === 'critical').length,
      byType,
      bySeverity
    };
  }

  addCustomAlertRule(rule: Omit<AlertRule, 'id'>): void {
    const newRule: AlertRule = {
      ...rule,
      id: `custom_${Date.now()}`
    };
    
    this.alertRules.push(newRule);
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const ruleIndex = this.alertRules.findIndex(r => r.id === ruleId);
    if (ruleIndex !== -1) {
      this.alertRules[ruleIndex] = { ...this.alertRules[ruleIndex], ...updates };
    }
  }

  disableAlertRule(ruleId: string): void {
    this.updateAlertRule(ruleId, { enabled: false });
  }

  enableAlertRule(ruleId: string): void {
    this.updateAlertRule(ruleId, { enabled: true });
  }
}

export const performanceAlertService = new PerformanceAlertService();