import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  Phone,
  Mail
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { sentryUtils } from '../../monitoring/sentry';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'quick_reply' | 'form';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'offline' | 'busy'>('online');
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [chatSession, setChatSession] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { trackCTAClick } = useAnalytics();

  // Check if live chat is enabled
  useEffect(() => {
    const enabled = import.meta.env.VITE_ENABLE_LIVE_CHAT === 'true';
    setIsEnabled(enabled);
    
    if (!enabled) {
      console.log('Live chat disabled');
    }
  }, []);

  // Don't render if disabled
  if (!isEnabled) {
    return null;
  }
  // Quick replies for common questions
  const quickReplies: QuickReply[] = [
    { id: '1', text: '¿Cuánto cuesta una piscina?', action: 'pricing' },
    { id: '2', text: '¿Cuánto demora la instalación?', action: 'installation_time' },
    { id: '3', text: 'Quiero agendar una visita', action: 'schedule_visit' },
    { id: '4', text: '¿Qué garantía tienen?', action: 'warranty' },
    { id: '5', text: 'Hablar con un especialista', action: 'human_agent' },
  ];

  // Auto-responses for common questions
  const autoResponses: Record<string, string> = {
    pricing: 'Nuestras piscinas van desde $18.500.000 (Elegance 8x4) hasta $45.000.000+ (Infinity 12x6). El precio final depende del modelo, equipamiento y características del terreno. ¿Te gustaría que un especialista te haga una cotización personalizada?',
    installation_time: 'La instalación de nuestras piscinas de fibra de vidrio toma entre 7-12 días, mucho más rápido que las de hormigón (2-3 meses). ¿En qué región te encuentras?',
    warranty: 'Ofrecemos garantía de 25 años en la estructura de fibra de vidrio y 5 años en equipamiento. Es la garantía más extensa del mercado. ¿Tienes alguna pregunta específica sobre la garantía?',
    schedule_visit: 'Perfecto! Nuestros especialistas realizan visitas técnicas gratuitas. ¿Podrías proporcionarme tu nombre, teléfono y comuna para coordinar la visita?',
    human_agent: 'Te estoy conectando con uno de nuestros especialistas. Mientras tanto, ¿podrías contarme qué tipo de piscina te interesa?'
  };

  // Initialize chat
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const initializeChat = () => {
    const sessionId = generateSessionId();
    setChatSession(sessionId);
    
    const welcomeMessage: Message = {
      id: generateMessageId(),
      text: '¡Hola! Soy el asistente virtual de Piscinas Andinas 👋\n\n¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestras piscinas, precios, instalación y más.',
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered'
    };
    
    setMessages([welcomeMessage]);
    
    // Track chat initiation
    trackCTAClick('live_chat_opened');
    sentryUtils.trackUserInteraction('open', 'live_chat');
  };

  const generateSessionId = () => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (text: string, type: 'text' | 'quick_reply' = 'text') => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Update message status to sent
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 500);

    // Simulate bot response
    setTimeout(() => {
      handleBotResponse(text, type);
      setIsTyping(false);
    }, 1500);

    // Track message sent
    sentryUtils.trackUserInteraction('send_message', 'live_chat', text);
  };

  const handleBotResponse = (userText: string, type: 'text' | 'quick_reply') => {
    let responseText = '';
    
    if (type === 'quick_reply') {
      const action = quickReplies.find(qr => qr.text === userText)?.action;
      responseText = autoResponses[action || ''] || 'Gracias por tu consulta. Un especialista te contactará pronto.';
    } else {
      // Simple keyword matching for auto-responses
      const lowerText = userText.toLowerCase();
      
      if (lowerText.includes('precio') || lowerText.includes('costo') || lowerText.includes('cuanto')) {
        responseText = autoResponses.pricing;
      } else if (lowerText.includes('tiempo') || lowerText.includes('demora') || lowerText.includes('instalacion')) {
        responseText = autoResponses.installation_time;
      } else if (lowerText.includes('garantia')) {
        responseText = autoResponses.warranty;
      } else if (lowerText.includes('visita') || lowerText.includes('agendar')) {
        responseText = autoResponses.schedule_visit;
      } else if (lowerText.includes('hola') || lowerText.includes('buenos') || lowerText.includes('buenas')) {
        responseText = '¡Hola! ¿En qué puedo ayudarte con tu proyecto de piscina?';
      } else {
        responseText = 'Gracias por tu consulta. Te estoy conectando con un especialista que podrá ayudarte mejor. Mientras tanto, ¿podrías contarme más detalles sobre tu proyecto?';
      }
    }

    const botMessage: Message = {
      id: generateMessageId(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered'
    };

    setMessages(prev => [...prev, botMessage]);

    // If user wants to talk to human agent, simulate agent joining
    if (userText.includes('especialista') || userText.includes('humano') || userText.includes('persona')) {
      setTimeout(() => {
        const agentMessage: Message = {
          id: generateMessageId(),
          text: '¡Hola! Soy tu asesor, especialista en piscinas de Piscinas Andinas He revisado tu consulta y estaré encantado de ayudarte. ¿Podrías contarme más sobre tu proyecto?',
          sender: 'agent',
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, agentMessage]);
      }, 2000);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text, 'quick_reply');
    trackCTAClick(`quick_reply_${reply.action}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  const handleContactAction = (action: 'phone' | 'email') => {
    if (action === 'phone') {
      window.location.href = 'tel:+56900000000';
      trackCTAClick('chat_phone_click');
    } else {
      window.location.href = 'mailto:contacto@piscinasandinas.example.com';
      trackCTAClick('chat_email_click');
    }
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
                  <User className="w-6 h-6" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  agentStatus === 'online' ? 'bg-green-500' : 
                  agentStatus === 'busy' ? 'bg-yellow-500' : 'bg-gray-500'
                }`}></div>
              </div>
              <div>
                <h3 className="font-semibold">Piscinas Andinas</h3>
                <p className="text-xs text-blue-100">
                  {agentStatus === 'online' ? 'En línea' : 
                   agentStatus === 'busy' ? 'Ocupado' : 'Desconectado'}
                </p>
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
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.sender === 'agent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'user' && (
                          <div className="ml-2">
                            {getStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
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
              {messages.length <= 2 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-500 mb-2">Preguntas frecuentes:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.slice(0, 3).map((reply) => (
                      <button
                        key={reply.id}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        {reply.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="px-4 pb-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContactAction('phone')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                  <button
                    onClick={() => handleContactAction('email')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim()}
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
        className={`fixed bottom-6 right-20 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-40 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
        aria-label="Abrir chat en vivo"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>
    </>
  );
};

export default LiveChatWidget;