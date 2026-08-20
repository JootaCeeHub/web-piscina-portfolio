import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
interface AppState {
  isLoading: boolean;
  currentSection: string;
  formSubmissions: FormSubmission[];
  userPreferences: UserPreferences;
  analytics: AnalyticsData;
}

interface FormSubmission {
  id: string;
  type: 'contact' | 'quote' | 'visit';
  data: any;
  timestamp: Date;
  status: 'pending' | 'sent' | 'error';
}

interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'es' | 'en';
  reducedMotion: boolean;
  cookiesAccepted: boolean;
}

interface AnalyticsData {
  pageViews: number;
  sessionDuration: number;
  interactions: string[];
}

type AppAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CURRENT_SECTION'; payload: string }
  | { type: 'ADD_FORM_SUBMISSION'; payload: FormSubmission }
  | { type: 'UPDATE_FORM_STATUS'; payload: { id: string; status: FormSubmission['status'] } }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'TRACK_INTERACTION'; payload: string }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<AnalyticsData> };

// Initial state
const initialState: AppState = {
  isLoading: false,
  currentSection: 'home',
  formSubmissions: [],
  userPreferences: {
    theme: 'light',
    language: 'es',
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    cookiesAccepted: localStorage.getItem('cookiesAccepted') === 'true'
  },
  analytics: {
    pageViews: 0,
    sessionDuration: 0,
    interactions: []
  }
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload };
    
    case 'ADD_FORM_SUBMISSION':
      return {
        ...state,
        formSubmissions: [...state.formSubmissions, action.payload]
      };
    
    case 'UPDATE_FORM_STATUS':
      return {
        ...state,
        formSubmissions: state.formSubmissions.map(submission =>
          submission.id === action.payload.id
            ? { ...submission, status: action.payload.status }
            : submission
        )
      };
    
    case 'UPDATE_PREFERENCES':
      const newPreferences = { ...state.userPreferences, ...action.payload };
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      return { ...state, userPreferences: newPreferences };
    
    case 'TRACK_INTERACTION':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          interactions: [...state.analytics.interactions, action.payload]
        }
      };
    
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Utility functions
export const generateId = () => Math.random().toString(36).substr(2, 9);

export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackPageView = (pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
    });
  }
};