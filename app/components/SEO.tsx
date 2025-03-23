import { Metadata } from 'next';

type SEOProps = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogImageAlt?: string;
  canonical?: string;
  noIndex?: boolean;
};

export const generateMetadata = ({
  title = "Zirak HR | AI-Powered HR Innovation App",
  description = "Zirak HR bridges tech talent gaps between Pakistan and Germany with AI-powered matching, skill assessment, and bias-free recruitment solutions.",
  keywords = "HR technology, AI recruitment, talent matching, Pakistan tech talent, German employers",
  ogImage = "/images/og-image.jpg",
  ogImageAlt = "Zirak HR - Bridging Tech Talent Gaps",
  canonical = "",
  noIndex = false,
}: SEOProps): Metadata => {
  const metadataBase = new URL("https://zirak-hr.vercel.app");
  const canonicalUrl = canonical 
    ? new URL(canonical, metadataBase).toString() 
    : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [
        {
          url: ogImage,
          alt: ogImageAlt,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex ? {
      index: false,
      follow: false,
    } : undefined,
  };
};
