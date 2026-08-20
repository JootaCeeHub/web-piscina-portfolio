// SEO utilities
export const seoUtils = {
  // Generate meta tags
  generateMetaTags: (data: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }) => {
    const tags = [];
    
    if (data.title) {
      tags.push({ name: 'title', content: data.title });
      tags.push({ property: 'og:title', content: data.title });
      tags.push({ name: 'twitter:title', content: data.title });
    }
    
    if (data.description) {
      tags.push({ name: 'description', content: data.description });
      tags.push({ property: 'og:description', content: data.description });
      tags.push({ name: 'twitter:description', content: data.description });
    }
    
    if (data.keywords) {
      tags.push({ name: 'keywords', content: data.keywords });
    }
    
    if (data.image) {
      tags.push({ property: 'og:image', content: data.image });
      tags.push({ name: 'twitter:image', content: data.image });
    }
    
    if (data.url) {
      tags.push({ property: 'og:url', content: data.url });
    }
    
    if (data.type) {
      tags.push({ property: 'og:type', content: data.type });
    }
    
    return tags;
  },

  // Generate structured data
  generateStructuredData: (type: string, data: any) => {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };
    
    return JSON.stringify(baseStructure);
  },

  // Generate breadcrumb structured data
  generateBreadcrumbs: (items: Array<{ name: string; url: string }>) => {
    return seoUtils.generateStructuredData('BreadcrumbList', {
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    });
  },

  // Generate FAQ structured data
  generateFAQ: (faqs: Array<{ question: string; answer: string }>) => {
    return seoUtils.generateStructuredData('FAQPage', {
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    });
  },

  // Generate local business structured data
  generateLocalBusiness: (business: {
    name: string;
    description: string;
    address: any;
    phone: string;
    email: string;
    url: string;
    openingHours: string[];
    priceRange: string;
  }) => {
    return seoUtils.generateStructuredData('LocalBusiness', business);
  },

  // Validate meta tags
  validateMetaTags: () => {
    const issues = [];
    
    // Check title
    const title = document.querySelector('title')?.textContent;
    if (!title) {
      issues.push('Missing title tag');
    } else if (title.length > 60) {
      issues.push('Title too long (>60 characters)');
    }
    
    // Check description
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (!description) {
      issues.push('Missing meta description');
    } else if (description.length > 160) {
      issues.push('Meta description too long (>160 characters)');
    }
    
    // Check canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      issues.push('Missing canonical URL');
    }
    
    // Check Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    
    if (!ogTitle) issues.push('Missing og:title');
    if (!ogDescription) issues.push('Missing og:description');
    if (!ogImage) issues.push('Missing og:image');
    
    return issues;
  }
};

// Analytics utilities
export const analyticsUtils = {
  // Track page views
  trackPageView: (path: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title
      });
    }
  },

  // Track events
  trackEvent: (action: string, category: string, label?: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  },

  // Track conversions
  trackConversion: (conversionId: string, value?: number, currency: string = 'CLP') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: conversionId,
        value: value,
        currency: currency
      });
    }
  },

  // Track form submissions
  trackFormSubmission: (formName: string, success: boolean) => {
    analyticsUtils.trackEvent(
      success ? 'form_submit_success' : 'form_submit_error',
      'forms',
      formName
    );
  },

  // Track scroll depth
  trackScrollDepth: () => {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90, 100];
    const tracked = new Set();

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !tracked.has(milestone)) {
            tracked.add(milestone);
            analyticsUtils.trackEvent('scroll_depth', 'engagement', `${milestone}%`);
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }
};