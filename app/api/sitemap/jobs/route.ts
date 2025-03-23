import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all active job listings
    const jobs = await db.collection('jobs')
      .find({ status: 'active' })
      .project({ _id: 1, title: 1, updatedAt: 1 })
      .toArray();
    
    // Generate sitemap XML
    const baseUrl = 'https://zirak-hr.vercel.app';
    
    const jobsXml = jobs.map(job => `
      <url>
        <loc>${baseUrl}/jobs/${job._id}</loc>
        <lastmod>${new Date(job.updatedAt || Date.now()).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
    `).join('');
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${jobsXml}
      </urlset>
    `;
    
    // Return the XML with proper content type
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating jobs sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}
