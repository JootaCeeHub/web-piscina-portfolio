import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { errorReporting } from './utils/errorReporting';
import { performanceMonitoring } from './utils/performanceMonitoring';

// Initialize error reporting and performance monitoring
errorReporting.setupGlobalErrorHandlers();
performanceMonitoring.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
