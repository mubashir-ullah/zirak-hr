import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';
import Candidate from '../../../models/candidate';

export async function POST(request: Request) {
  try {
    const { db } = await connectToDatabase();
    const body = await request.json();
    
    const { 
      query, 
      useAI = true,
      filters = {} 
    } = body;
    
    // Build the MongoDB query
    const mongoQuery: any = {};
    
    // Add text search if query is provided
    if (query) {
      mongoQuery.$text = { $search: query };
    }
    
    // Add filters
    if (filters.experience && Array.isArray(filters.experience) && filters.experience.length === 2) {
      mongoQuery.experience = { 
        $gte: filters.experience[0], 
        $lte: filters.experience[1] 
      };
    }
    
    if (filters.location && filters.location !== 'all') {
      mongoQuery.location = { $regex: new RegExp(filters.location, 'i') };
    }
    
    if (filters.country && filters.country !== 'all') {
      mongoQuery.country = { $regex: new RegExp(filters.country, 'i') };
    }
    
    if (filters.city && filters.city !== 'all') {
      mongoQuery.city = { $regex: new RegExp(filters.city, 'i') };
    }
    
    if (filters.skills && filters.skills.length > 0) {
      mongoQuery.skills = { $in: filters.skills };
    }
    
    if (filters.language && filters.language !== 'all') {
      mongoQuery['languages.language'] = { $regex: new RegExp(filters.language, 'i') };
    }
    
    if (filters.languageProficiency && filters.languageProficiency !== 'all') {
      mongoQuery['languages.proficiency'] = { $regex: new RegExp(filters.languageProficiency, 'i') };
    }
    
    if (filters.germanLevel && filters.germanLevel !== 'all') {
      mongoQuery.germanLevel = filters.germanLevel;
    }
    
    if (filters.visaRequired && filters.visaRequired !== 'all') {
      mongoQuery.visaStatus = filters.visaRequired === 'required' ? 'Required' : 'Not Required';
    }
    
    if (filters.availability && filters.availability !== 'all') {
      mongoQuery.availability = { $regex: new RegExp(filters.availability, 'i') };
    }
    
    // Check if we have any candidates in the database
    const candidatesCount = await db.collection('candidates').countDocuments();
    
    // If no candidates exist, seed some sample data
    if (candidatesCount === 0) {
      await seedSampleCandidates(db);
    }
    
    // Execute the query
    let candidates = await db.collection('candidates').find(mongoQuery).toArray();
    
    // If AI matching is enabled, calculate match scores
    if (useAI && query) {
      candidates = calculateAIMatchScores(candidates, query);
    }
    
    // Sort by match score (highest first)
    candidates.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json(candidates);
    
  } catch (error) {
    console.error('Error searching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to search candidates' },
      { status: 500 }
    );
  }
}

// Function to seed sample candidates data
async function seedSampleCandidates(db: any) {
  const sampleCandidates = [
    {
      name: 'Aisha Khan',
      title: 'Senior Frontend Developer',
      location: 'Karachi, Pakistan',
      country: 'Pakistan',
      city: 'Karachi',
      matchScore: 95,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      experience: 5,
      education: 'BS Computer Science',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Basic' }
      ],
      germanLevel: 'A1',
      visaStatus: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Omar Farooq',
      title: 'Full Stack Developer',
      location: 'Lahore, Pakistan',
      country: 'Pakistan',
      city: 'Lahore',
      matchScore: 87,
      skills: ['Node.js', 'React', 'MongoDB', 'Express'],
      experience: 3,
      education: 'MS Software Engineering',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      germanLevel: 'B1',
      visaStatus: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Fatima Ali',
      title: 'UI/UX Designer',
      location: 'Islamabad, Pakistan',
      country: 'Pakistan',
      city: 'Islamabad',
      matchScore: 82,
      skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
      experience: 4,
      education: 'BFA Design',
      availability: '1 month',
      languages: [
        { language: 'English', proficiency: 'Intermediate' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Fluent' }
      ],
      germanLevel: 'C1',
      visaStatus: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Hassan Ahmed',
      title: 'Backend Developer',
      location: 'Karachi, Pakistan',
      country: 'Pakistan',
      city: 'Karachi',
      matchScore: 79,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      experience: 2,
      education: 'BS Software Engineering',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      germanLevel: 'B1',
      visaStatus: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Zainab Malik',
      title: 'DevOps Engineer',
      location: 'Lahore, Pakistan',
      country: 'Pakistan',
      city: 'Lahore',
      matchScore: 75,
      skills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
      experience: 6,
      education: 'MS Cloud Computing',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      germanLevel: 'B2',
      visaStatus: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Ali Raza',
      title: 'Mobile Developer',
      location: 'Berlin, Germany',
      country: 'Germany',
      city: 'Berlin',
      matchScore: 88,
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      experience: 4,
      education: 'MS Mobile Computing',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'German', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' }
      ],
      germanLevel: 'C2',
      visaStatus: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Sarah Johnson',
      title: 'Data Scientist',
      location: 'New York, USA',
      country: 'USA',
      city: 'New York',
      matchScore: 92,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      experience: 5,
      education: 'PhD Data Science',
      availability: '1 month',
      languages: [
        { language: 'English', proficiency: 'Native' },
        { language: 'German', proficiency: 'Basic' }
      ],
      germanLevel: 'A2',
      visaStatus: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Ahmed Khan',
      title: 'Product Manager',
      location: 'Dubai, UAE',
      country: 'UAE',
      city: 'Dubai',
      matchScore: 85,
      skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
      experience: 7,
      education: 'MBA',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Arabic', proficiency: 'Native' },
        { language: 'Urdu', proficiency: 'Fluent' }
      ],
      germanLevel: 'A1',
      visaStatus: 'Required',
      avatar: '/images/default-avatar.png'
    }
  ];
  
  await db.collection('candidates').insertMany(sampleCandidates);
}

// Function to calculate AI match scores
function calculateAIMatchScores(candidates: any[], query: string) {
  // In a real implementation, this would use an AI model to calculate match scores
  // For now, we'll use a simple keyword matching algorithm
  
  const keywords = query.toLowerCase().split(' ');
  
  return candidates.map(candidate => {
    let score = candidate.matchScore || 50; // Start with base score
    
    // Check for matches in title
    if (candidate.title) {
      const titleLower = candidate.title.toLowerCase();
      keywords.forEach(keyword => {
        if (titleLower.includes(keyword)) {
          score += 10;
        }
      });
    }
    
    // Check for matches in skills
    if (candidate.skills && Array.isArray(candidate.skills)) {
      const skillsLower = candidate.skills.map((s: string) => s.toLowerCase());
      keywords.forEach(keyword => {
        if (skillsLower.some((skill: string) => skill.includes(keyword))) {
          score += 15;
        }
      });
    }
    
    // Normalize score to be between 0-100
    score = Math.min(100, score);
    
    return {
      ...candidate,
      matchScore: score
    };
  });
}
