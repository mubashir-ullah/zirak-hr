import { Metadata } from 'next';
import { generateMetadata } from '../components/SEO';

export default function generateAboutMetadata(): Metadata {
  return generateMetadata({
    title: "About Zirak HR | Our Story and Team",
    description: "Learn about Zirak HR's mission to connect Pakistani tech talent with German employers through AI-powered matching and bias-free recruitment.",
    keywords: "Zirak HR, Team Highlanders, Pakistan tech talent, German employers, AI recruitment, HR innovation",
    canonical: "/about",
    ogImage: "/images/team/team-highlanders-logo.svg",
    ogImageAlt: "Team Highlanders - Creators of Zirak HR",
  });
}
