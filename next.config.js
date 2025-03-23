/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['zirak-hr.vercel.app'],
  },
  async redirects() {
    return [
      // Redirect old URLs to new ones for better SEO
      {
        source: '/about-us',
        destination: '/about',
        permanent: true, // 301 redirect
      },
      {
        source: '/team',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/jobs',
        destination: '/talent/dashboard',
        permanent: false, // 307 temporary redirect
      },
      {
        source: '/signin',
        destination: '/login',
        permanent: true,
      },
      {
        source: '/signup',
        destination: '/register',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      // Clean URLs for better user experience and SEO
      {
        source: '/j/:jobId',
        destination: '/jobs/:jobId',
      },
      {
        source: '/t/:talentId',
        destination: '/talent/profile/:talentId',
      },
      {
        source: '/c/:companyId',
        destination: '/companies/:companyId',
      },
    ];
  },
};

module.exports = nextConfig;
