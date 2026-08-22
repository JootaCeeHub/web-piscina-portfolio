import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import LazyImage from '../components/LazyImage/LazyImage';
import { useAnalytics } from '../hooks/useAnalytics';
import { useHeroTest, useCTATest } from '../components/ABTesting/ABTestProvider';
import { advancedAnalyticsUtils } from '../components/Analytics/AdvancedAnalytics';
import { 
  CheckCircle, 
  Wrench, 
  MapPin, 
  Calendar,
  ArrowRight,
  Star,
  Shield,
  Zap,
  Users,
  Award,
  Eye,
  X,
  Droplets,
  Timer,
  Thermometer,
  Settings,
  Beaker,
  Mountain,
  Sparkles,
  TrendingUp,
  Factory,
  Microscope,
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  Phone,
  MessageCircle,
  Target,
  Heart
} from 'lucide-react';

const Home: React.FC = () => {
  const { trackCTAClick, trackCarouselInteraction } = useAnalytics();
  const heroTest = useHeroTest();
  const ctaTest = useCTATest();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentEquipment, setCurrentEquipment] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  // Intersection Observer para animaciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleCTAClick = () => {
    // Track A/B test conversion
    heroTest.trackConversion('hero_cta_click');
    ctaTest.trackConversion('primary_cta_click');
    
    // Track advanced analytics
    advancedAnalyticsUtils.trackFormInteraction('hero_cta', 'click');
    
    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fiberglassAdvantages = [
    {
      icon: Timer,
      title: 'Instalación Acelerada',
      description: 'Instalación completa en 7-10 días vs 2-3 meses del hormigón tradicional',
      highlight: '70% más rápido',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Durabilidad Excepcional',
      description: 'Resistencia garantizada por 25 años con mantenimiento mínimo',
      highlight: '25 años garantía',
      color: 'green'
    },
    {
      icon: Droplets,
      title: 'Superficie No Porosa',
      description: 'Gel coat de alta calidad que evita proliferación de algas y bacterias',
      highlight: '99% menos bacterias',
      color: 'cyan'
    },
    {
      icon: Thermometer,
      title: 'Aislación Térmica Superior',
      description: 'Mantiene la temperatura del agua 3-5°C más que otros materiales',
      highlight: '40% menos energía',
      color: 'orange'
    },
    {
      icon: Beaker,
      title: 'Resistencia Química Total',
      description: 'Inmune a cloro, sal y productos químicos de mantenimiento',
      highlight: 'Resistencia absoluta',
      color: 'purple'
    },
    {
      icon: Mountain,
      title: 'Flexibilidad Sísmica',
      description: 'Material flexible que absorbe movimientos telúricos sin agrietarse',
      highlight: 'Antisísmico',
      color: 'emerald'
    }
  ];

  const technicalSpecs = [
    {
      title: 'Grosor de Fibra',
      value: '6-8mm',
      description: 'Laminado multicapa con resina isoftálica',
      icon: Factory
    },
    {
      title: 'Gel Coat',
      value: '0.6mm',
      description: 'Acabado superior con protección UV',
      icon: Sparkles
    },
    {
      title: 'Resistencia',
      value: '450 MPa',
      description: 'Resistencia a la tracción certificada',
      icon: Shield
    },
    {
      title: 'Temperatura',
      value: '-20°C a +80°C',
      description: 'Rango operativo extremo',
      icon: Thermometer
    }
  ];

  const equipmentFeatures = [
    {
      icon: Settings,
      title: 'Bombas de Alto Rendimiento',
      description: 'Motores Pentair o Hayward con eficiencia energética A+++',
      specs: ['1.5-3 HP según tamaño', 'Velocidad variable', 'Control remoto'],
      image: 'https://images.pexels.com/photos/5691604/pexels-photo-5691604.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Droplets,
      title: 'Sistemas de Filtración Avanzada',
      description: 'Filtros de arena sílica o cartuchos de alta capacidad',
      specs: ['Filtración 20-40 micrones', 'Retrolavado automático', 'Indicador de presión'],
      image: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Thermometer,
      title: 'Climatización Inteligente',
      description: 'Calefactores eléctricos o bombas de calor con termostato digital',
      specs: ['Control WiFi', 'Programación horaria', 'Eficiencia 500%'],
      image: 'https://images.pexels.com/photos/6045790/pexels-photo-6045790.jpeg?auto=compress&cs=tinysrgb&w=600'
    },
    {
      icon: Zap,
      title: 'Automatización Total',
      description: 'Sistema de control completo desde smartphone',
      specs: ['App móvil exclusiva', 'Sensores IoT', 'Mantenimiento predictivo'],
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600'
    }
  ];

  const poolModels = [
    {
      name: 'Elegance 8x4',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
      dimensions: '8.0 x 4.0 x 1.5m',
      capacity: '48,000L',
      features: ['Escalera integrada', 'Banco perimetral', 'Iluminación LED'],
      price: 'Desde $18.500.000',
      popular: true,
      description: 'Modelo compacto ideal para espacios medianos con diseño elegante y funcional.'
    },
    {
      name: 'Prestige 10x5',
      image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=600',
      dimensions: '10.0 x 5.0 x 1.8m',
      capacity: '90,000L',
      features: ['Zona profunda', 'Escalera ancha', 'Hidromasaje opcional'],
      price: 'Desde $28.900.000',
      popular: false,
      description: 'Piscina familiar con zona profunda y amplio espacio para natación.'
    },
    {
      name: 'Infinity 12x6',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
      dimensions: '12.0 x 6.0 x 2.0m',
      capacity: '144,000L',
      features: ['Borde infinito', 'Zona spa', 'Automatización completa'],
      price: 'Desde $45.000.000',
      popular: false,
      description: 'Modelo de lujo con borde infinito y zona spa integrada.'
    }
  ];

  const testimonials = [
    {
      name: 'Cliente A',
      location: 'Santiago, Chile',
      text: 'La calidad de la fibra de vidrio es excepcional. Después de 3 años, la piscina se ve como nueva. La instalación fue impecable y muy rápida.',
      rating: 5,
      project: 'Elegance 8x4',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2024'
    },
    {
      name: 'Cliente B',
      location: 'Santiago, Chile',
      text: 'El sistema de automatización es increíble. Controlo todo desde mi teléfono. El mantenimiento es mínimo comparado con mi piscina anterior.',
      rating: 5,
      project: 'Prestige 10x5',
      image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2024'
    },
    {
      name: 'Cliente C',
      location: 'Zona central de Chile',
      text: 'La inversión valió cada peso. La piscina mantiene perfecta la temperatura y el acabado es de lujo. Piscinas Andinas superó nuestras expectativas.',
      rating: 5,
      project: 'Infinity 12x6',
      image: 'https://images.pexels.com/photos/6045790/pexels-photo-6045790.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2024'
    },
    {
      name: 'Cliente D',
      location: 'Santiago, Chile',
      text: 'El equipo técnico es altamente profesional. Cumplieron todos los plazos y la calidad del trabajo es impecable. Recomiendo 100%.',
      rating: 5,
      project: 'Elegance 8x4',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=400',
      year: '2023'
    }
  ];

  const comparisonData = [
    {
      aspect: 'Tiempo de Instalación',
      fiberglass: '7-10 días',
      concrete: '2-3 meses',
      liner: '2-3 semanas'
    },
    {
      aspect: 'Mantenimiento Anual',
      fiberglass: '$300.000',
      concrete: '$800.000',
      liner: '$600.000'
    },
    {
      aspect: 'Vida Útil',
      fiberglass: '25+ años',
      concrete: '15-20 años',
      liner: '8-12 años'
    },
    {
      aspect: 'Resistencia Química',
      fiberglass: 'Excelente',
      concrete: 'Regular',
      liner: 'Buena'
    }
  ];

  const stats = [
    { number: '200+', label: 'Piscinas Instaladas', icon: Award },
    { number: '8+', label: 'Años de Experiencia', icon: Calendar },
    { number: '15', label: 'Regiones de Chile', icon: MapPin },
    { number: '99%', label: 'Satisfacción del Cliente', icon: Star }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Consulta Técnica',
      description: 'Evaluación del sitio, análisis de suelo y diseño personalizado según necesidades específicas.',
      icon: Target
    },
    {
      step: '02',
      title: 'Fabricación Controlada',
      description: 'Producción en ambiente controlado con materiales superiores y procesos certificados.',
      icon: Factory
    },
    {
      step: '03',
      title: 'Instalación Profesional',
      description: 'Equipo especializado con certificación técnica y herramientas de precisión.',
      icon: Settings
    },
    {
      step: '04',
      title: 'Seguimiento Post-Venta',
      description: 'Programa de mantenimiento y soporte técnico continuo con garantía extendida.',
      icon: Heart
    }
  ];

  // Auto-advance carousels
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % poolModels.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEquipment((prev) => (prev + 1) % equipmentFeatures.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    trackCarouselInteraction('pool_models', 'next');
    setCurrentSlide((prev) => (prev + 1) % poolModels.length);
  };

  const prevSlide = () => {
    trackCarouselInteraction('pool_models', 'prev');
    setCurrentSlide((prev) => (prev - 1 + poolModels.length) % poolModels.length);
  };

  const nextTestimonial = () => {
    trackCarouselInteraction('testimonials', 'next');
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    trackCarouselInteraction('testimonials', 'prev');
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const nextEquipment = () => {
    trackCarouselInteraction('equipment', 'next');
    setCurrentEquipment((prev) => (prev + 1) % equipmentFeatures.length);
  };

  const prevEquipment = () => {
    trackCarouselInteraction('equipment', 'prev');
    setCurrentEquipment((prev) => (prev - 1 + equipmentFeatures.length) % equipmentFeatures.length);
  };

  return (
    <div className="space-y-0">
      <SEOHead 
        title="Piscinas de Fibra de Vidrio de Alto Estándar"
        description="Fabricación e instalación de piscinas de fibra de vidrio de lujo en Chile. Garantía 25 años, instalación en 7-10 días. Más de 200 piscinas instaladas."
        keywords="piscinas fibra de vidrio Chile, piscinas de lujo, instalación piscinas, fibra de vidrio, piscinas residenciales"
      />
      
      {/* Hero Section Avanzado */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-gray-800 text-white overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=1600)'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl">
            <div className="mb-6 animate-fade-in-up">
              <span className="inline-block bg-blue-600/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                Tecnología Avanzada en Fibra de Vidrio
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight animate-fade-in-up animation-delay-200">
              {heroTest.config.headline || 'Piscinas de'} 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300"> Fibra de Vidrio</span>
              <br />de Alto Estándar
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed animate-fade-in-up animation-delay-400">
              {heroTest.config.subheadline || 'Fabricación e instalación de piscinas de lujo con tecnología de vanguardia. Durabilidad garantizada por 25 años y instalación en solo 7-10 días.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-12 animate-fade-in-up animation-delay-600">
              <button
                onClick={handleCTAClick}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-blue-500/25"
                aria-label={ctaTest.config.primaryCTA || "Cotizar mi piscina de lujo"}
              >
                <span>{ctaTest.config.primaryCTA || 'Cotizar Mi Piscina de Lujo'}</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="group border-2 border-white/30 backdrop-blur-sm text-white hover:bg-white/10 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3"
                aria-label={ctaTest.config.secondaryCTA || "Ver proceso de instalación en video"}
              >
                <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>{ctaTest.config.secondaryCTA || 'Ver Proceso de Instalación'}</span>
              </button>
            </div>

            {/* Quick Stats Animados */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up animation-delay-800">
              {stats.slice(0, 4).map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-300 group">
                    <div className="text-2xl lg:text-3xl font-bold text-blue-300 mb-1 group-hover:scale-110 transition-transform">
                      {stat.number}
                    </div>
                    <div className="text-blue-100 text-sm font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scroll Indicator Animado */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center cursor-pointer hover:border-white/50 transition-colors">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* ¿Por qué Fibra de Vidrio? - Mejorado */}
      <section className="py-24 bg-white" id="why-fiberglass" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleElements.has('why-fiberglass') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              ¿Por Qué Elegir Fibra de Vidrio?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              La fibra de vidrio representa la evolución en construcción de piscinas. Un material compuesto 
              de alta tecnología que combina resistencia, durabilidad y estética superior.
            </p>
          </div>

          {/* Proceso de Fabricación Interactivo */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 lg:p-12 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Proceso de Fabricación de Precisión
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => {
                const IconComponent = step.icon;
                return (
                  <div key={index} className="relative group">
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {step.step}
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h4>
                      <p className="text-gray-600 mb-6">{step.description}</p>
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    
                    {/* Connector Line */}
                    {index < processSteps.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform translate-x-4"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ventajas Técnicas con Animaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fiberglassAdvantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-500 group border border-gray-100 hover:border-${advantage.color}-200 transform hover:-translate-y-2`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`bg-${advantage.color}-100 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-${advantage.color}-200 transition-colors group-hover:scale-110 transform duration-300`}>
                    <IconComponent className={`w-8 h-8 text-${advantage.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{advantage.title}</h3>
                  <p className="text-gray-600 mb-4">{advantage.description}</p>
                  <div className={`bg-gradient-to-r from-${advantage.color}-600 to-${advantage.color}-700 text-white px-4 py-2 rounded-full text-sm font-semibold inline-block`}>
                    {advantage.highlight}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Especificaciones Técnicas Mejoradas */}
          <div className="mt-20 bg-gray-900 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-3xl font-bold mb-8 text-center">Especificaciones Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {technicalSpecs.map((spec, index) => {
                const IconComponent = spec.icon;
                return (
                  <div key={index} className="text-center group hover:bg-white/5 rounded-lg p-4 transition-all duration-300">
                    <div className="bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-blue-400 mb-2 group-hover:text-blue-300 transition-colors">{spec.value}</div>
                    <div className="text-xl font-semibold mb-2">{spec.title}</div>
                    <div className="text-gray-300 text-sm">{spec.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Equipamiento Tecnológico */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50" id="technology" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleElements.has('technology') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tecnología y Equipamiento de Vanguardia
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Equipamos cada piscina con tecnología de última generación para garantizar 
              el máximo rendimiento, eficiencia energética y facilidad de uso.
            </p>
          </div>

          {/* Carrusel de Equipamiento */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentEquipment * 100}%)` }}>
              {equipmentFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                          <IconComponent className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                        <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                        <ul className="space-y-3">
                          {feature.specs.map((spec, specIndex) => (
                            <li key={specIndex} className="flex items-center text-gray-700">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              <span className="font-medium">{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="relative overflow-hidden">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controles del Carrusel */}
            <button
              onClick={prevEquipment}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextEquipment}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {equipmentFeatures.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentEquipment(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentEquipment ? 'bg-blue-600 scale-125' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Modelos de Piscinas */}
      <section className="py-24 bg-white" id="models" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${visibleElements.has('models') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Catálogo de Modelos Exclusivos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Diseños únicos adaptados a diferentes espacios y necesidades, 
              todos con la misma calidad y tecnología de vanguardia.
            </p>
          </div>

          {/* Carrusel Principal */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {poolModels.map((model, index) => (
                  <div key={index} className="w-full flex-shrink-0 relative">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white">
                      <div className="relative overflow-hidden">
                        <LazyImage
                          src={model.image}
                          alt={model.name}
                          className="w-full h-96 lg:h-full hover:scale-105 transition-transform duration-1000"
                        />
                        {model.popular && (
                          <div className="absolute top-6 left-6">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              Más Solicitado
                            </span>
                          </div>
                        )}
                        <div className="absolute top-6 right-6">
                          <span className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                            {model.price}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <h3 className="text-4xl font-bold text-gray-900 mb-4">{model.name}</h3>
                        <p className="text-lg text-gray-600 mb-6">{model.description}</p>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div>
                            <span className="text-sm text-gray-500 font-medium">Dimensiones</span>
                            <div className="text-xl font-bold text-gray-900">{model.dimensions}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500 font-medium">Capacidad</span>
                            <div className="text-xl font-bold text-gray-900">{model.capacity}</div>
                          </div>
                        </div>
                        
                        <div className="mb-8">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">Características incluidas:</h4>
                          <ul className="space-y-3">
                            {model.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                <span className="font-medium">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold text-blue-600">{model.price}</div>
                          <Link
                            to="/contacto"
                            onClick={() => trackCTAClick('pool_model_cta')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                            aria-label={`Cotizar piscina ${model.name}`}
                          >
                            Cotizar Ahora
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles del Carrusel */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-8 space-x-3">
              {poolModels.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/servicios"
             onClick={() => trackCTAClick('view_catalog')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
             aria-label="Ver catálogo completo de piscinas"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comparación de Materiales Mejorada */}
      <section className="py-24 bg-gray-50" id="comparison" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${visibleElements.has('comparison') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Fibra de Vidrio vs Otros Materiales
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comparación objetiva que demuestra por qué la fibra de vidrio 
              es la elección inteligente para piscinas de alto estándar.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="px-6 py-6 text-left text-lg font-bold text-gray-900">Aspecto</th>
                    <th className="px-6 py-6 text-center text-lg font-bold text-blue-600">Fibra de Vidrio</th>
                    <th className="px-6 py-6 text-center text-lg font-semibold text-gray-600">Hormigón</th>
                    <th className="px-6 py-6 text-center text-lg font-semibold text-gray-600">Liner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-6 font-semibold text-gray-900 text-lg">{row.aspect}</td>
                      <td className="px-6 py-6 text-center">
                        <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-bold text-lg shadow-sm">
                          {row.fiberglass}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center text-gray-600 font-medium">{row.concrete}</td>
                      <td className="px-6 py-6 text-center text-gray-600 font-medium">{row.liner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Carrusel de Testimonios Mejorado */}
      <section className="py-24 bg-white" id="testimonials" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transition-all duration-1000 ${visibleElements.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Testimonios de Clientes Satisfechos
            </h2>
            <p className="text-xl text-gray-600">
              La satisfacción de nuestros clientes es nuestro mayor logro
            </p>
          </div>

          {/* Carrusel de Testimonios */}
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-8 lg:p-12 text-center">
                      <div className="flex justify-center mb-6">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <blockquote className="text-2xl text-gray-700 italic mb-8 leading-relaxed">
                        "{testimonial.text}"
                      </blockquote>
                      <div className="flex items-center justify-center space-x-6">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover shadow-lg"
                        />
                        <div className="text-left">
                          <p className="text-xl font-bold text-gray-900">{testimonial.name}</p>
                          <p className="text-gray-600">{testimonial.location}</p>
                          <p className="text-blue-600 font-semibold">{testimonial.project} • {testimonial.year}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles del Carrusel */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final Mejorado */}
      <section id="contact-section" className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            ¿Listo para Tu Piscina de Ensueño?
          </h2>
          <p className="text-xl mb-12 text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Únete a más de 200 familias que han confiado en Piscinas Andinas para crear 
            su oasis personal. Cotización gratuita, visita técnica sin compromiso y 
            financiamiento disponible.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group">
              <Sparkles className="w-10 h-10 text-blue-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Cotización Gratuita</h3>
              <p className="text-blue-100 text-sm">Evaluación técnica sin costo</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group">
              <TrendingUp className="w-10 h-10 text-blue-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Financiamiento</h3>
              <p className="text-blue-100 text-sm">Planes flexibles disponibles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/15 transition-all duration-300 group">
              <Shield className="w-10 h-10 text-blue-300 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold mb-2">Garantía 25 Años</h3>
              <p className="text-blue-100 text-sm">Respaldo total incluido</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contacto"
              onClick={() => trackCTAClick('final_cta_contact')}
              className="group bg-white text-blue-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-3"
              aria-label="Solicitar cotización exclusiva"
            >
              <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span>Solicitar Cotización Exclusiva</span>
            </Link>
            <button
              onClick={() => window.open('https://wa.me/56900000000?text=Hola, me interesa una piscina de fibra de vidrio de alto estándar. ¿Podrían enviarme información?', '_blank')}
              className="group border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-3"
              aria-label="Contactar por WhatsApp directo"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Video */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full relative">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proceso de Instalación</h3>
              <div className="bg-gray-100 rounded-lg p-12 mb-6">
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Video de instalación próximamente disponible</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contacto"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Agendar Visita Técnica
                </Link>
                <button
                  onClick={() => window.open('#', '_blank')}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Catálogo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;