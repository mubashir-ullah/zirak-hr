import React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { SkipToContentLink } from './AccessibleElements';
import { WebVitalsTracking, PreloadCriticalAssets, FontOptimization } from './PerformanceOptimizations';

interface SEOOptimizerProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: Record<string, any>;
  noIndex?: boolean;
  keywords?: string;
  children?: React.ReactNode;
}

export const SEOOptimizer: React.FC<SEOOptimizerProps> = ({
  title = 'Zirak HR | AI-Powered HR Innovation App',
  description = 'Zirak HR bridges tech talent gaps between Pakistan and Germany with AI-powered matching, skill assessment, and bias-free recruitment solutions.',
  canonicalUrl = 'https://zirak-hr.vercel.app',
  ogImage = 'https://zirak-hr.vercel.app/images/og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  structuredData,
  noIndex = false,
  keywords = 'HR technology, AI recruitment, talent matching, Pakistan tech talent, German employers',
  children,
}) => {
  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* No Index if specified */}
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        
        {/* Performance Optimizations */}
        <PreloadCriticalAssets />
        <FontOptimization />
        
        {/* Web Vitals Tracking */}
        <WebVitalsTracking />
      </Head>
      
      {/* Accessibility - Skip to Content Link */}
      <SkipToContentLink targetId="main-content" />
      
      {/* Main Content */}
      <main id="main-content">
        {children}
      </main>
    </>
  );
};

export default SEOOptimizer;
