import React from 'react';
import { render, screen } from '@testing-library/react';
import { ABTestProvider, useABTest, useHeroTest } from '../ABTesting/ABTestProvider';

// Test component that uses A/B testing
const TestComponent: React.FC = () => {
  const { getVariant, trackConversion } = useABTest();
  const heroTest = useHeroTest();
  
  const variant = getVariant('hero_headline');
  
  return (
    <div>
      <div data-testid="variant">{variant}</div>
      <div data-testid="config">{JSON.stringify(heroTest.config)}</div>
      <button onClick={() => trackConversion('hero_headline', 'click')}>
        Track Conversion
      </button>
    </div>
  );
};

describe('ABTestProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('provides A/B test context', () => {
    render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const variant = screen.getByTestId('variant');
    expect(variant.textContent).toMatch(/^(control|variant_a)$/);
  });

  test('assigns consistent variants', () => {
    const { rerender } = render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const firstVariant = screen.getByTestId('variant').textContent;

    rerender(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const secondVariant = screen.getByTestId('variant').textContent;
    expect(firstVariant).toBe(secondVariant);
  });

  test('stores variants in localStorage', () => {
    render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const storedVariants = localStorage.getItem('ab_test_variants');
    expect(storedVariants).toBeTruthy();
    
    const parsed = JSON.parse(storedVariants!);
    expect(parsed.hero_headline).toMatch(/^(control|variant_a)$/);
  });

  test('provides test configuration', () => {
    render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const config = screen.getByTestId('config');
    const configData = JSON.parse(config.textContent!);
    
    expect(configData).toHaveProperty('headline');
    expect(configData).toHaveProperty('subheadline');
  });

  test('tracks conversions', () => {
    // Mock gtag
    window.gtag = jest.fn();
    
    render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const button = screen.getByText('Track Conversion');
    button.click();

    expect(window.gtag).toHaveBeenCalledWith('event', 'ab_test_conversion', 
      expect.objectContaining({
        test_id: 'hero_headline',
        conversion_type: 'click'
      })
    );
  });

  test('stores conversions locally', () => {
    render(
      <ABTestProvider>
        <TestComponent />
      </ABTestProvider>
    );

    const button = screen.getByText('Track Conversion');
    button.click();

    const conversions = localStorage.getItem('ab_test_conversions');
    expect(conversions).toBeTruthy();
    
    const parsed = JSON.parse(conversions!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      testId: 'hero_headline',
      conversionType: 'click'
    });
  });
});