import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2,
  Phone,
  Mail,
  Calendar,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useFunnelAnalytics } from '../Analytics/FunnelAnalytics';
import { useLeadScoring } from '../CRM/LeadScoring';
import { sentryUtils } from '../../monitoring/sentry';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'form' | 'action';
  metadata?: Record<string, any>;
  rating?: 'helpful' | 'not_helpful';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
  metadata?: Record<string, any>;
}

interface ChatbotState {
  context: string;
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    interests?: string[];
  };
  conversationStage: 'greeting' | 'qualifying' | 'product_info' | 'quote' | 'scheduling' | 'closing';
  leadScore: number;
  sessionId: string;
}

const ChatbotAdvanced: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatbotState, setChatbotState] = useState<ChatbotState>({
    context: '',
    userInfo: {},
    conversationStage: 'greeting',
    leadScore: 0,
    sessionId: generateSessionId()
  });
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { trackCTAClick } = useAnalytics();
  const { trackFunnelStep } = useFunnelAnalytics();
  const { trackBehavior } = useLeadScoring();

  // Check if AI chatbot is enabled
  useEffect(() => {
    const enabled = import.meta.env.VITE_ENABLE_AI_CHATBOT === 'true';
    setIsEnabled(enabled);
  }, []);

  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }

  function generateSessionId(): string {
    return `chatbot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Advanced knowledge base for Piscinas Andinas
  const knowledgeBase = {
    products: {
      'elegance_8x4': {
        name: 'Elegance 8x4',
        price: 'Desde $18.500.000',
        dimensions: '8.0 x 4.0 x 1.5m',
        capacity: '48,000L',
        features: ['Escalera integrada', 'Banco perimetral', 'Iluminación LED'],
        installationTime: '7-8 días'
      },
      'prestige_10x5': {
        name: 'Prestige 10x5',
        price: 'Desde $28.900.000',
        dimensions: '10.0 x 5.0 x 1.8m',
        capacity: '90,000L',
        features: ['Zona profunda', 'Escalera ancha', 'Hidromasaje opcional'],
        installationTime: '8-10 días'
      },
      'infinity_12x6': {
        name: 'Infinity 12x6',
        price: 'Desde $45.000.000',
        dimensions: '12.0 x 6.0 x 2.0m',
        capacity: '144,000L',
        features: ['Borde infinito', 'Zona spa', 'Automatización completa'],
        installationTime: '10-12 días'
      }
    },
    
    faqs: {
      installation_time: 'Nuestras piscinas de fibra de vidrio se instalan en 7-12 días, mucho más rápido que las de hormigón que toman 2-3 meses.',
      warranty: 'Ofrecemos garantía de 25 años en la estructura de fibra de vidrio, la más extensa del mercado.',
      maintenance: 'Las piscinas de fibra de vidrio requieren 70% menos mantenimiento que las de hormigón gracias a su superficie no porosa.',
      financing: 'Ofrecemos planes de financiamiento flexibles hasta 60 meses con tasas preferenciales.',
      coverage: 'Atendemos todo Chile con equipos especializados en cada región.',
      materials: 'Utilizamos fibra de vidrio marina de 6-8mm de grosor con gel coat de 0.6mm y resina isoftálica.'
    },

    intents: {
      greeting: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
      pricing: ['precio', 'costo', 'cuanto', 'valor', 'cotización', 'presupuesto'],
      products: ['modelos', 'piscinas', 'tipos', 'catálogo', 'opciones'],
      installation: ['instalación', 'tiempo', 'demora', 'cuanto demora', 'proceso'],
      warranty: ['garantía', 'respaldo', 'cobertura'],
      maintenance: ['mantenimiento', 'cuidado', 'limpieza'],
      financing: ['financiamiento', 'crédito', 'cuotas', 'pago'],
      contact: ['contacto', 'teléfono', 'email', 'visita', 'agendar'],
      location: ['ubicación', 'dirección', 'dónde', 'región', 'cobertura']
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: generateMessageId(),
      text: '¡Hola! 👋 Soy el asistente inteligente de Piscinas Andinas\n\nEstoy aquí para ayudarte a encontrar la piscina perfecta para tu hogar. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages([welcomeMessage]);
    setQuickReplies([
      { id: '1', text: '💰 Ver precios y modelos', action: 'show_products' },
      { id: '2', text: '⏱️ ¿Cuánto demora la instalación?', action: 'installation_time' },
      { id: '3', text: '📞 Solicitar visita técnica', action: 'schedule_visit' },
      { id: '4', text: '🛡️ Información sobre garantía', action: 'warranty_info' }
    ]);
    
    trackCTAClick('ai_chatbot_opened');
    trackFunnelStep('ai_chatbot', 'chat_started');
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const detectIntent = (text: string): string => {
    const lowerText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(knowledgeBase.intents)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  };

  const generateResponse = (userText: string, intent: string): { text: string; quickReplies?: QuickReply[] } => {
    switch (intent) {
      case 'greeting':
        return {
          text: '¡Perfecto! Me alegra poder ayudarte. Somos especialistas en piscinas de fibra de vidrio de alta calidad.\n\n¿Te interesa conocer nuestros modelos o tienes alguna pregunta específica?',
          quickReplies: [
            { id: '1', text: '🏊‍♂️ Ver modelos disponibles', action: 'show_products' },
            { id: '2', text: '💰 Consultar precios', action: 'pricing_info' },
            { id: '3', text: '📅 Agendar visita técnica', action: 'schedule_visit' }
          ]
        };

      case 'pricing':
        return {
          text: '💰 **Nuestros Modelos y Precios:**\n\n🏊‍♂️ **Elegance 8x4** - Desde $18.500.000\n• Ideal para espacios medianos\n• Instalación: 7-8 días\n\n🏊‍♂️ **Prestige 10x5** - Desde $28.900.000\n• Piscina familiar con zona profunda\n• Instalación: 8-10 días\n\n🏊‍♂️ **Infinity 12x6** - Desde $45.000.000\n• Modelo premium con borde infinito\n• Instalación: 10-12 días\n\n¿Te interesa algún modelo en particular?',
          quickReplies: [
            { id: '1', text: 'Elegance 8x4', action: 'product_elegance' },
            { id: '2', text: 'Prestige 10x5', action: 'product_prestige' },
            { id: '3', text: 'Infinity 12x6', action: 'product_infinity' },
            { id: '4', text: '📋 Solicitar cotización', action: 'request_quote' }
          ]
        };

      case 'installation':
        return {
          text: '⏱️ **Tiempo de Instalación:**\n\nNuestras piscinas de fibra de vidrio se instalan en **7-12 días**, dependiendo del modelo:\n\n• Elegance 8x4: 7-8 días\n• Prestige 10x5: 8-10 días\n• Infinity 12x6: 10-12 días\n\n¡Esto es **70% más rápido** que las piscinas de hormigón que toman 2-3 meses!\n\n¿Te gustaría agendar una visita técnica para evaluar tu proyecto?',
          quickReplies: [
            { id: '1', text: '📅 Sí, agendar visita', action: 'schedule_visit' },
            { id: '2', text: '🏗️ Ver proceso de instalación', action: 'installation_process' },
            { id: '3', text: '💰 Consultar precios', action: 'pricing_info' }
          ]
        };

      case 'warranty':
        return {
          text: '🛡️ **Garantía Líder en el Mercado:**\n\n✅ **25 años** en estructura de fibra de vidrio\n✅ **5 años** en equipamiento\n✅ **2 años** en mano de obra\n\nEs la garantía más extensa del mercado chileno. Nuestras piscinas están fabricadas con materiales premium y tecnología de vanguardia.\n\n¿Tienes alguna pregunta específica sobre la garantía?',
          quickReplies: [
            { id: '1', text: '📋 Ver certificaciones', action: 'certifications' },
            { id: '2', text: '🔧 Mantenimiento incluido', action: 'maintenance_info' },
            { id: '3', text: '📞 Hablar con especialista', action: 'contact_specialist' }
          ]
        };

      case 'products':
        return {
          text: '🏊‍♂️ **Nuestros Modelos Premium:**\n\n**1. Elegance 8x4** ($18.5M)\n• Compacta y elegante\n• Perfecta para espacios medianos\n\n**2. Prestige 10x5** ($28.9M)\n• Familiar con zona profunda\n• Hidromasaje opcional\n\n**3. Infinity 12x6** ($45M+)\n• Borde infinito de lujo\n• Zona spa integrada\n\nTodos incluyen:\n✅ Garantía 25 años\n✅ Instalación profesional\n✅ Equipamiento completo\n\n¿Cuál te interesa más?',
          quickReplies: [
            { id: '1', text: 'Elegance 8x4', action: 'product_elegance' },
            { id: '2', text: 'Prestige 10x5', action: 'product_prestige' },
            { id: '3', text: 'Infinity 12x6', action: 'product_infinity' }
          ]
        };

      case 'contact':
        return {
          text: '📞 **Contacto Directo:**\n\n🔥 **WhatsApp VIP:** +56 9 0000 0000\n📧 **Email:** contacto@piscinasandinas.example.com\n📞 **Teléfono:** +56 9 0000 0000\n\n**Horarios de Atención:**\n• Lunes a Viernes: 8:00 - 19:00\n• Sábados: 9:00 - 15:00\n• WhatsApp: 24/7\n\n¿Prefieres que te contactemos o quieres agendar una visita técnica?',
          quickReplies: [
            { id: '1', text: '📱 WhatsApp ahora', action: 'whatsapp_contact' },
            { id: '2', text: '📞 Llamada telefónica', action: 'phone_contact' },
            { id: '3', text: '🏠 Visita técnica', action: 'schedule_visit' },
            { id: '4', text: '📧 Enviar email', action: 'email_contact' }
          ]
        };

      default:
        return {
          text: 'Entiendo tu consulta. Para brindarte la mejor información, ¿podrías ser más específico sobre qué aspecto de nuestras piscinas te interesa?\n\nPuedo ayudarte con:\n• Modelos y precios\n• Proceso de instalación\n• Garantías y mantenimiento\n• Financiamiento\n• Agendar visita técnica',
          quickReplies: [
            { id: '1', text: '💰 Precios', action: 'pricing_info' },
            { id: '2', text: '🏊‍♂️ Modelos', action: 'show_products' },
            { id: '3', text: '📅 Visita técnica', action: 'schedule_visit' },
            { id: '4', text: '📞 Hablar con humano', action: 'human_agent' }
          ]
        };
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text, 'quick_reply');
    handleBotAction(reply.action, reply.metadata);
  };

  const handleBotAction = (action: string, metadata?: Record<string, any>) => {
    switch (action) {
      case 'show_products':
        setTimeout(() => {
          const response = generateResponse('', 'products');
          addBotMessage(response.text, response.quickReplies);
        }, 1000);
        break;

      case 'pricing_info':
        setTimeout(() => {
          const response = generateResponse('', 'pricing');
          addBotMessage(response.text, response.quickReplies);
        }, 1000);
        break;

      case 'installation_time':
        setTimeout(() => {
          const response = generateResponse('', 'installation');
          addBotMessage(response.text, response.quickReplies);
        }, 1000);
        break;

      case 'warranty_info':
        setTimeout(() => {
          const response = generateResponse('', 'warranty');
          addBotMessage(response.text, response.quickReplies);
        }, 1000);
        break;

      case 'schedule_visit':
        setTimeout(() => {
          addBotMessage(
            '📅 **Excelente decisión!**\n\nNuestros especialistas realizan visitas técnicas gratuitas para:\n• Evaluar el terreno\n• Tomar medidas exactas\n• Crear propuesta personalizada\n• Resolver todas tus dudas\n\nPara agendar, necesito algunos datos:',
            [
              { id: '1', text: '📱 Continuar por WhatsApp', action: 'whatsapp_contact' },
              { id: '2', text: '📞 Llamar ahora', action: 'phone_contact' },
              { id: '3', text: '📧 Enviar mis datos', action: 'collect_contact_info' }
            ]
          );
        }, 1000);
        break;

      case 'whatsapp_contact':
        window.open('https://wa.me/56900000000?text=Hola, me interesa agendar una visita técnica para evaluar mi proyecto de piscina', '_blank');
        trackCTAClick('chatbot_whatsapp_click');
        trackBehavior(chatbotState.sessionId, 'whatsapp_click', { source: 'chatbot' });
        break;

      case 'phone_contact':
        window.location.href = 'tel:+56900000000';
        trackCTAClick('chatbot_phone_click');
        trackBehavior(chatbotState.sessionId, 'phone_click', { source: 'chatbot' });
        break;

      case 'email_contact':
        window.location.href = 'mailto:contacto@piscinasandinas.example.com?subject=Consulta sobre piscinas de fibra de vidrio';
        trackCTAClick('chatbot_email_click');
        break;

      case 'request_quote':
        setTimeout(() => {
          addBotMessage(
            '📋 **Solicitud de Cotización**\n\nPerfecto! Para preparar una cotización personalizada, nuestro equipo necesita evaluar tu proyecto.\n\n¿Prefieres que te contactemos o agendar una visita técnica gratuita?',
            [
              { id: '1', text: '🏠 Visita técnica gratuita', action: 'schedule_visit' },
              { id: '2', text: '📱 WhatsApp inmediato', action: 'whatsapp_contact' },
              { id: '3', text: '📞 Llamada telefónica', action: 'phone_contact' }
            ]
          );
        }, 1000);
        trackFunnelStep('ai_chatbot', 'quote_requested');
        trackBehavior(chatbotState.sessionId, 'quote_request', { source: 'chatbot' });
        break;

      case 'human_agent':
        setTimeout(() => {
          addBotMessage(
            '👨‍💼 **Conectando con Especialista**\n\nTe estoy conectando con uno de nuestros especialistas en piscinas. Mientras tanto, ¿podrías contarme qué tipo de piscina te interesa?\n\nNuestro equipo está disponible:\n• Lunes a Viernes: 8:00 - 19:00\n• WhatsApp 24/7 para urgencias',
            [
              { id: '1', text: '📱 WhatsApp VIP', action: 'whatsapp_contact' },
              { id: '2', text: '📞 Llamar ahora', action: 'phone_contact' }
            ]
          );
        }, 1500);
        break;
    }
  };

  const sendMessage = async (text: string, type: 'text' | 'quick_reply' = 'text') => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      type
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setQuickReplies([]);

    // Track user interaction
    trackBehavior(chatbotState.sessionId, 'chatbot_message', { message: text, type });

    // Simulate AI processing time
    setTimeout(() => {
      const intent = detectIntent(text);
      const response = generateResponse(text, intent);
      addBotMessage(response.text, response.quickReplies);
      setIsTyping(false);
    }, 1500);
  };

  const addBotMessage = (text: string, quickReplies?: QuickReply[]) => {
    const botMessage: Message = {
      id: generateMessageId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, botMessage]);
    if (quickReplies) {
      setQuickReplies(quickReplies);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const rateMessage = (messageId: string, rating: 'helpful' | 'not_helpful') => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, rating } : msg
      )
    );

    // Track rating
    sentryUtils.trackUserInteraction('chatbot_rating', rating, messageId);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const minimizeChat = () => {
    setIsMinimized(!isMinimized);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
          isMinimized ? 'h-16' : 'h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-semibold">Asistente IA</h3>
                <p className="text-xs text-blue-100">Especialista en Piscinas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={minimizeChat}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
                aria-label={isMinimized ? 'Maximizar chat' : 'Minimizar chat'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-blue-600 rounded transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className="w-4 h-4 mt-1 flex-shrink-0 text-blue-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sender === 'bot' && !message.rating && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => rateMessage(message.id, 'helpful')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  aria-label="Útil"
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => rateMessage(message.id, 'not_helpful')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  aria-label="No útil"
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu pregunta..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                    aria-label="Enviar mensaje"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Abrir asistente IA"
      >
        <Bot className="w-6 h-6" />
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
          IA
        </div>
      </button>
    </>
  );
};

export default ChatbotAdvanced;