import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Gift, TrendingUp, Users } from 'lucide-react';
import { useFormspree } from '../../hooks/useFormspree';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFunnelAnalytics } from '../Analytics/FunnelAnalytics';
import { useNotifications } from '../Notification/NotificationSystem';
import LoadingSpinner from '../Loading/LoadingSpinner';

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'sidebar' | 'footer';
  showBenefits?: boolean;
  leadMagnet?: {
    title: string;
    description: string;
    downloadUrl: string;
  };
  className?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({
  variant = 'inline',
  showBenefits = true,
  leadMagnet,
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [source, setSource] = useState('newsletter_signup');
  
  const { submitForm, isSubmitting, succeeded, errors } = useFormspree({
    formId: 'newsletter_signup', // Replace with actual Formspree form ID
    formType: 'newsletter'
  });
  
  const { trackCTAClick } = useAnalytics();
  const { trackFunnelStep } = useFunnelAnalytics();
  const { addNotification } = useNotifications();

  const interestOptions = [
    { id: 'pool_models', label: 'Nuevos Modelos de Piscinas', icon: '🏊‍♂️' },
    { id: 'maintenance_tips', label: 'Tips de Mantenimiento', icon: '🔧' },
    { id: 'special_offers', label: 'Ofertas Especiales', icon: '💰' },
    { id: 'installation_updates', label: 'Actualizaciones de Instalación', icon: '📅' },
    { id: 'technology_news', label: 'Novedades Tecnológicas', icon: '⚡' },
    { id: 'customer_stories', label: 'Historias de Clientes', icon: '⭐' }
  ];

  const benefits = [
    {
      icon: Gift,
      title: 'Ofertas Exclusivas',
      description: 'Acceso prioritario a descuentos y promociones especiales'
    },
    {
      icon: TrendingUp,
      title: 'Tendencias del Mercado',
      description: 'Información actualizada sobre innovaciones en piscinas'
    },
    {
      icon: Users,
      title: 'Comunidad Premium',
      description: 'Únete a más de 2,000 propietarios de piscinas satisfechos'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      addNotification({
        type: 'error',
        title: 'Email requerido',
        message: 'Por favor ingresa tu email para suscribirte.'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      addNotification({
        type: 'error',
        title: 'Email inválido',
        message: 'Por favor ingresa un email válido.'
      });
      return;
    }

    trackCTAClick(`newsletter_signup_${variant}`);
    trackFunnelStep('email_marketing', 'newsletter_signup', { 
      variant, 
      interests: interests.length,
      source 
    });

    const submissionData = {
      email: email.trim(),
      interests,
      source,
      variant,
      timestamp: new Date().toISOString(),
      leadMagnet: leadMagnet?.title,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    try {
      await submitForm(submissionData);
      
      if (succeeded) {
        addNotification({
          type: 'success',
          title: '¡Suscripción exitosa!',
          message: 'Te has suscrito correctamente. Revisa tu email para confirmar.',
          action: leadMagnet ? {
            label: 'Descargar Guía',
            onClick: () => window.open(leadMagnet.downloadUrl, '_blank')
          } : undefined
        });

        // Track successful subscription
        trackFunnelStep('email_marketing', 'subscription_confirmed', { 
          variant, 
          leadMagnet: !!leadMagnet 
        });

        // Reset form
        setEmail('');
        setInterests([]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error en suscripción',
        message: 'Hubo un problema al procesar tu suscripción. Inténtalo nuevamente.'
      });
    }
  };

  const handleInterestToggle = (interestId: string) => {
    setInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'modal':
        return 'bg-white rounded-xl shadow-2xl p-8 max-w-md w-full';
      case 'sidebar':
        return 'bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100';
      case 'footer':
        return 'bg-gray-800 text-white rounded-xl p-6';
      default:
        return 'bg-white rounded-xl shadow-lg p-8 border border-gray-100';
    }
  };

  if (succeeded) {
    return (
      <div className={`${getVariantStyles()} ${className} text-center`}>
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Bienvenido a la Comunidad!
        </h3>
        <p className="text-gray-600 mb-6">
          Te has suscrito exitosamente a nuestro newsletter. Revisa tu email para confirmar 
          tu suscripción y recibir tu primera guía gratuita.
        </p>
        {leadMagnet && (
          <button
            onClick={() => window.open(leadMagnet.downloadUrl, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <Gift className="w-5 h-5" />
            <span>Descargar {leadMagnet.title}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`${getVariantStyles()} ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {leadMagnet ? leadMagnet.title : 'Newsletter Exclusivo'}
        </h3>
        <p className="text-gray-600">
          {leadMagnet 
            ? leadMagnet.description 
            : 'Recibe consejos expertos, ofertas exclusivas y las últimas novedades en piscinas de fibra de vidrio.'
          }
        </p>
      </div>

      {/* Benefits */}
      {showBenefits && (
        <div className="grid grid-cols-1 gap-4 mb-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                  <p className="text-gray-600 text-xs">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="newsletter-email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="newsletter-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        {/* Interests Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Temas de Interés (opcional)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {interestOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={interests.includes(option.id)}
                  onChange={() => handleInterestToggle(option.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {errors && errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error en suscripción</span>
            </div>
            <ul className="mt-2 text-red-700 text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Suscribiendo...</span>
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              <span>
                {leadMagnet ? `Descargar ${leadMagnet.title}` : 'Suscribirme Gratis'}
              </span>
            </>
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-500 text-center">
          Al suscribirte, aceptas recibir emails de Multifibra L.A. Puedes cancelar tu suscripción 
          en cualquier momento. Respetamos tu privacidad y no compartimos tu información.
        </p>
      </form>

      {/* Social Proof */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Más de 2,000 suscriptores satisfechos</span>
        </div>
        <div className="flex justify-center mt-2">
          {[...Array(5)].map((_, i) => (
            <CheckCircle key={i} className="w-4 h-4 text-green-500" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;