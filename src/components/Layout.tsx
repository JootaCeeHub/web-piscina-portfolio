import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MessageCircle, ChevronUp } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const location = useLocation();
  const { trackWhatsAppClick, trackPhoneClick, trackEmailClick } = useAnalytics();

  const navigation = [
    { name: 'Inicio', href: '/' },
    { name: 'Servicios', href: '/servicios' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
      setShowScrollTop(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = () => {
    trackWhatsAppClick();
    window.open('https://wa.me/56987654321?text=Hola, me interesa conocer más sobre sus piscinas de fibra de vidrio de alto estándar', '_blank');
  };

  const handlePhoneClick = () => {
    trackPhoneClick();
  };

  const handleEmailClick = () => {
    trackEmailClick();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header con efectos mejorados */}
      <header id="navigation" className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo mejorado */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">MF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Multifibra L.A.
                </h1>
                <p className="text-sm text-gray-600">Soluciones en Fibra de Vidrio</p>
              </div>
            </Link>

            {/* Desktop Navigation mejorada */}
            <nav className="hidden md:flex space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                    location.pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="relative z-10">{item.name}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              ))}
            </nav>

            {/* Contact Info & Mobile Menu Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-6 text-sm text-gray-600">
                <a 
                  href="tel:+56987654321"
                  onClick={handlePhoneClick}
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
                  aria-label="Llamar al teléfono +56 9 8765 4321"
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>+56 9 8765 4321</span>
                </a>
                <a 
                  href="mailto:info@multifibrala.cl"
                  onClick={handleEmailClick}
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
                  aria-label="Enviar email a info@multifibrala.cl"
                >
                  <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>info@multifibrala.cl</span>
                </a>
              </div>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={isMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-180' : 'opacity-100 rotate-0'}`} />
                  <X className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-180'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation mejorada */}
          <div className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                      location.pathname === item.href
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex flex-col space-y-3 text-sm text-gray-600">
                    <a 
                      href="tel:+56987654321"
                      onClick={handlePhoneClick}
                      className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                      aria-label="Llamar al teléfono +56 9 8765 4321"
                    >
                      <Phone className="w-4 h-4" />
                      <span>+56 9 8765 4321</span>
                    </a>
                    <a 
                      href="mailto:info@multifibrala.cl"
                      onClick={handleEmailClick}
                      className="flex items-center space-x-3 hover:text-blue-600 transition-colors"
                      aria-label="Enviar email a info@multifibrala.cl"
                    >
                      <Mail className="w-4 h-4" />
                      <span>info@multifibrala.cl</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="flex-1 pt-20" role="main">
        {children}
      </main>

      {/* WhatsApp Float Button mejorado */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 group animate-bounce-in"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
        <span className="sr-only">Contactar por WhatsApp</span>
      </button>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <ChevronUp className="w-5 h-5" />
        <span className="sr-only">Volver al inicio de la página</span>
      </button>

      {/* Footer mejorado */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">MF</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Multifibra L.A.</h3>
                  <p className="text-gray-400">Soluciones en Fibra de Vidrio</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Especialistas en fabricación e instalación de piscinas de fibra de vidrio de alto estándar. 
                Más de 8 años de experiencia ofreciendo soluciones duraderas y elegantes para hogares 
                exigentes en todo Chile.
              </p>
              <div className="flex space-x-6">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300"
                >
                  Facebook
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300"
                >
                  Instagram
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-300"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Enlaces Rápidos</h4>
              <ul className="space-y-3">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-gray-300 hover:text-white transition-colors hover:translate-x-1 transform duration-300 inline-block"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-xl font-semibold mb-6">Contacto</h4>
              <div className="space-y-4 text-gray-300">
                <a 
                  href="tel:+56987654321"
                  onClick={handlePhoneClick}
                  className="flex items-center space-x-3 hover:text-white transition-colors group"
                  aria-label="Llamar al teléfono +56 9 8765 4321"
                >
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>+56 9 8765 4321</span>
                </a>
                <a 
                  href="mailto:info@multifibrala.cl"
                  onClick={handleEmailClick}
                  className="flex items-center space-x-3 hover:text-white transition-colors group"
                  aria-label="Enviar email a info@multifibrala.cl"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>info@multifibrala.cl</span>
                </a>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center space-x-3 hover:text-white transition-colors group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp disponible</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-center md:text-left">
                &copy; 2024 Multifibra L.A. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
                <a href="#" className="hover:text-white transition-colors">Garantías</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;