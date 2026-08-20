import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { useApp, trackPageView, trackEvent } from '../context/AppContext';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const useAnalytics = () => {
  const location = useLocation();
  const { dispatch } = useApp();

  useEffect(() => {
    // Initialize Google Analytics 4
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
    ReactGA.initialize(measurementId, {
      testMode: import.meta.env.MODE === 'development'
    });
  }, []);

  useEffect(() => {
    // Track page views
    ReactGA.send({ 
      hitType: 'pageview', 
      page: location.pathname,
      title: document.title
    });
    
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
      console.warn('Google Analytics not configured. Skipping initialization.');
    }

    dispatch({
      type: 'UPDATE_ANALYTICS',
      payload: { pageViews: 1 }
    });

    dispatch({
      type: 'SET_CURRENT_SECTION',
      payload: location.pathname.slice(1) || 'home'
    });
  }, [location, dispatch]);

  const trackInteraction = (action: string, category: string, label?: string) => {
    ReactGA.event({
      action,
      category,
      label
    });

    dispatch({
      type: 'TRACK_INTERACTION',
      payload: `${category}_${action}`
    });
  };

  const trackWhatsAppClick = () => {
    trackInteraction('whatsapp_click', 'contact', 'floating_button');
  };

  const trackPhoneClick = () => {
    trackInteraction('phone_click', 'contact', 'header_phone');
  };

  const trackEmailClick = () => {
    trackInteraction('email_click', 'contact', 'header_email');
  };

  const trackCTAClick = (ctaLocation: string) => {
    trackInteraction('cta_click', 'conversion', ctaLocation);
  };

  const trackCarouselInteraction = (carouselType: string, action: string) => {
    trackInteraction(`carousel_${action}`, 'engagement', carouselType);
  };

  const trackFormStart = (formType: string) => {
    trackInteraction('form_start', 'forms', formType);
  };

  const trackFormComplete = (formType: string) => {
    trackInteraction('form_complete', 'forms', formType);
  };

  return {
    trackInteraction,
    trackWhatsAppClick,
    trackPhoneClick,
    trackEmailClick,
    trackCTAClick,
    trackCarouselInteraction,
    trackFormStart,
    trackFormComplete
  };
};