import React, { useState, useEffect } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false
}) => {
  const [optimizedSrc, setOptimizedSrc] = useState(src);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Generate optimized image URLs for different screen sizes
    const generateOptimizedUrl = (originalUrl: string, width: number, quality: number = 80) => {
      if (originalUrl.includes('pexels.com')) {
        // For Pexels images, use their built-in optimization
        return `${originalUrl}&w=${width}&h=${Math.round(width * 0.75)}&fit=crop&auto=compress&cs=tinysrgb`;
      }
      return originalUrl;
    };

    // Detect device pixel ratio and screen size
    const devicePixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.innerWidth * devicePixelRatio;

    let targetWidth = 800;
    if (screenWidth <= 480) targetWidth = 480;
    else if (screenWidth <= 768) targetWidth = 768;
    else if (screenWidth <= 1200) targetWidth = 1200;
    else targetWidth = 1600;

    setOptimizedSrc(generateOptimizedUrl(src, targetWidth));
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleLoad}
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '400px 300px'
      }}
    />
  );
};

export default ImageOptimizer;