import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LazyImage from '../LazyImage/LazyImage';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with placeholder initially', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="test-image"
      />
    );

    // Should show placeholder initially
    const placeholder = screen.getByRole('img', { hidden: true });
    expect(placeholder).toBeInTheDocument();
  });

  test('loads actual image when in viewport', async () => {
    // Mock intersection observer to trigger immediately
    const mockObserve = jest.fn((callback) => {
      // Simulate intersection
      callback([{ isIntersecting: true, target: document.createElement('div') }]);
    });
    
    mockIntersectionObserver.mockImplementation((callback) => ({
      observe: () => mockObserve(callback),
      unobserve: () => null,
      disconnect: () => null
    }));

    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="test-image"
      />
    );

    await waitFor(() => {
      const image = screen.getByAltText('Test image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  test('handles image load error gracefully', async () => {
    render(
      <LazyImage
        src="https://example.com/broken-image.jpg"
        alt="Test image"
        className="test-image"
      />
    );

    const image = screen.getByAltText('Test image');
    
    // Simulate image load error
    Object.defineProperty(image, 'complete', { value: false });
    image.dispatchEvent(new Event('error'));

    await waitFor(() => {
      expect(screen.getByText('Error al cargar imagen')).toBeInTheDocument();
    });
  });

  test('calls onLoad callback when image loads', async () => {
    const onLoadMock = jest.fn();
    
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={onLoadMock}
      />
    );

    const image = screen.getByAltText('Test image');
    
    // Simulate image load
    Object.defineProperty(image, 'complete', { value: true });
    image.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoadMock).toHaveBeenCalled();
    });
  });

  test('applies custom className', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const container = screen.getByAltText('Test image').closest('div');
    expect(container).toHaveClass('custom-class');
  });
});