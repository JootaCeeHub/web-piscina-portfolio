import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const CookieConsent: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const hasConsent = localStorage.getItem('cookiesAccepted');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true
    }));
    
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { cookiesAccepted: true }
    });
    
    setIsVisible(false);
    
    // Initialize analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      });
    }
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }));
    
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { cookiesAccepted: true }
    });
    
    setIsVisible(false);
  };

  const rejectAll = () => {
    localStorage.setItem('cookiesAccepted', 'false');
    localStorage.setItem('cookiePreferences', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false
    }));
    
    dispatch({
      type: 'UPDATE_PREFERENCES',
      payload: { cookiesAccepted: false }
    });
    
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-7xl mx-auto p-6">
        {!showDetails ? (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4 flex-1">
              <Cookie className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Utilizamos cookies para mejorar tu experiencia
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas 
                  para entender cómo interactúas con nuestro contenido. Esto nos ayuda a mejorar 
                  nuestros servicios y ofrecerte una mejor experiencia.
                </p>
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 underline"
                >
                  Ver detalles de cookies
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={rejectAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Rechazar todo
              </button>
              <button
                onClick={acceptNecessary}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Solo necesarias
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Configuración de Cookies</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar detalles"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Cookies Necesarias</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Esenciales para el funcionamiento básico del sitio web. No se pueden desactivar.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Siempre activas</span>
                  <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Cookies Analíticas</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Nos ayudan a entender cómo los visitantes interactúan con el sitio web.
                </p>
                <div className="text-sm text-gray-500">
                  Google Analytics, Hotjar
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Cookie className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Cookies de Marketing</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Utilizadas para mostrar anuncios relevantes y medir la efectividad de campañas.
                </p>
                <div className="text-sm text-gray-500">
                  Facebook Pixel, Google Ads
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={rejectAll}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Rechazar todo
              </button>
              <button
                onClick={acceptNecessary}
                className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Solo necesarias
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;