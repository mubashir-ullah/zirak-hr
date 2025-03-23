import { useEffect } from 'react';
import Script from 'next/script';

export const LazyLoadComponent = ({ children, threshold = 0.1 }: { children: React.ReactNode, threshold?: number }) => {
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      const lazyElements = document.querySelectorAll('.lazy-load');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            element.classList.remove('lazy-load');
            element.classList.add('lazy-loaded');
            observer.unobserve(element);
          }
        });
      }, { threshold });
      
      lazyElements.forEach(element => {
        observer.observe(element);
      });
      
      return () => {
        lazyElements.forEach(element => {
          observer.unobserve(element);
        });
      };
    }
  }, [threshold]);
  
  return (
    <div className="lazy-load opacity-0 transition-opacity duration-500">
      {children}
    </div>
  );
};

export const FontOptimization = () => {
  return (
    <>
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        media="print"
        onLoad={() => {
          const linkElement = document.querySelector('link[media="print"]');
          if (linkElement) {
            linkElement.setAttribute('media', 'all');
          }
        }}
      />
    </>
  );
};

export const ImageOptimization = ({ src, alt, width, height, className = '' }: { 
  src: string, 
  alt: string, 
  width?: number, 
  height?: number, 
  className?: string 
}) => {
  return (
    <picture>
      <source type="image/webp" srcSet={`${src.replace(/\.(jpg|jpeg|png)$/i, '.webp')}`} />
      <source type="image/jpeg" srcSet={src} />
      <img 
        src={src} 
        alt={alt} 
        width={width} 
        height={height} 
        loading="lazy" 
        decoding="async" 
        className={className}
      />
    </picture>
  );
};

export const PreloadCriticalAssets = () => {
  return (
    <>
      <link rel="preload" href="/images/logo.png" as="image" />
      <link rel="preload" href="/fonts/custom-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/css/critical.css" as="style" />
    </>
  );
};

export const WebVitalsTracking = () => {
  return (
    <Script id="web-vitals" strategy="afterInteractive">
      {`
        import {onCLS, onFID, onLCP} from 'web-vitals';
        
        function sendToAnalytics({name, delta, value, id}) {
          const body = JSON.stringify({name, delta, value, id});
          
          (navigator.sendBeacon && navigator.sendBeacon('/api/analytics/vitals', body)) || 
            fetch('/api/analytics/vitals', {body, method: 'POST', keepalive: true});
        }
        
        onCLS(sendToAnalytics);
        onFID(sendToAnalytics);
        onLCP(sendToAnalytics);
      `}
    </Script>
  );
};
