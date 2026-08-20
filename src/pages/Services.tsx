import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import LazyImage from '../components/LazyImage/LazyImage';
import { 
  ArrowRight, 
  CheckCircle, 
  Waves,
  Building2,
  Wrench,
  Sparkles,
  Filter,
  Eye,
  X,
  MapPin,
  Calendar,
  Users,
  Star,
  Award,
  Droplets,
  Settings,
  Thermometer,
  Zap,
  Shield,
  Timer,
  Beaker,
  Download,
  Phone
} from 'lucide-react';

const Services: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const poolCategories = [
    {
      title: 'Piscinas Residenciales Premium',
      icon: Waves,
      description: 'Modelos exclusivos para hogares de alto estándar con tecnología avanzada',
      color: 'blue',
      id: 'residencial',
      models: [
        {
          name: 'Elegance 8x4',
          image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
          dimensions: '8.0 x 4.0 x 1.5m',
          capacity: '48,000L',
          description: 'Modelo compacto ideal para espacios medianos. Incluye escalera integrada, banco perimetral e iluminación LED.',
          features: ['Escalera integrada', 'Banco perimetral', 'Iluminación LED RGB', 'Sistema de filtración', 'Bomba 1.5 HP'],
          price: 'Desde $18.500.000',
          installationTime: '7-8 días',
          warranty: '25 años estructura',
          popular: true
        },
        {
          name: 'Prestige 10x5',
          image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=600',
          dimensions: '10.0 x 5.0 x 1.8m',
          capacity: '90,000L',
          description: 'Piscina familiar con zona profunda y amplio espacio para natación. Opción de hidromasaje integrado.',
          features: ['Zona profunda 1.8m', 'Escalera ancha', 'Hidromasaje opcional', 'Bomba 2.5 HP', 'Control automático'],
          price: 'Desde $28.900.000',
          installationTime: '8-10 días',
          warranty: '25 años estructura',
          popular: false
        },
        {
          name: 'Infinity 12x6',
          image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
          dimensions: '12.0 x 6.0 x 2.0m',
          capacity: '144,000L',
          description: 'Modelo premium con borde infinito y zona spa integrada. Automatización completa y climatización.',
          features: ['Borde infinito', 'Zona spa integrada', 'Automatización WiFi', 'Climatización', 'Bomba 3 HP'],
          price: 'Desde $45.000.000',
          installationTime: '10-12 días',
          warranty: '25 años estructura',
          popular: false
        }
      ]
    },
    {
      title: 'Equipamiento y Tecnología',
      icon: Settings,
      description: 'Sistemas avanzados de filtración, climatización y automatización',
      color: 'green',
      id: 'equipamiento',
      models: [
        {
          name: 'Sistema de Filtración Premium',
          image: 'https://images.pexels.com/photos/5691604/pexels-photo-5691604.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Filtros de arena sílica de alta capacidad con retrolavado automático y control de presión.',
          features: ['Filtro arena sílica', 'Retrolavado automático', 'Manómetro digital', 'Válvula 6 vías', 'Garantía 5 años'],
          price: 'Desde $2.800.000',
          installationTime: '1 día',
          warranty: '5 años equipo'
        },
        {
          name: 'Climatización Inteligente',
          image: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Bombas de calor con control WiFi y programación horaria para máxima eficiencia energética.',
          features: ['Bomba de calor inverter', 'Control WiFi', 'Programación horaria', 'Eficiencia 500%', 'Pantalla digital'],
          price: 'Desde $4.200.000',
          installationTime: '1-2 días',
          warranty: '3 años equipo'
        },
        {
          name: 'Automatización Total',
          image: 'https://images.pexels.com/photos/6045790/pexels-photo-6045790.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Sistema completo de control desde smartphone con sensores IoT y mantenimiento predictivo.',
          features: ['App móvil exclusiva', 'Sensores IoT', 'Control pH automático', 'Dosificación cloro', 'Alertas inteligentes'],
          price: 'Desde $3.500.000',
          installationTime: '2 días',
          warranty: '2 años sistema'
        }
      ]
    },
    {
      title: 'Servicios Especializados',
      icon: Wrench,
      description: 'Mantenimiento, reparaciones y actualizaciones tecnológicas',
      color: 'orange',
      id: 'servicios',
      models: [
        {
          name: 'Mantenimiento Premium',
          image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Servicio integral de mantenimiento con visitas programadas y monitoreo remoto.',
          features: ['Visitas mensuales', 'Análisis químico', 'Limpieza equipos', 'Monitoreo remoto', 'Reporte digital'],
          price: 'Desde $180.000/mes',
          warranty: 'Servicio garantizado'
        },
        {
          name: 'Reparación Especializada',
          image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Reparación de grietas, renovación de gel coat y actualización de sistemas.',
          features: ['Diagnóstico gratuito', 'Reparación invisible', 'Gel coat nuevo', 'Garantía 5 años', 'Servicio express'],
          price: 'Desde $800.000',
          installationTime: '3-5 días',
          warranty: '5 años reparación'
        },
        {
          name: 'Actualización Tecnológica',
          image: 'https://images.pexels.com/photos/6045790/pexels-photo-6045790.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: 'Modernización de piscinas existentes con nueva tecnología y automatización.',
          features: ['Evaluación técnica', 'Nuevos equipos', 'Automatización', 'Eficiencia energética', 'Garantía total'],
          price: 'Desde $3.000.000',
          installationTime: '5-7 días',
          warranty: '3 años equipos'
        }
      ]
    }
  ];

  const portfolioProjects = [
    {
      id: 1,
      title: 'Villa Premium Las Condes',
      category: 'residencial',
      location: 'Las Condes, Santiago',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Piscina Infinity 12x6 con borde infinito, zona spa y automatización completa. Proyecto integral con paisajismo.',
      features: ['Borde infinito', 'Zona spa integrada', 'Automatización WiFi', 'Climatización', 'Paisajismo integral'],
      duration: '12 días',
      client: 'Familia Morales',
      testimonial: 'Superó todas nuestras expectativas. La calidad es excepcional y el servicio impecable.',
      year: '2024',
      rating: 5,
      investment: '$52.000.000'
    },
    {
      id: 2,
      title: 'Casa de Campo Vitacura',
      category: 'residencial',
      location: 'Vitacura, Santiago',
      image: 'https://images.pexels.com/photos/1263349/pexels-photo-1263349.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Piscina Prestige 10x5 con sistema de climatización y control inteligente. Instalación en tiempo récord.',
      features: ['Climatización inteligente', 'Control WiFi', 'Iluminación RGB', 'Sistema anti-algas', 'Bomba variable'],
      duration: '9 días',
      client: 'Sr. Ricardo Silva',
      testimonial: 'La tecnología es increíble. Controlo todo desde mi teléfono y el mantenimiento es mínimo.',
      year: '2024',
      rating: 5,
      investment: '$32.500.000'
    },
    {
      id: 3,
      title: 'Residencia Viña del Mar',
      category: 'residencial',
      location: 'Viña del Mar',
      image: 'https://images.pexels.com/photos/6045790/pexels-photo-6045790.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Piscina Elegance 8x4 con hidromasaje integrado y sistema de filtración premium.',
      features: ['Hidromasaje 6 jets', 'Filtración premium', 'Escalera ergonómica', 'Iluminación LED', 'Control automático'],
      duration: '8 días',
      client: 'Familia Rodríguez',
      testimonial: 'Perfecta para nuestra familia. La calidad del agua es cristalina siempre.',
      year: '2024',
      rating: 5,
      investment: '$22.800.000'
    },
    {
      id: 4,
      title: 'Modernización Tecnológica',
      category: 'servicios',
      location: 'Lo Barnechea, Santiago',
      image: 'https://images.pexels.com/photos/5691604/pexels-photo-5691604.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Actualización completa de piscina existente con nueva automatización y equipos de alta eficiencia.',
      features: ['Automatización total', 'Bomba inverter', 'Sensores IoT', 'App móvil', 'Eficiencia 60% mayor'],
      duration: '6 días',
      client: 'Sr. Carlos Mendoza',
      testimonial: 'Transformaron mi piscina antigua en una de última generación. Increíble.',
      year: '2024',
      rating: 5,
      investment: '$8.500.000'
    },
    {
      id: 5,
      title: 'Sistema Premium Completo',
      category: 'equipamiento',
      location: 'La Dehesa, Santiago',
      image: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/5691520/pexels-photo-5691520.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Instalación de equipamiento premium: filtración, climatización y automatización en piscina existente.',
      features: ['Filtro arena premium', 'Bomba calor inverter', 'Control pH automático', 'Dosificador cloro', 'Monitoreo 24/7'],
      duration: '4 días',
      client: 'Sra. Patricia González',
      testimonial: 'El sistema es tan eficiente que redujo mis costos de mantención a la mitad.',
      year: '2024',
      rating: 5,
      investment: '$12.200.000'
    },
    {
      id: 6,
      title: 'Reparación y Renovación',
      category: 'servicios',
      location: 'Ñuñoa, Santiago',
      image: 'https://images.pexels.com/photos/261101/pexels-photo-261101.jpeg?auto=compress&cs=tinysrgb&w=800',
      beforeImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Reparación completa de piscina con grietas y renovación total del gel coat.',
      features: ['Reparación grietas', 'Gel coat nuevo', 'Renovación total', 'Garantía 5 años', 'Como nueva'],
      duration: '5 días',
      client: 'Condominio Los Aromos',
      testimonial: 'Quedó mejor que nueva. El trabajo fue impecable y muy profesional.',
      year: '2024',
      rating: 5,
      investment: '$4.800.000'
    }
  ];

  const certifications = [
    'ISO 9001:2015 - Gestión de Calidad',
    'Certificación Materiales Compuestos',
    'ANSI/NSPI Standards - Piscinas',
    'Certificación Ambiental ISO 14001',
    'Registro Nacional Contratistas',
    'Certificación Técnica Fibra de Vidrio'
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-200',
        gradient: 'from-blue-500 to-blue-600'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:bg-green-200',
        gradient: 'from-green-500 to-green-600'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-200',
        gradient: 'from-purple-500 to-purple-600'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-200',
        gradient: 'from-orange-500 to-orange-600'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const filteredProjects = selectedCategory === 'all' 
    ? portfolioProjects 
    : portfolioProjects.filter(project => project.category === selectedCategory);

  const filterOptions = [
    { id: 'all', label: 'Todos los Proyectos', count: portfolioProjects.length },
    { id: 'residencial', label: 'Piscinas Residenciales', count: portfolioProjects.filter(p => p.category === 'residencial').length },
    { id: 'equipamiento', label: 'Equipamiento', count: portfolioProjects.filter(p => p.category === 'equipamiento').length },
    { id: 'servicios', label: 'Servicios', count: portfolioProjects.filter(p => p.category === 'servicios').length }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <SEOHead 
        title="Catálogo de Piscinas y Servicios"
        description="Descubre nuestro catálogo completo de piscinas de fibra de vidrio, equipamiento tecnológico y servicios especializados. Modelos desde $18.500.000."
        keywords="catálogo piscinas fibra vidrio, modelos piscinas Chile, equipamiento piscinas, servicios piscinas"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Premium */}
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
            Catálogo Premium de Piscinas
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Descubre nuestra línea exclusiva de piscinas de fibra de vidrio, equipamiento de vanguardia 
            y servicios especializados para clientes exigentes que buscan la máxima calidad.
          </p>
          
          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/contacto"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Agendar Visita Técnica</span>
            </Link>
            <button
              onClick={() => window.open('#', '_blank')}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Descargar Catálogo PDF</span>
            </button>
          </div>
        </div>

        {/* Categorías de Productos */}
        {poolCategories.map((category, categoryIndex) => {
          const colorClasses = getColorClasses(category.color);
          const IconComponent = category.icon;
          
          return (
            <div key={categoryIndex} className="mb-24">
              {/* Category Header */}
              <div className="text-center mb-16">
                <div className={`inline-flex items-center justify-center w-20 h-20 ${colorClasses.bg} rounded-full mb-6`}>
                  <IconComponent className={`w-10 h-10 ${colorClasses.text}`} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">{category.title}</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">{category.description}</p>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {category.models.map((model, modelIndex) => (
                  <div key={modelIndex} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative overflow-hidden">
                      <LazyImage
                        src={model.image}
                        alt={model.name}
                        className="w-full h-64 transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4">
                        {model.popular && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-2 block">
                            Más Popular
                          </span>
                        )}
                        <span className={`px-3 py-1 ${colorClasses.bg} ${colorClasses.text} rounded-full text-sm font-medium ${colorClasses.border} border`}>
                          {category.title.split(' ')[0]}
                        </span>
                      </div>
                      
                      <div className="absolute top-4 right-4">
                        <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {model.price}
                        </div>
                      </div>

                      {/* Installation Time */}
                      {model.installationTime && (
                        <div className="absolute bottom-4 left-4">
                          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                            <Timer className="w-3 h-3" />
                            <span>{model.installationTime}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-8">
                      <h3 className="text-2xl font-semibold text-gray-900 mb-3">{model.name}</h3>
                      
                      {/* Dimensions for pools */}
                      {model.dimensions && (
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Dimensiones:</span>
                            <div className="font-semibold text-gray-900">{model.dimensions}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Capacidad:</span>
                            <div className="font-semibold text-gray-900">{model.capacity}</div>
                          </div>
                        </div>
                      )}
                      
                      <p className="text-gray-600 mb-6">{model.description}</p>
                      
                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Características incluidas:</h4>
                        <ul className="space-y-2">
                          {model.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Warranty */}
                      {model.warranty && (
                        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">Garantía: {model.warranty}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Price and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-blue-600">{model.price}</div>
                        <Link
                          to="/contacto"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
                        >
                          <span>Cotizar</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Certificaciones y Garantías */}
        <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-8 lg:p-12 text-white mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Certificaciones y Garantías</h2>
            <p className="text-xl text-blue-100">Respaldo técnico y calidad certificada internacionalmente</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="w-6 h-6 text-blue-300 flex-shrink-0" />
                <span className="text-blue-100">{cert}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4">
              <Shield className="w-8 h-8 text-blue-300" />
              <div className="text-left">
                <div className="text-xl font-bold">Garantía Integral 25 Años</div>
                <div className="text-blue-200">Estructura, gel coat y mano de obra</div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio de Proyectos */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Proyectos Realizados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conoce algunos de nuestros trabajos más destacados y exitosos
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedCategory(option.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  selectedCategory === option.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{option.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === option.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div key={project.id} className="group cursor-pointer">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="relative overflow-hidden">
                    <LazyImage
                      src={project.image}
                      alt={project.title}
                      className="w-full h-48 transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Overlay Content */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Ver Detalles</span>
                      </button>
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {project.year}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="flex">
                        {[...Array(project.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {project.investment}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{project.duration}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 italic mb-2">"{project.testimonial}"</p>
                      <p className="text-sm font-medium text-gray-900">- {project.client}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl shadow-lg p-8 lg:p-12 text-center text-white mt-20">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            ¿Listo para Tu Piscina de Ensueño?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Agenda una visita técnica gratuita y descubre cómo podemos crear 
            la piscina perfecta para tu hogar. Financiamiento disponible.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contacto"
              className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Agendar Visita Técnica Gratuita
            </Link>
            <button
              onClick={() => window.open('https://wa.me/56987654321?text=Hola, me interesa una piscina premium de fibra de vidrio. ¿Podrían enviarme el catálogo completo?', '_blank')}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              WhatsApp Directo
            </button>
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Before/After Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative">
                  <LazyImage
                    src={selectedProject.beforeImage}
                    alt="Antes"
                    className="w-full h-64 md:h-80"
                  />
                  <div className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full font-medium">
                    Antes
                  </div>
                </div>
                <div className="relative">
                  <LazyImage
                    src={selectedProject.image}
                    alt="Después"
                    className="w-full h-64 md:h-80"
                  />
                  <div className="absolute bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full font-medium">
                    Después
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedProject.title}</h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedProject.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedProject.year}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600 font-semibold">{selectedProject.investment}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(selectedProject.rating)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 mb-8">{selectedProject.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Características del Proyecto</h4>
                    <ul className="space-y-3">
                      {selectedProject.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Proyecto</h4>
                    <div className="space-y-3 text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                        <span><strong>Ubicación:</strong> {selectedProject.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 mr-3 text-blue-600" />
                        <span><strong>Duración:</strong> {selectedProject.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-3 text-blue-600" />
                        <span><strong>Cliente:</strong> {selectedProject.client}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="w-5 h-5 mr-3 text-blue-600" />
                        <span><strong>Inversión:</strong> {selectedProject.investment}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl p-6">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Testimonio del Cliente</h4>
                  <p className="text-lg text-gray-700 italic mb-3">"{selectedProject.testimonial}"</p>
                  <p className="text-gray-900 font-semibold">- {selectedProject.client}</p>
                </div>

                <div className="mt-8 text-center">
                  <Link
                    to="/contacto"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                  >
                    <span>Solicitar Proyecto Similar</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;