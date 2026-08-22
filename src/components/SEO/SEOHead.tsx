import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/og-image.jpg',
  type = 'website',
  noindex = false
}) => {
  const location = useLocation();
  const baseUrl = 'https://piscinasandinas.example.com';
  const currentUrl = `${baseUrl}${location.pathname}`;

  const defaultTitle = 'Piscinas Andinas - Piscinas de Fibra de Vidrio de Alto Estándar | Chile';
  const defaultDescription = 'Especialistas en fabricación e instalación de piscinas de fibra de vidrio de lujo. Más de 8 años de experiencia, garantía 25 años. Instalación en 7-10 días. Servicio en todo Chile.';
  const defaultKeywords = 'piscinas fibra de vidrio, piscinas Chile, instalación piscinas, piscinas de lujo, fibra de vidrio Chile, piscinas residenciales, Piscinas Andinas';

  const pageTitle = title ? `${title} | Piscinas Andinas` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageKeywords = keywords || defaultKeywords;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Piscinas Andinas",
    "description": pageDescription,
    "url": baseUrl,
    "telephone": "+56900000000",
    "email": "contacto@piscinasandinas.example.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressRegion": "Región Metropolitana",
      "addressLocality": "Santiago"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "-33.4489",
      "longitude": "-70.6693"
    },
    "openingHours": [
      "Mo-Fr 08:00-19:00",
      "Sa 09:00-15:00"
    ],
    "priceRange": "$$$",
    "serviceArea": {
      "@type": "Country",
      "name": "Chile"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Piscinas de Fibra de Vidrio",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Piscina Elegance 8x4",
            "description": "Piscina de fibra de vidrio modelo compacto"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Piscina Prestige 10x5",
            "description": "Piscina familiar con zona profunda"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Piscina Infinity 12x6",
            "description": "Piscina de lujo con borde infinito"
          }
        }
      ]
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="Piscinas Andinas" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content="Piscinas Andinas" />
      <meta property="og:locale" content="es_CL" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://images.pexels.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Additional Meta Tags */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="geo.region" content="CL" />
      <meta name="geo.placename" content="Chile" />
      <meta name="language" content="Spanish" />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Helmet>
  );
};

export default SEOHead;