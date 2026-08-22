import { apiConfig } from '../config/apiConfig';
import { sentryUtils } from '../monitoring/sentry';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'form' | 'action';
  metadata?: Record<string, any>;
  confidence?: number;
  intent?: string;
  entities?: Array<{
    entity: string;
    value: string;
    confidence: number;
  }>;
}

export interface ChatContext {
  sessionId: string;
  userId?: string;
  conversationStage: 'greeting' | 'qualifying' | 'product_info' | 'quote' | 'scheduling' | 'closing';
  userInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    interests?: string[];
    budget?: string;
    timeline?: string;
  };
  leadScore: number;
  messageHistory: ChatMessage[];
  lastActivity: Date;
}

export interface AIResponse {
  text: string;
  confidence: number;
  intent: string;
  entities: Array<{
    entity: string;
    value: string;
    confidence: number;
  }>;
  quickReplies?: Array<{
    id: string;
    text: string;
    action: string;
  }>;
  actions?: Array<{
    type: 'transfer_to_human' | 'schedule_visit' | 'send_catalog' | 'collect_info';
    parameters?: Record<string, any>;
  }>;
  nextStage?: ChatContext['conversationStage'];
}

class AIChatbotService {
  private knowledgeBase: Map<string, any> = new Map();
  private intentClassifier: Map<string, string[]> = new Map();
  private entityExtractor: Map<string, RegExp> = new Map();
  private conversationFlows: Map<string, any> = new Map();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadKnowledgeBase();
      await this.setupIntentClassifier();
      await this.setupEntityExtractor();
      await this.setupConversationFlows();
      
      this.isInitialized = true;
      console.log('AI Chatbot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Chatbot:', error);
      sentryUtils.captureException(error as Error, {
        tags: { service: 'ai_chatbot_init' }
      });
    }
  }

  private async loadKnowledgeBase(): Promise<void> {
    // Comprehensive knowledge base for Piscinas Andinas
    const knowledgeBase = {
      // Product Information
      products: {
        'elegance_8x4': {
          name: 'Elegance 8x4',
          price: 'Desde $18.500.000',
          dimensions: '8.0 x 4.0 x 1.5m',
          capacity: '48,000L',
          features: ['Escalera integrada', 'Banco perimetral', 'Iluminación LED RGB', 'Sistema de filtración', 'Bomba 1.5 HP'],
          installationTime: '7-8 días',
          warranty: '25 años estructura',
          idealFor: 'Espacios medianos, familias pequeñas',
          maintenance: 'Bajo mantenimiento, superficie no porosa'
        },
        'prestige_10x5': {
          name: 'Prestige 10x5',
          price: 'Desde $28.900.000',
          dimensions: '10.0 x 5.0 x 1.8m',
          capacity: '90,000L',
          features: ['Zona profunda 1.8m', 'Escalera ancha', 'Hidromasaje opcional', 'Bomba 2.5 HP', 'Control automático'],
          installationTime: '8-10 días',
          warranty: '25 años estructura',
          idealFor: 'Familias grandes, natación recreativa',
          maintenance: 'Sistema automatizado de limpieza'
        },
        'infinity_12x6': {
          name: 'Infinity 12x6',
          price: 'Desde $45.000.000',
          dimensions: '12.0 x 6.0 x 2.0m',
          capacity: '144,000L',
          features: ['Borde infinito', 'Zona spa integrada', 'Automatización WiFi', 'Climatización', 'Bomba 3 HP'],
          installationTime: '10-12 días',
          warranty: '25 años estructura',
          idealFor: 'Propiedades de lujo, entretenimiento',
          maintenance: 'Sistema inteligente completo'
        }
      },

      // Technical Information
      technical: {
        materials: {
          fiberglassThickness: '6-8mm laminado multicapa',
          gelCoat: '0.6mm con protección UV',
          resin: 'Resina isoftálica marina',
          reinforcement: 'Fibra de vidrio E-glass',
          finish: 'Gel coat premium antideslizante'
        },
        installation: {
          preparation: 'Excavación, nivelación, base de arena',
          timeframe: '7-12 días según modelo',
          equipment: 'Grúa especializada, herramientas precisión',
          team: 'Técnicos certificados',
          warranty: '25 años estructura, 5 años equipos'
        },
        maintenance: {
          frequency: 'Mantenimiento mínimo',
          cleaning: 'Superficie no porosa, fácil limpieza',
          chemicals: '70% menos químicos que hormigón',
          durability: 'Resistente a cloro, sal, UV',
          repairs: 'Reparaciones invisibles posibles'
        }
      },

      // Business Information
      business: {
        company: {
          name: 'Piscinas Andinas',
          experience: 'Más de 8 años especializados',
          projects: 'Más de 200 piscinas instaladas',
          coverage: 'Todo Chile',
          satisfaction: '99% satisfacción del cliente'
        },
        services: {
          consultation: 'Consulta técnica gratuita',
          design: 'Diseño personalizado',
          installation: 'Instalación profesional',
          maintenance: 'Servicio post-venta',
          warranty: 'Garantía extendida'
        },
        financing: {
          available: true,
          terms: 'Hasta 60 meses',
          rates: 'Tasas preferenciales',
          approval: 'Aprobación rápida'
        }
      },

      // FAQ Responses
      faqs: {
        'installation_time': 'Nuestras piscinas de fibra de vidrio se instalan en 7-12 días, dependiendo del modelo. Esto es 70% más rápido que las piscinas de hormigón que toman 2-3 meses.',
        'warranty': 'Ofrecemos la garantía más extensa del mercado: 25 años en la estructura de fibra de vidrio, 5 años en equipamiento y 2 años en mano de obra.',
        'maintenance': 'Las piscinas de fibra de vidrio requieren 70% menos mantenimiento que las de hormigón gracias a su superficie no porosa que evita la proliferación de algas y bacterias.',
        'financing': 'Sí, ofrecemos planes de financiamiento flexibles hasta 60 meses con tasas preferenciales. La aprobación es rápida y sin complicaciones.',
        'coverage': 'Atendemos todo Chile con equipos especializados en cada región. Tenemos cobertura desde Arica hasta Punta Arenas.',
        'materials': 'Utilizamos fibra de vidrio marina de 6-8mm de grosor con gel coat de 0.6mm y resina isoftálica, los mejores materiales del mercado.',
        'cost': 'Nuestras piscinas van desde $18.500.000 (Elegance 8x4) hasta $45.000.000+ (Infinity 12x6). El precio final depende del modelo, equipamiento y características del terreno.',
        'comparison': 'La fibra de vidrio es superior al hormigón en durabilidad, mantenimiento, tiempo de instalación y resistencia. Es la elección inteligente para piscinas de alto estándar.'
      }
    };

    // Store in knowledge base
    Object.entries(knowledgeBase).forEach(([key, value]) => {
      this.knowledgeBase.set(key, value);
    });
  }

  private async setupIntentClassifier(): Promise<void> {
    // Intent classification based on keywords and patterns
    const intents = new Map([
      ['greeting', ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'hi', 'hello']],
      ['pricing', ['precio', 'costo', 'cuanto', 'valor', 'cotización', 'presupuesto', 'dinero', 'plata']],
      ['products', ['modelos', 'piscinas', 'tipos', 'catálogo', 'opciones', 'elegance', 'prestige', 'infinity']],
      ['installation', ['instalación', 'tiempo', 'demora', 'cuanto demora', 'proceso', 'instalar']],
      ['warranty', ['garantía', 'respaldo', 'cobertura', 'seguro']],
      ['maintenance', ['mantenimiento', 'cuidado', 'limpieza', 'mantener']],
      ['financing', ['financiamiento', 'crédito', 'cuotas', 'pago', 'financiar']],
      ['contact', ['contacto', 'teléfono', 'email', 'visita', 'agendar', 'llamar']],
      ['location', ['ubicación', 'dirección', 'dónde', 'región', 'cobertura', 'zona']],
      ['comparison', ['comparar', 'diferencia', 'mejor', 'hormigón', 'concreto', 'liner']],
      ['technical', ['técnico', 'especificaciones', 'materiales', 'fibra', 'grosor']],
      ['schedule_visit', ['visita', 'técnica', 'evaluar', 'ver', 'ir', 'casa']],
      ['human_agent', ['humano', 'persona', 'especialista', 'vendedor', 'asesor']],
      ['complaint', ['problema', 'queja', 'reclamo', 'mal', 'error']],
      ['compliment', ['excelente', 'bueno', 'gracias', 'perfecto', 'genial']]
    ]);

    this.intentClassifier = intents;
  }

  private async setupEntityExtractor(): Promise<void> {
    // Entity extraction patterns
    const entities = new Map([
      ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g],
      ['phone', /(\+56|56)?\s?[9]\s?\d{4}\s?\d{4}/g],
      ['money', /\$[\d,]+/g],
      ['location', /(las condes|vitacura|lo barnechea|la dehesa|providencia|ñuñoa|santiago|valparaíso|viña del mar|concepción|temuco|puerto montt)/gi],
      ['pool_model', /(elegance|prestige|infinity)/gi],
      ['timeline', /(lo antes posible|próximos? \d+ meses?|próximo año|urgente|rápido)/gi],
      ['budget_range', /(\$?\d+\.?\d*\.?\d*)/g]
    ]);

    this.entityExtractor = entities;
  }

  private async setupConversationFlows(): Promise<void> {
    // Conversation flow definitions
    const flows = new Map([
      ['greeting', {
        responses: [
          '¡Hola! 👋 Soy el asistente inteligente de Piscinas Andinas Estoy aquí para ayudarte a encontrar la piscina perfecta para tu hogar.',
          '¡Bienvenido! Soy especialista en piscinas de fibra de vidrio de alto estándar. ¿En qué puedo ayudarte hoy?'
        ],
        nextStage: 'qualifying',
        quickReplies: [
          { id: '1', text: '💰 Ver precios y modelos', action: 'show_products' },
          { id: '2', text: '⏱️ ¿Cuánto demora la instalación?', action: 'installation_time' },
          { id: '3', text: '📞 Solicitar visita técnica', action: 'schedule_visit' },
          { id: '4', text: '🛡️ Información sobre garantía', action: 'warranty_info' }
        ]
      }],
      ['pricing', {
        responses: [
          '💰 **Nuestros Modelos y Precios:**\n\n🏊‍♂️ **Elegance 8x4** - Desde $18.500.000\n• Ideal para espacios medianos\n• Instalación: 7-8 días\n\n🏊‍♂️ **Prestige 10x5** - Desde $28.900.000\n• Piscina familiar con zona profunda\n• Instalación: 8-10 días\n\n🏊‍♂️ **Infinity 12x6** - Desde $45.000.000\n• Modelo premium con borde infinito\n• Instalación: 10-12 días\n\n¿Te interesa algún modelo en particular?'
        ],
        nextStage: 'product_info',
        quickReplies: [
          { id: '1', text: 'Elegance 8x4', action: 'product_elegance' },
          { id: '2', text: 'Prestige 10x5', action: 'product_prestige' },
          { id: '3', text: 'Infinity 12x6', action: 'product_infinity' },
          { id: '4', text: '📋 Solicitar cotización', action: 'request_quote' }
        ]
      }],
      ['installation', {
        responses: [
          '⏱️ **Tiempo de Instalación:**\n\nNuestras piscinas de fibra de vidrio se instalan en **7-12 días**, dependiendo del modelo:\n\n• Elegance 8x4: 7-8 días\n• Prestige 10x5: 8-10 días\n• Infinity 12x6: 10-12 días\n\n¡Esto es **70% más rápido** que las piscinas de hormigón que toman 2-3 meses!\n\n¿Te gustaría agendar una visita técnica para evaluar tu proyecto?'
        ],
        nextStage: 'scheduling',
        quickReplies: [
          { id: '1', text: '📅 Sí, agendar visita', action: 'schedule_visit' },
          { id: '2', text: '🏗️ Ver proceso de instalación', action: 'installation_process' },
          { id: '3', text: '💰 Consultar precios', action: 'pricing_info' }
        ]
      }]
    ]);

    this.conversationFlows = flows;
  }

  async processMessage(message: string, context: ChatContext): Promise<AIResponse> {
    try {
      // Classify intent
      const intent = this.classifyIntent(message);
      
      // Extract entities
      const entities = this.extractEntities(message);
      
      // Update context with extracted information
      this.updateContext(context, entities);
      
      // Generate response based on intent and context
      const response = await this.generateResponse(intent, message, context, entities);
      
      // Update conversation stage
      if (response.nextStage) {
        context.conversationStage = response.nextStage;
      }
      
      // Calculate lead score update
      this.updateLeadScore(context, intent, entities);
      
      return response;

    } catch (error) {
      sentryUtils.captureException(error as Error, {
        tags: { service: 'ai_chatbot_processing' },
        extra: { message, context }
      });
      
      return this.getFallbackResponse();
    }
  }

  private classifyIntent(message: string): string {
    const messageLower = message.toLowerCase();
    let bestIntent = 'general';
    let maxMatches = 0;

    for (const [intent, keywords] of this.intentClassifier.entries()) {
      const matches = keywords.filter(keyword => 
        messageLower.includes(keyword)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = intent;
      }
    }

    return bestIntent;
  }

  private extractEntities(message: string): Array<{
    entity: string;
    value: string;
    confidence: number;
  }> {
    const entities: Array<{
      entity: string;
      value: string;
      confidence: number;
    }> = [];

    for (const [entityType, pattern] of this.entityExtractor.entries()) {
      const matches = message.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            entity: entityType,
            value: match.trim(),
            confidence: 0.8 // Simple confidence score
          });
        });
      }
    }

    return entities;
  }

  private updateContext(context: ChatContext, entities: any[]): void {
    entities.forEach(entity => {
      switch (entity.entity) {
        case 'email':
          context.userInfo.email = entity.value;
          break;
        case 'phone':
          context.userInfo.phone = entity.value;
          break;
        case 'location':
          context.userInfo.location = entity.value;
          break;
        case 'pool_model':
          if (!context.userInfo.interests) context.userInfo.interests = [];
          context.userInfo.interests.push(entity.value);
          break;
        case 'timeline':
          context.userInfo.timeline = entity.value;
          break;
        case 'budget_range':
          context.userInfo.budget = entity.value;
          break;
      }
    });

    context.lastActivity = new Date();
  }

  private async generateResponse(
    intent: string, 
    message: string, 
    context: ChatContext, 
    entities: any[]
  ): Promise<AIResponse> {
    
    // Check if we have a predefined flow for this intent
    const flow = this.conversationFlows.get(intent);
    if (flow) {
      const response = Array.isArray(flow.responses) 
        ? flow.responses[Math.floor(Math.random() * flow.responses.length)]
        : flow.responses;
      
      return {
        text: response,
        confidence: 0.9,
        intent,
        entities,
        quickReplies: flow.quickReplies,
        nextStage: flow.nextStage
      };
    }

    // Generate contextual response
    return this.generateContextualResponse(intent, message, context, entities);
  }

  private async generateContextualResponse(
    intent: string,
    message: string,
    context: ChatContext,
    entities: any[]
  ): Promise<AIResponse> {
    
    // Use external AI API if available
    if (apiConfig.aiChatbot.openaiApiKey && apiConfig.aiChatbot.openaiApiKey !== 'your_openai_key') {
      return await this.generateAIResponse(intent, message, context, entities);
    }
    
    // Fallback to rule-based responses
    return this.generateRuleBasedResponse(intent, message, context, entities);
  }

  private async generateAIResponse(
    intent: string,
    message: string,
    context: ChatContext,
    entities: any[]
  ): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(message, context, entities);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.aiChatbot.openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt()
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      return {
        text: aiResponse,
        confidence: 0.85,
        intent,
        entities,
        quickReplies: this.generateQuickReplies(intent, context)
      };

    } catch (error) {
      console.warn('AI API failed, falling back to rule-based response:', error);
      return this.generateRuleBasedResponse(intent, message, context, entities);
    }
  }

  private buildPrompt(message: string, context: ChatContext, entities: any[]): string {
    return `
Usuario: ${message}

Contexto de la conversación:
- Etapa: ${context.conversationStage}
- Información del usuario: ${JSON.stringify(context.userInfo)}
- Puntuación de lead: ${context.leadScore}
- Entidades detectadas: ${JSON.stringify(entities)}

Responde como especialista en piscinas de Piscinas Andinas de manera natural y útil.
    `.trim();
  }

  private getSystemPrompt(): string {
    return `
Eres un asistente especializado en piscinas de fibra de vidrio para Piscinas Andinas, empresa líder en Chile.

INFORMACIÓN CLAVE:
- Especialistas en piscinas de fibra de vidrio de alto estándar
- Más de 8 años de experiencia, 200+ piscinas instaladas
- Garantía de 25 años en estructura
- Instalación en 7-12 días (70% más rápido que hormigón)
- Modelos: Elegance 8x4 ($18.5M), Prestige 10x5 ($28.9M), Infinity 12x6 ($45M+)
- Cobertura en todo Chile
- Financiamiento hasta 60 meses

PERSONALIDAD:
- Profesional pero amigable
- Experto técnico confiable
- Enfocado en soluciones
- Proactivo en ofrecer ayuda

OBJETIVOS:
- Calificar leads de calidad
- Agendar visitas técnicas
- Educar sobre beneficios de fibra de vidrio
- Generar confianza en la marca

Responde de manera concisa, útil y siempre orientada a ayudar al cliente a tomar la mejor decisión.
    `.trim();
  }

  private generateRuleBasedResponse(
    intent: string,
    message: string,
    context: ChatContext,
    entities: any[]
  ): AIResponse {
    
    const responses: Record<string, string> = {
      general: 'Gracias por tu consulta. Para brindarte la mejor información, ¿podrías ser más específico sobre qué aspecto de nuestras piscinas te interesa?',
      products: 'Tenemos 3 modelos principales: Elegance 8x4 (desde $18.5M), Prestige 10x5 (desde $28.9M) e Infinity 12x6 (desde $45M). ¿Cuál te interesa más?',
      warranty: 'Ofrecemos la garantía más extensa del mercado: 25 años en estructura de fibra de vidrio, 5 años en equipamiento y 2 años en mano de obra.',
      maintenance: 'Las piscinas de fibra de vidrio requieren 70% menos mantenimiento que las de hormigón gracias a su superficie no porosa.',
      financing: 'Sí, ofrecemos financiamiento hasta 60 meses con tasas preferenciales. ¿Te gustaría que un especialista te contacte para revisar las opciones?',
      contact: 'Puedes contactarnos al +56 9 0000 0000, por email a contacto@piscinasandinas.example.com o solicitar una visita técnica gratuita.',
      location: 'Atendemos todo Chile con equipos especializados. ¿En qué región te encuentras?',
      comparison: 'La fibra de vidrio es superior al hormigón en durabilidad, mantenimiento, tiempo de instalación y resistencia. Es la elección inteligente.',
      technical: 'Utilizamos fibra de vidrio marina de 6-8mm con gel coat de 0.6mm y resina isoftálica, los mejores materiales del mercado.',
      schedule_visit: 'Perfecto! Nuestros especialistas realizan visitas técnicas gratuitas. ¿Podrías proporcionarme tu ubicación para coordinar?',
      human_agent: 'Te estoy conectando con uno de nuestros especialistas. Mientras tanto, ¿podrías contarme qué tipo de piscina te interesa?',
      complaint: 'Lamento escuchar sobre tu inconveniente. Te conectaré inmediatamente con nuestro equipo de atención al cliente para resolver esto.',
      compliment: '¡Muchas gracias! Nos esforzamos por brindar el mejor servicio. ¿Hay algo más en lo que pueda ayudarte?'
    };

    const responseText = responses[intent] || responses.general;
    
    return {
      text: responseText,
      confidence: 0.7,
      intent,
      entities,
      quickReplies: this.generateQuickReplies(intent, context)
    };
  }

  private generateQuickReplies(intent: string, context: ChatContext): Array<{
    id: string;
    text: string;
    action: string;
  }> {
    
    const quickReplies: Record<string, Array<{
      id: string;
      text: string;
      action: string;
    }>> = {
      general: [
        { id: '1', text: '💰 Precios', action: 'pricing_info' },
        { id: '2', text: '🏊‍♂️ Modelos', action: 'show_products' },
        { id: '3', text: '📅 Visita técnica', action: 'schedule_visit' },
        { id: '4', text: '📞 Hablar con humano', action: 'human_agent' }
      ],
      products: [
        { id: '1', text: 'Elegance 8x4', action: 'product_elegance' },
        { id: '2', text: 'Prestige 10x5', action: 'product_prestige' },
        { id: '3', text: 'Infinity 12x6', action: 'product_infinity' }
      ],
      pricing: [
        { id: '1', text: '📋 Solicitar cotización', action: 'request_quote' },
        { id: '2', text: '📅 Agendar visita', action: 'schedule_visit' },
        { id: '3', text: '💳 Ver financiamiento', action: 'financing_info' }
      ]
    };

    return quickReplies[intent] || quickReplies.general;
  }

  private updateLeadScore(context: ChatContext, intent: string, entities: any[]): void {
    let scoreIncrease = 0;

    // Intent-based scoring
    const intentScores: Record<string, number> = {
      pricing: 10,
      products: 8,
      schedule_visit: 20,
      financing: 15,
      technical: 5,
      warranty: 3,
      contact: 12
    };

    scoreIncrease += intentScores[intent] || 1;

    // Entity-based scoring
    entities.forEach(entity => {
      switch (entity.entity) {
        case 'email':
        case 'phone':
          scoreIncrease += 15;
          break;
        case 'location':
          scoreIncrease += 10;
          break;
        case 'budget_range':
          scoreIncrease += 12;
          break;
        case 'timeline':
          scoreIncrease += 8;
          break;
      }
    });

    context.leadScore = Math.min(context.leadScore + scoreIncrease, 100);
  }

  private getFallbackResponse(): AIResponse {
    return {
      text: 'Disculpa, no pude procesar tu mensaje correctamente. ¿Podrías reformular tu pregunta o contactar directamente con nuestro equipo?',
      confidence: 0.1,
      intent: 'fallback',
      entities: [],
      quickReplies: [
        { id: '1', text: '📞 Llamar ahora', action: 'phone_contact' },
        { id: '2', text: '📧 Enviar email', action: 'email_contact' },
        { id: '3', text: '💬 WhatsApp', action: 'whatsapp_contact' }
      ]
    };
  }

  // Learning and improvement methods
  async recordConversation(context: ChatContext, satisfaction?: number): Promise<void> {
    if (!apiConfig.aiChatbot.learningMode) return;

    try {
      const conversationData = {
        sessionId: context.sessionId,
        messageCount: context.messageHistory.length,
        leadScore: context.leadScore,
        conversationStage: context.conversationStage,
        userInfo: context.userInfo,
        satisfaction,
        duration: Date.now() - context.messageHistory[0]?.timestamp.getTime(),
        timestamp: new Date().toISOString()
      };

      // Store for analysis
      const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
      conversations.push(conversationData);
      
      // Keep only last 100 conversations
      if (conversations.length > 100) {
        conversations.splice(0, conversations.length - 100);
      }
      
      localStorage.setItem('ai_conversations', JSON.stringify(conversations));

    } catch (error) {
      console.warn('Failed to record conversation:', error);
    }
  }

  async getConversationAnalytics(): Promise<any> {
    try {
      const conversations = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
      
      return {
        totalConversations: conversations.length,
        averageLeadScore: conversations.reduce((sum: number, conv: any) => sum + conv.leadScore, 0) / conversations.length,
        averageDuration: conversations.reduce((sum: number, conv: any) => sum + conv.duration, 0) / conversations.length,
        satisfactionRate: conversations.filter((conv: any) => conv.satisfaction >= 4).length / conversations.length,
        conversionRate: conversations.filter((conv: any) => conv.leadScore >= 70).length / conversations.length
      };
    } catch (error) {
      return { error: 'Analytics not available' };
    }
  }
}

export const aiChatbotService = new AIChatbotService();