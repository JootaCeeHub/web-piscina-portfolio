import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './components/Notification/NotificationSystem';
import { ABTestProvider } from './components/ABTesting/ABTestProvider';
import FunnelAnalyticsProvider from './components/Analytics/FunnelAnalytics';
import LeadScoringProvider from './components/CRM/LeadScoring';
import FacebookPixel, { facebookPixelUtils } from './components/Retargeting/FacebookPixel';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { SentryErrorBoundary, initSentry } from './monitoring/sentry';
import AdvancedAnalytics from './components/Analytics/AdvancedAnalytics';
import HotjarIntegration from './components/Analytics/HotjarIntegration';
import PerformanceMonitor from './components/Performance/PerformanceMonitor';
import LiveChatWidget from './components/LiveChat/LiveChatWidget';
import ChatbotAdvanced from './components/AI/ChatbotAdvanced';
import NewsletterSignup from './components/EmailMarketing/NewsletterSignup';
import Layout from './components/Layout';
import SkipLinks from './components/Accessibility/SkipLinks';
import CookieConsent from './components/CookieConsent/CookieConsent';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import Contact from './pages/Contact';

// Initialize Sentry
try {
  initSentry();
} catch (error) {
  console.warn('Failed to initialize Sentry:', error);
}

function App() {
  return (
    <SentryErrorBoundary fallback={({ error, resetError }) => (
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Algo salió mal
            </h1>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            <button
              onClick={resetError}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        </div>
      </ErrorBoundary>
    )}>
      <HelmetProvider>
        <AppProvider>
          <ABTestProvider>
            <FunnelAnalyticsProvider>
              <LeadScoringProvider>
                <NotificationProvider>
                  <PerformanceMonitor enableReporting={import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true'}>
                    <Router>
                      <AdvancedAnalytics>
                        <HotjarIntegration 
                          hjid={parseInt(import.meta.env.VITE_HOTJAR_ID || '0')}
                          hjsv={6}
                          enabled={import.meta.env.VITE_ENABLE_HOTJAR === 'true'}
                        />
                        <FacebookPixel 
                          pixelId={import.meta.env.VITE_FACEBOOK_PIXEL_ID || 'YOUR_FACEBOOK_PIXEL_ID'}
                          enabled={import.meta.env.VITE_ENABLE_FACEBOOK_PIXEL === 'true'}
                        />
                        <SkipLinks />
                        <Layout>
                          <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/servicios" element={<Services />} />
                            <Route path="/nosotros" element={<About />} />
                            <Route path="/contacto" element={<Contact />} />
                          </Routes>
                        </Layout>
                        <LiveChatWidget />
                        <ChatbotAdvanced />
                        <CookieConsent />
                      </AdvancedAnalytics>
                    </Router>
                  </PerformanceMonitor>
                </NotificationProvider>
              </LeadScoringProvider>
            </FunnelAnalyticsProvider>
          </ABTestProvider>
        </AppProvider>
      </HelmetProvider>
    </SentryErrorBoundary>
  );
}

export default App;