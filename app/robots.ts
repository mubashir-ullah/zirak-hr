import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', // Protect authenticated dashboard routes
        '/api/',       // Protect API routes
        '/admin/',     // Protect admin routes
      ],
    },
    sitemap: 'https://zirak-hr.vercel.app/sitemap.xml',
  };
}
