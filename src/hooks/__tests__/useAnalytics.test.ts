import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAnalytics } from '../useAnalytics';
import { AppProvider } from '../../context/AppContext';

// Mock ReactGA
jest.mock('react-ga4', () => ({
  initialize: jest.fn(),
  send: jest.fn(),
  event: jest.fn()
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AppProvider>
      {children}
    </AppProvider>
  </BrowserRouter>
);

describe('useAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes Google Analytics', () => {
    const ReactGA = require('react-ga4');
    renderHook(() => useAnalytics(), { wrapper });
    
    expect(ReactGA.initialize).toHaveBeenCalledWith('G-XXXXXXXXXX', {
      testMode: true // Since we're in test environment
    });
  });

  test('tracks interactions correctly', () => {
    const ReactGA = require('react-ga4');
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackInteraction('click', 'button', 'cta');
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'click',
      category: 'button',
      label: 'cta'
    });
  });

  test('tracks WhatsApp clicks', () => {
    const ReactGA = require('react-ga4');
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackWhatsAppClick();
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'whatsapp_click',
      category: 'contact',
      label: 'floating_button'
    });
  });

  test('tracks phone clicks', () => {
    const ReactGA = require('react-ga4');
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackPhoneClick();
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'phone_click',
      category: 'contact',
      label: 'header_phone'
    });
  });

  test('tracks CTA clicks', () => {
    const ReactGA = require('react-ga4');
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackCTAClick('hero_section');
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'cta_click',
      category: 'conversion',
      label: 'hero_section'
    });
  });

  test('tracks form events', () => {
    const ReactGA = require('react-ga4');
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackFormStart('contact');
    result.current.trackFormComplete('contact');
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'form_start',
      category: 'forms',
      label: 'contact'
    });
    
    expect(ReactGA.event).toHaveBeenCalledWith({
      action: 'form_complete',
      category: 'forms',
      label: 'contact'
    });
  });
});