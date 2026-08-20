import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import { AppProvider } from '../../context/AppContext';

// Mock gtag
const mockGtag = jest.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true
});

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
    mockGtag.mockClear();
  });

  test('initializes Google Analytics with gtag', () => {
    renderHook(() => useAnalytics(), { wrapper });
    
    expect(mockGtag).toHaveBeenCalledWith('js', expect.any(Date));
    expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
      debug_mode: true
    });
  });

  test('tracks interactions correctly', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackInteraction('click', 'button', 'cta');
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'click', {
      event_category: 'button',
      event_label: 'cta'
    });
  });

  test('tracks WhatsApp clicks', () => {
    const { result } = renderHook(() => useAnalytics(), { wrapper });
    
    result.current.trackWhatsAppClick();
    
    expect(mockGtag).toHaveBeenCalledWith('event', 'whatsapp_click', {
      event_category: 'contact',
      event_label: 'floating_button'
    });
  });
});