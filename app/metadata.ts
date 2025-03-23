import { Metadata } from 'next';
import { generateMetadata } from './components/SEO';

export default function generateHomeMetadata(): Metadata {
  return generateMetadata({
    title: "Zirak HR | Bridging Tech Talent Gaps Between Pakistan and Germany",
    description: "Zirak HR connects Pakistani tech talent with German innovation-driven companies through AI-powered matching, skill assessment, and bias-free recruitment.",
    keywords: "HR technology, AI recruitment, talent matching, Pakistan tech talent, German employers, job matching, skill assessment",
    canonical: "/",
  });
}
