import React, { useState } from 'react';
import { 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin,
  MessageCircle,
  User,
  Home,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useFormspree } from '../../hooks/useFormspree';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useContactFormTest } from '../ABTesting/ABTestProvider';
import { advancedAnalyticsUtils } from '../Analytics/AdvancedAnalytics';
import { sentryUtils } from '../../monitoring/sentry';
import { useNotifications } from '../Notification/NotificationSystem';
import LoadingSpinner from '../Loading/LoadingSpinner';

interface ContactFormProps {
  formType?: 'contact' | 'quote' | 'visit';
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  formType = 'contact',
  className = ''
}) => {
  const { submitForm, isSubmitting, succeeded, errors } = useFormspree({
    formId: 'xpwagdkv', // Replace with your actual Formspree form ID
    formType
  });
  
  const { trackCTAClick } = useAnalytics();
  const contactFormTest = useContactFormTest();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    poolType: '',
    budget: '',
    timeline: '',
    message: '',
    visitRequest: false,
    source: 'website'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form start
    advancedAnalyticsUtils.trackFormInteraction('contact_form', 'submit_attempt');
    contactFormTest.trackConversion('form_submit_attempt');
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.message) {
      advancedAnalyticsUtils.trackFormInteraction('contact_form', 'validation_error');
      addNotification({
        type: 'error',
        title: 'Campos requeridos',
        message: 'Por favor completa todos los campos obligatorios.'
      });
      return;
    }
    
    trackCTAClick(`form_submit_${formType}`);
    
    const submissionData = {
      ...formData,
      formType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      abTestVariant: contactFormTest.variant
    };

    try {
      await submitForm(submissionData);
      
      if (succeeded) {
        // Track successful submission
        advancedAnalyticsUtils.trackFormInteraction('contact_form', 'submit_success');
        contactFormTest.trackConversion('form_submit_success');
        sentryUtils.trackFormSubmission('contact_form', true);
        
        addNotification({
          type: 'success',
          title: '¡Solicitud enviada!',
          message: 'Te contactaremos dentro de las próximas 2 horas.'
        });
      }
    } catch (error) {
      // Track failed submission
      advancedAnalyticsUtils.trackFormInteraction('contact_form', 'submit_error');
      contactFormTest.trackConversion('form_submit_error');
      sentryUtils.trackFormSubmission('contact_form', false, error as Error);
      
      addNotification({
        type: 'error',
        title: 'Error al enviar',
        message: 'Hubo un problema al enviar tu solicitud. Inténtalo nuevamente.'
      });
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola, me interesa una piscina de fibra de vidrio.
    
Detalles:
- Nombre: ${formData.name || 'Cliente interesado'}
- Ubicación: ${formData.location || 'Por definir'}
- Tipo de piscina: ${formData.poolType || 'Por definir'}
- Presupuesto: ${formData.budget || 'Por definir'}
- Timeline: ${formData.timeline || 'Por definir'}

¿Podrían contactarme para agendar una visita técnica?`;
    
    window.open(`https://wa.me/56900000000?text=${encodeURIComponent(message)}`, '_blank');
    trackCTAClick('whatsapp_form');
  };

  const poolTypes = [
    'Elegance 8x4 - Desde $18.500.000',
    'Prestige 10x5 - Desde $28.900.000',
    'Infinity 12x6 - Desde $45.000.000',
    'Diseño Personalizado - Cotización'
  ];

  const budgetRanges = [
    '$15.000.000 - $25.000.000',
    '$25.000.000 - $35.000.000',
    '$35.000.000 - $50.000.000',
    'Más de $50.000.000'
  ];

  const timelineOptions = [
    'Lo antes posible',
    'Próximos 3 meses',
    'Próximos 6 meses',
    'Próximo año'
  ];

  if (succeeded) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-6">¡Solicitud Recibida!</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          Nuestro equipo de especialistas se contactará contigo dentro de las próximas 2 horas 
          para agendar tu consulta técnica gratuita.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleWhatsApp}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors inline-flex items-center space-x-2"
            aria-label="Contactar por WhatsApp para respuesta inmediata"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp para Respuesta Inmediata</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`space-y-8 ${className}`} 
      noValidate
      data-testid="contact-form"
    >
      {/* Error Display */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4" role="alert">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">Error al enviar el formulario</span>
          </div>
          <ul className="mt-2 text-red-700 text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Personal Information */}
      <fieldset>
        <legend className="text-xl font-semibold text-gray-900 mb-6">Información Personal</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
              Nombre Completo *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                aria-required="true"
                aria-describedby="name-error"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="Tu nombre completo"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                aria-required="true"
                aria-describedby="email-error"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
              Teléfono *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                aria-required="true"
                aria-describedby="phone-error"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="+56 9 0000 0000"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
              Ubicación del Proyecto *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                aria-required="true"
                aria-describedby="location-error"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="Comuna, Ciudad"
              />
            </div>
          </div>
        </div>
      </fieldset>

      {/* Project Details */}
      <fieldset>
        <legend className="text-xl font-semibold text-gray-900 mb-6">Detalles del Proyecto</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="poolType" className="block text-sm font-semibold text-gray-700 mb-3">
              Modelo de Interés
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="poolType"
                name="poolType"
                value={formData.poolType}
                onChange={handleInputChange}
                aria-describedby="poolType-help"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg appearance-none bg-white"
              >
                <option value="">Selecciona un modelo</option>
                {poolTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-3">
              Presupuesto Estimado
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                aria-describedby="budget-help"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg appearance-none bg-white"
              >
                <option value="">Selecciona rango</option>
                {budgetRanges.map((range, index) => (
                  <option key={index} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-3">
              Timeline del Proyecto
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                aria-describedby="timeline-help"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg appearance-none bg-white"
              >
                <option value="">Selecciona timeline</option>
                {timelineOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
          Detalles del Proyecto *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          aria-required="true"
          aria-describedby="message-help"
          rows={6}
          className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-lg"
          placeholder="Describe tu proyecto: dimensiones del espacio, características deseadas, equipamiento especial, etc."
        ></textarea>
        <p id="message-help" className="mt-2 text-sm text-gray-500">
          Incluye toda la información relevante para tu proyecto
        </p>
      </div>

      {/* Visit Request */}
      <div className="bg-blue-50 rounded-xl p-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="visitRequest"
            checked={formData.visitRequest}
            onChange={handleInputChange}
            className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            aria-describedby="visit-help"
          />
          <div>
            <span className="text-lg font-semibold text-gray-900">
              Solicitar Visita Técnica Gratuita
            </span>
            <p id="visit-help" className="text-gray-600 mt-1">
              Un ingeniero especializado visitará tu hogar para evaluar el sitio, 
              tomar medidas y crear una propuesta personalizada.
            </p>
          </div>
        </label>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row gap-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white px-8 py-5 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center space-x-3 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-describedby="submit-help"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="md" color="white" />
              <span>Enviando Solicitud...</span>
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              <span>Enviar Solicitud</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={handleWhatsApp}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-8 py-5 rounded-xl font-semibold text-lg transition-colors inline-flex items-center justify-center space-x-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Contactar directamente por WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
          <span>WhatsApp Directo</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="flex items-start space-x-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
        <div>
          <p className="font-medium text-gray-900 mb-1">Compromiso de Privacidad</p>
          <p>
            Tus datos están protegidos y solo serán utilizados para contactarte sobre tu proyecto. 
            No compartimos información con terceros y puedes solicitar su eliminación en cualquier momento.
          </p>
        </div>
      </div>
    </form>
  );
};

export default ContactForm;