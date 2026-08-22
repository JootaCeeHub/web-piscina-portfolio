import React, { useState } from 'react';
import SEOHead from '../components/SEO/SEOHead';
import ContactForm from '../components/Forms/ContactForm';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Home,
  DollarSign,
  FileText,
  Download,
  Star
} from 'lucide-react';

const Contact: React.FC = () => {

  const contactInfo = [
    {
      icon: Phone,
      title: 'Teléfono Premium',
      content: '+56 9 0000 0000',
      description: 'Línea directa para clientes premium',
      action: 'tel:+56900000000'
    },
    {
      icon: Mail,
      title: 'Email Ejecutivo',
      content: 'contacto@piscinasandinas.example.com',
      description: 'Respuesta garantizada en 2 horas',
      action: 'mailto:contacto@piscinasandinas.example.com'
    },
    {
      icon: MapPin,
      title: 'Showroom Santiago',
      content: 'Santiago, Chile',
      description: 'Visitas con cita previa',
      action: '#'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp VIP',
      content: '+56 9 0000 0000',
      description: 'Atención inmediata 24/7',
      action: 'whatsapp'
    }
  ];

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

  const services = [
    {
      title: 'Consulta Técnica Gratuita',
      description: 'Evaluación del sitio y diseño preliminar',
      icon: FileText,
      included: true
    },
    {
      title: 'Visita de Especialista',
      description: 'Ingeniero especializado visita tu hogar',
      icon: User,
      included: true
    },
    {
      title: 'Propuesta Personalizada',
      description: 'Diseño 3D y cotización detallada',
      icon: Home,
      included: true
    },
    {
      title: 'Financiamiento Premium',
      description: 'Planes flexibles hasta 60 meses',
      icon: DollarSign,
      included: true
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <SEOHead 
        title="Contacto - Solicita tu Cotización Gratuita"
        description="Contacta con Piscinas Andinas para solicitar tu cotización gratuita. Visita técnica sin compromiso. Teléfono, email y WhatsApp disponibles."
        keywords="contacto piscinas fibra vidrio, cotización piscinas Chile, visita técnica gratuita"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Premium */}
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
            Contacto Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Agenda tu consulta técnica gratuita con nuestros especialistas. Diseñamos y fabricamos 
            la piscina de tus sueños con la más alta calidad y tecnología de vanguardia.
          </p>
          
          {/* Premium Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  <div className="mt-3 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-xs text-green-600 font-medium">Incluido</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Premium Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900" id="contact-form">
                  Solicitud de Consulta Premium
                </h2>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <ContactForm formType="contact" />
            </div>
          </div>

          {/* Contact Information Premium */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contacto Directo</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const IconComponent = info.icon;
                  return (
                    <div key={index} className="group">
                      <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                           onClick={() => {
                             if (info.action === 'whatsapp') {
                               window.open('https://wa.me/56900000000', '_blank');
                             } else if (info.action.startsWith('tel:') || info.action.startsWith('mailto:')) {
                               window.location.href = info.action;
                             }
                           }}>
                        <div className="bg-blue-100 rounded-full p-3 flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{info.title}</h4>
                          <p className="text-gray-700 font-medium">{info.content}</p>
                          <p className="text-sm text-gray-500">{info.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Hours Premium */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Horarios de Atención</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Lunes - Viernes</span>
                  <span className="font-semibold text-gray-900">8:00 - 19:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Sábados</span>
                  <span className="font-semibold text-gray-900">9:00 - 15:00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Domingos</span>
                  <span className="text-gray-500">Solo emergencias</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <span className="text-lg font-semibold text-green-800">WhatsApp VIP 24/7</span>
                    <p className="text-sm text-green-700 mt-1">
                      Atención inmediata para clientes premium todos los días del año
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Service */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Servicio Premium</h3>
              <p className="text-blue-100 mb-6">
                Para proyectos urgentes o consultas especiales, nuestro equipo premium 
                está disponible para atención inmediata.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-blue-100">Respuesta garantizada en 2 horas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-blue-100">Visita técnica en 24-48 horas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-300" />
                  <span className="text-blue-100">Propuesta personalizada en 72 horas</span>
                </div>
              </div>
              <button
                onClick={() => window.open('https://wa.me/56900000000?text=Necesito atención premium para mi proyecto de piscina', '_blank')}
                className="w-full bg-white text-blue-900 hover:bg-gray-100 px-6 py-4 rounded-xl font-semibold transition-colors inline-flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Activar Servicio Premium</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;