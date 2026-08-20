import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import LazyImage from '../components/LazyImage/LazyImage';
import { 
  Award, 
  Users, 
  MapPin, 
  Clock,
  Target,
  Heart,
  Shield,
  Zap,
  Beaker,
  Settings,
  Droplets,
  Thermometer,
  CheckCircle,
  Star,
  TrendingUp,
  Factory,
  Microscope
} from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Excelencia Técnica',
      description: 'Utilizamos tecnología de vanguardia y materiales premium para garantizar resultados superiores en cada proyecto.'
    },
    {
      icon: Zap,
      title: 'Innovación Constante',
      description: 'Investigamos y desarrollamos continuamente nuevas técnicas y materiales para mantenernos a la vanguardia.'
    },
    {
      icon: Shield,
      title: 'Calidad Garantizada',
      description: 'Ofrecemos garantías extendidas de hasta 25 años respaldadas por certificaciones internacionales.'
    },
    {
      icon: Heart,
      title: 'Servicio Premium',
      description: 'Atención personalizada y seguimiento continuo desde el diseño hasta el mantenimiento post-venta.'
    }
  ];

  const stats = [
    { number: '200+', label: 'Piscinas Premium Instaladas' },
    { number: '8+', label: 'Años de Experiencia Especializada' },
    { number: '15', label: 'Regiones de Chile Atendidas' },
    { number: '99%', label: 'Satisfacción del Cliente' }
  ];

  const certifications = [
    'ISO 9001:2015 - Gestión de Calidad',
    'Certificación en Materiales Compuestos Avanzados',
    'ANSI/NSPI Standards - Construcción de Piscinas',
    'Certificación Ambiental ISO 14001',
    'Registro Nacional de Contratistas Especializados',
    'Certificación Técnica en Fibra de Vidrio Marina'
  ];

  const technologyFeatures = [
    {
      icon: Beaker,
      title: 'Laboratorio de Materiales',
      description: 'Laboratorio propio para control de calidad y desarrollo de nuevas formulaciones de resinas y gel coats.'
    },
    {
      icon: Factory,
      title: 'Planta de Fabricación',
      description: 'Instalaciones de 2,000m² con tecnología de moldeado por contacto manual y spray-up automatizado.'
    },
    {
      icon: Microscope,
      title: 'I+D Continuo',
      description: 'Departamento de investigación dedicado al desarrollo de nuevos productos y mejora de procesos.'
    },
    {
      icon: Settings,
      title: 'Automatización',
      description: 'Sistemas de control automatizado para garantizar consistencia y precisión en cada fabricación.'
    }
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
      description: 'Producción en ambiente controlado con materiales premium y procesos certificados.',
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

  const teamMembers = [
    {
      name: 'Ing. Carlos Mendoza',
      position: 'Director Técnico',
      specialization: 'Materiales Compuestos',
      experience: '15+ años',
      image: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Ing. Patricia Silva',
      position: 'Jefa de Producción',
      specialization: 'Procesos de Fabricación',
      experience: '12+ años',
      image: 'https://images.pexels.com/photos/5691604/pexels-photo-5691604.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      name: 'Téc. Roberto González',
      position: 'Supervisor de Instalaciones',
      specialization: 'Instalación y Montaje',
      experience: '10+ años',
      image: 'https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="space-y-0">
      <SEOHead 
        title="Nosotros - Líderes en Tecnología de Fibra de Vidrio"
        description="Conoce la historia de Multifibra L.A., más de 8 años especializados en piscinas de fibra de vidrio. Equipo técnico certificado y tecnología de vanguardia."
        keywords="empresa piscinas fibra vidrio, historia Multifibra, equipo técnico piscinas, certificaciones piscinas Chile"
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-gray-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3866816/pexels-photo-3866816.jpeg?auto=compress&cs=tinysrgb&w=1200)'
          }}
        ></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl">
            <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Líderes en 
              <span className="text-blue-300"> Tecnología de Fibra de Vidrio</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 leading-relaxed">
              Más de 8 años desarrollando soluciones premium en fibra de vidrio para clientes exigentes. 
              Combinamos tradición artesanal con tecnología de vanguardia.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                Nuestra Historia de Excelencia
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-gray-900">Multifibra L.A.</strong> nace de la visión de crear piscinas 
                  de fibra de vidrio que superen los más altos estándares de calidad internacional. Fundada por 
                  ingenieros especializados en materiales compuestos, nuestra empresa se ha posicionado como 
                  referente en el segmento premium.
                </p>
                <p>
                  Iniciamos nuestro camino especializándonos exclusivamente en piscinas residenciales de alto 
                  estándar, desarrollando técnicas propias de fabricación y procesos de control de calidad que 
                  nos distinguen en el mercado chileno.
                </p>
                <p>
                  Hoy, con más de 200 piscinas instaladas y una tasa de satisfacción del 99%, somos la elección 
                  preferida de arquitectos, constructoras premium y familias que buscan la máxima calidad y 
                  durabilidad en sus proyectos acuáticos.
                </p>
              </div>
            </div>
            <div className="relative">
              <LazyImage
                src="https://images.pexels.com/photos/5691604/pexels-photo-5691604.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Instalaciones Multifibra"
                className="rounded-xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold">200+</div>
                  <div className="text-sm">Piscinas Premium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Innovation */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Tecnología e Innovación
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Invertimos continuamente en tecnología y desarrollo para mantener nuestro liderazgo 
              en calidad y innovación en el mercado de piscinas premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologyFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 group text-center">
                  <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Excellence */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Proceso de Excelencia
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada proyecto sigue un proceso meticuloso diseñado para garantizar 
              resultados excepcionales y la máxima satisfacción del cliente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 mb-6">{step.description}</p>
                    <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
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
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Cifras Que Nos Respaldan
            </h2>
            <p className="text-xl text-blue-100">
              Números que reflejan nuestro compromiso con la excelencia y la satisfacción del cliente
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-blue-800 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-700 transition-colors">
                  <TrendingUp className="w-10 h-10 text-blue-200" />
                </div>
                <div className="text-4xl lg:text-5xl font-bold text-blue-300 mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Nuestros Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios fundamentales que guían cada decisión y definen 
              nuestra cultura organizacional orientada a la excelencia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                    <IconComponent className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Equipo de Expertos
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profesionales altamente calificados con años de experiencia en 
              materiales compuestos y fabricación de piscinas premium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300">
                <LazyImage
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-6"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.position}</p>
                <p className="text-gray-600 mb-2">{member.specialization}</p>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{member.experience}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Coverage */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Certifications */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Certificaciones y Acreditaciones
              </h2>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Award className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compromiso con la Calidad</h3>
                <p className="text-gray-600">
                  Mantenemos las más altas certificaciones internacionales y actualizamos 
                  constantemente nuestros procesos para garantizar la máxima calidad en 
                  cada proyecto que realizamos.
                </p>
              </div>
            </div>

            {/* Coverage */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                Cobertura Nacional Premium
              </h2>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-8 h-8 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Servicio en Todo Chile</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Ofrecemos servicios premium en todas las regiones de Chile, con equipos 
                  especializados y logística optimizada para cada zona geográfica.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                  <div>• Región Metropolitana</div>
                  <div>• Valparaíso</div>
                  <div>• O'Higgins</div>
                  <div>• Maule</div>
                  <div>• Ñuble</div>
                  <div>• Biobío</div>
                  <div>• La Araucanía</div>
                  <div>• Los Lagos</div>
                </div>
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Servicio Express en RM: 24-48 horas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            ¿Listo para la Excelencia?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Únete a más de 200 familias que han confiado en Multifibra L.A. para crear 
            piscinas excepcionales. Experiencia, calidad y servicio premium garantizados.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/contacto"
              className="bg-white text-blue-900 hover:bg-gray-100 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Iniciar Mi Proyecto Premium
            </Link>
            <Link
              to="/servicios"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-10 py-5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Ver Catálogo Exclusivo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;