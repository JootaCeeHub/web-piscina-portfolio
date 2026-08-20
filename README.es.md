# Multifibra L.A. Website (web-piscina-portfolio)

Sitio corporativo orientado a conversión para una empresa de piscinas de fibra de vidrio, construido como SPA en React con analítica integrada, captura de leads y monitoreo de performance.

## Overview
Este proyecto es una aplicación web de marketing y generación de leads para **Multifibra L.A.** Presenta la propuesta de valor, servicios y modelos de piscina, guiando a las personas usuarias hacia conversiones como formularios de contacto, WhatsApp y suscripción a newsletter.

Además del contenido, la app incluye capacidades frontend avanzadas: A/B testing, instrumentación analítica, tracking de conversiones, chatbot/live chat, gestión SEO, utilidades de accesibilidad y monitoreo en ejecución.

### Clasificación del proyecto
- **Tipo:** Aplicación web (sitio de marketing + plataforma de captación de leads)
- **Estado actual:** MVP avanzado / listo para pasar de desarrollo a producción (con funcionalidades sólidas y tests, sujeto a configuración de integraciones)

## Features
- Ruteo SPA multipágina (`Home`, `Services`, `About`, `Contact`) con layout compartido.
- Captación de leads mediante formularios de contacto (integración con Formspree y validaciones).
- Componentes de conversión:
  - Proveedor de A/B testing y hooks de tracking de conversiones.
  - Widget de live chat y componente de chatbot avanzado.
  - Newsletter signup e instrumentación de CTAs.
- Integraciones de analítica y marketing:
  - Tracking de eventos con Google Analytics 4.
  - Integración de Hotjar (controlada por feature flags).
  - Integración de Facebook Pixel (controlada por feature flags).
- Monitoreo y confiabilidad:
  - Inicialización de Sentry y error boundaries.
  - Utilidades de monitoreo de performance y control de presupuesto.
- SEO y descubrimiento:
  - Metadata SEO dinámica.
  - `sitemap.xml`, `robots.txt` y `webmanifest`.
- Aseguramiento de calidad:
  - Tests unitarios/integración con Jest + React Testing Library.
  - Tests end-to-end con Cypress para flujos críticos.
- Soporte PWA mediante `vite-plugin-pwa`.

## Tech Stack
- **Lenguaje:** TypeScript
- **Frontend:** React 18
- **Build tool:** Vite 5
- **Estilos:** Tailwind CSS + PostCSS
- **Ruteo:** React Router DOM
- **SEO metadata:** React Helmet Async
- **Formularios:** Formspree (`@formspree/react`)
- **Observabilidad:** Sentry (`@sentry/react`)
- **Analítica:** `react-ga4`, integraciones Hotjar y Facebook Pixel
- **Testing:** Jest, React Testing Library, Cypress
- **PWA:** `vite-plugin-pwa`

## Architecture
La aplicación sigue una arquitectura SPA orientada a componentes con separación clara de responsabilidades:

- **`src/pages`** define las páginas por ruta.
- **`src/components`** contiene UI reutilizable y módulos funcionales (analítica, formularios, chatbot, performance, accesibilidad, etc.).
- **`src/hooks`** centraliza comportamiento reutilizable (analítica, local storage, observers, helpers de Formspree).
- **`src/services`** encapsula lógica de negocio e integraciones (servicios de analytics, CRM, IA chatbot, alertas).
- **`src/config`** provee configuración centralizada de servicios externos desde variables de entorno.
- **`src/context`** gestiona estado global con Context API + reducer.
- **`src/utils`** aporta utilidades transversales (SEO, accesibilidad, performance, reporte de errores).
- **`src/monitoring`** inicializa Sentry y wrappers de monitoreo.
- **`public`** almacena assets estáticos SEO/PWA.

En ejecución, `App.tsx` compone el stack de providers (Helmet, contexto global, A/B testing, analytics, monitoreo, notificaciones y router), y luego renderiza las rutas y componentes globales de conversión.

## Installation
### Prerrequisitos
- Node.js 18+
- npm 9+

### Pasos
```bash
git clone <tu-url-del-repositorio>
cd web-piscina-portfolio
npm install
```

### Variables de entorno
Crea un archivo `.env` en la raíz del proyecto y configura primero lo indispensable:

```bash
# Analytics
VITE_GA_MEASUREMENT_ID=
VITE_ENABLE_ANALYTICS=true

# Hotjar
VITE_HOTJAR_ID=
VITE_ENABLE_HOTJAR=false

# Facebook Pixel
VITE_FACEBOOK_PIXEL_ID=
VITE_ENABLE_FACEBOOK_PIXEL=false

# Formularios
VITE_FORMSPREE_CONTACT_ID=
VITE_FORMSPREE_QUOTE_ID=
VITE_FORMSPREE_NEWSLETTER_ID=
VITE_FORMSPREE_VISIT_ID=

# Monitoreo
VITE_SENTRY_DSN=
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PERFORMANCE_MONITORING=false

# Funcionalidades opcionales
VITE_ENABLE_LIVE_CHAT=true
VITE_ENABLE_AI_CHATBOT=true
```

## Usage
### Desarrollo
```bash
npm run dev
```
Abre `http://localhost:5173`.

### Build de producción
```bash
npm run build
npm run preview
```

### Scripts útiles
```bash
npm run lint
npm run test
npm run test:coverage
npm run test:e2e
npm run performance:budget
```

## Project Structure
```text
web-piscina-portfolio/
├── public/                  # Assets estáticos (SEO, PWA, imágenes)
├── src/
│   ├── components/          # UI reutilizable y módulos funcionales
│   ├── pages/               # Páginas por ruta
│   ├── hooks/               # Hooks personalizados
│   ├── services/            # Servicios de negocio/integración
│   ├── config/              # Configuración externa por entorno
│   ├── context/             # Estado global y providers
│   ├── monitoring/          # Setup de Sentry/monitoreo
│   ├── utils/               # Utilidades compartidas
│   ├── App.tsx              # Composición root de providers + rutas
│   └── main.tsx             # Bootstrap de la app
├── cypress/                 # Suite de tests end-to-end
├── scripts/                 # Scripts utilitarios (performance budget)
├── vite.config.ts           # Configuración Vite + PWA + bundles
├── cypress.config.ts        # Configuración de Cypress
├── jest.config.js           # Configuración de Jest
└── package.json             # Scripts y dependencias
```

## Development
Flujo recomendado:
1. Crear rama para feature o fix.
2. Implementar cambios siguiendo enfoque TypeScript-first.
3. Ejecutar controles de calidad locales:
   - `npm run lint`
   - `npm run test`
   - `npm run test:e2e` (cuando aplique)
4. Generar build antes de abrir PR:
   - `npm run build`

Buenas prácticas:
- Mantener lógica funcional en `services`/`hooks` y componentes UI enfocados.
- Preferir feature flags para integraciones de terceros.
- Agregar o actualizar tests cuando cambie el comportamiento.

## Roadmap
- Incorporar backend/BFF para proteger claves de integraciones server-side.
- Mejorar la estrategia i18n para experiencia multilenguaje de primera clase.
- Expandir dashboards para embudo de leads y atribución de conversiones.
- Fortalecer CI/CD con gates automáticos de Lighthouse y cobertura.
- Incorporar flujo de contenidos con CMS para equipos no técnicos.

## License
esto es personal y privado creado y desarrollado por mi JootaCee.

## Author
esto es personal y privado creado y desarrollado por mi JootaCee.
