import { seoUtils, analyticsUtils } from '../seo';

// Mock gtag
declare global {
  interface Window {
    gtag: jest.Mock;
  }
}

describe('SEO Utils', () => {
  describe('generateMetaTags', () => {
    test('generates basic meta tags', () => {
      const tags = seoUtils.generateMetaTags({
        title: 'Test Title',
        description: 'Test Description',
        keywords: 'test, keywords'
      });

      expect(tags).toContainEqual({ name: 'title', content: 'Test Title' });
      expect(tags).toContainEqual({ name: 'description', content: 'Test Description' });
      expect(tags).toContainEqual({ name: 'keywords', content: 'test, keywords' });
    });

    test('generates Open Graph tags', () => {
      const tags = seoUtils.generateMetaTags({
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        url: 'https://example.com'
      });

      expect(tags).toContainEqual({ property: 'og:title', content: 'Test Title' });
      expect(tags).toContainEqual({ property: 'og:description', content: 'Test Description' });
      expect(tags).toContainEqual({ property: 'og:image', content: 'https://example.com/image.jpg' });
      expect(tags).toContainEqual({ property: 'og:url', content: 'https://example.com' });
    });

    test('generates Twitter Card tags', () => {
      const tags = seoUtils.generateMetaTags({
        title: 'Test Title',
        description: 'Test Description',
        image: 'https://example.com/image.jpg'
      });

      expect(tags).toContainEqual({ name: 'twitter:title', content: 'Test Title' });
      expect(tags).toContainEqual({ name: 'twitter:description', content: 'Test Description' });
      expect(tags).toContainEqual({ name: 'twitter:image', content: 'https://example.com/image.jpg' });
    });
  });

  describe('generateStructuredData', () => {
    test('generates basic structured data', () => {
      const data = seoUtils.generateStructuredData('Organization', {
        name: 'Test Company',
        url: 'https://example.com'
      });

      const parsed = JSON.parse(data);
      expect(parsed['@context']).toBe('https://schema.org');
      expect(parsed['@type']).toBe('Organization');
      expect(parsed.name).toBe('Test Company');
      expect(parsed.url).toBe('https://example.com');
    });
  });

  describe('generateBreadcrumbs', () => {
    test('generates breadcrumb structured data', () => {
      const items = [
        { name: 'Home', url: 'https://example.com' },
        { name: 'Products', url: 'https://example.com/products' },
        { name: 'Product 1', url: 'https://example.com/products/1' }
      ];

      const data = seoUtils.generateBreadcrumbs(items);
      const parsed = JSON.parse(data);

      expect(parsed['@type']).toBe('BreadcrumbList');
      expect(parsed.itemListElement).toHaveLength(3);
      expect(parsed.itemListElement[0].position).toBe(1);
      expect(parsed.itemListElement[0].name).toBe('Home');
    });
  });

  describe('generateFAQ', () => {
    test('generates FAQ structured data', () => {
      const faqs = [
        { question: 'What is this?', answer: 'This is a test.' },
        { question: 'How does it work?', answer: 'It works well.' }
      ];

      const data = seoUtils.generateFAQ(faqs);
      const parsed = JSON.parse(data);

      expect(parsed['@type']).toBe('FAQPage');
      expect(parsed.mainEntity).toHaveLength(2);
      expect(parsed.mainEntity[0]['@type']).toBe('Question');
      expect(parsed.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });
  });

  describe('validateMetaTags', () => {
    beforeEach(() => {
      // Clear document head
      document.head.innerHTML = '';
    });

    test('detects missing title', () => {
      const issues = seoUtils.validateMetaTags();
      expect(issues).toContain('Missing title tag');
    });

    test('detects long title', () => {
      const title = document.createElement('title');
      title.textContent = 'This is a very long title that exceeds the recommended 60 character limit for SEO purposes';
      document.head.appendChild(title);

      const issues = seoUtils.validateMetaTags();
      expect(issues).toContain('Title too long (>60 characters)');
    });

    test('detects missing meta description', () => {
      const title = document.createElement('title');
      title.textContent = 'Test Title';
      document.head.appendChild(title);

      const issues = seoUtils.validateMetaTags();
      expect(issues).toContain('Missing meta description');
    });

    test('detects long meta description', () => {
      const title = document.createElement('title');
      title.textContent = 'Test Title';
      document.head.appendChild(title);

      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'This is a very long meta description that exceeds the recommended 160 character limit for SEO purposes and should be flagged as too long';
      document.head.appendChild(meta);

      const issues = seoUtils.validateMetaTags();
      expect(issues).toContain('Meta description too long (>160 characters)');
    });

    test('detects missing canonical URL', () => {
      const title = document.createElement('title');
      title.textContent = 'Test Title';
      document.head.appendChild(title);

      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Test description';
      document.head.appendChild(meta);

      const issues = seoUtils.validateMetaTags();
      expect(issues).toContain('Missing canonical URL');
    });
  });
});

describe('Analytics Utils', () => {
  beforeEach(() => {
    // Mock gtag
    window.gtag = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackPageView', () => {
    test('tracks page view with gtag', () => {
      analyticsUtils.trackPageView('/test-page', 'Test Page');

      expect(window.gtag).toHaveBeenCalledWith('config', 'GA_MEASUREMENT_ID', {
        page_path: '/test-page',
        page_title: 'Test Page'
      });
    });
  });

  describe('trackEvent', () => {
    test('tracks event with gtag', () => {
      analyticsUtils.trackEvent('click', 'button', 'cta', 1);

      expect(window.gtag).toHaveBeenCalledWith('event', 'click', {
        event_category: 'button',
        event_label: 'cta',
        value: 1
      });
    });
  });

  describe('trackConversion', () => {
    test('tracks conversion with gtag', () => {
      analyticsUtils.trackConversion('AW-000000009/abc123', 100, 'USD');

      expect(window.gtag).toHaveBeenCalledWith('event', 'conversion', {
        send_to: 'AW-000000009/abc123',
        value: 100,
        currency: 'USD'
      });
    });
  });

  describe('trackFormSubmission', () => {
    test('tracks successful form submission', () => {
      analyticsUtils.trackFormSubmission('contact', true);

      expect(window.gtag).toHaveBeenCalledWith('event', 'form_submit_success', {
        event_category: 'forms',
        event_label: 'contact'
      });
    });

    test('tracks failed form submission', () => {
      analyticsUtils.trackFormSubmission('contact', false);

      expect(window.gtag).toHaveBeenCalledWith('event', 'form_submit_error', {
        event_category: 'forms',
        event_label: 'contact'
      });
    });
  });
});