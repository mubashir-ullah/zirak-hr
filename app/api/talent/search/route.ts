import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      query, 
      useAI = true,
      filters = {} 
    } = body;
    
    // Build the Supabase query
    let supabaseQuery = supabase
      .from('candidates')
      .select('*');
    
    // Add filters
    if (filters.experience && Array.isArray(filters.experience) && filters.experience.length === 2) {
      supabaseQuery = supabaseQuery
        .gte('experience', filters.experience[0])
        .lte('experience', filters.experience[1]);
    }
    
    if (filters.location && filters.location !== 'all') {
      supabaseQuery = supabaseQuery.ilike('location', `%${filters.location}%`);
    }
    
    if (filters.country && filters.country !== 'all') {
      supabaseQuery = supabaseQuery.ilike('country', `%${filters.country}%`);
    }
    
    if (filters.city && filters.city !== 'all') {
      supabaseQuery = supabaseQuery.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.skills && filters.skills.length > 0) {
      // For array containment, we need to use the "contains" operator
      // This checks if the skills array contains ANY of the filter skills
      supabaseQuery = supabaseQuery.contains('skills', filters.skills);
    }
    
    if (filters.language && filters.language !== 'all') {
      // For JSON array fields, we need to use a different approach
      // This is a simplification - in a real app, you'd use a more sophisticated query
      supabaseQuery = supabaseQuery.ilike('languages', `%${filters.language}%`);
    }
    
    if (filters.languageProficiency && filters.languageProficiency !== 'all') {
      supabaseQuery = supabaseQuery.ilike('languages', `%${filters.languageProficiency}%`);
    }
    
    if (filters.germanLevel && filters.germanLevel !== 'all') {
      supabaseQuery = supabaseQuery.eq('german_level', filters.germanLevel);
    }
    
    if (filters.visaRequired && filters.visaRequired !== 'all') {
      const visaStatus = filters.visaRequired === 'required' ? 'Required' : 'Not Required';
      supabaseQuery = supabaseQuery.eq('visa_status', visaStatus);
    }
    
    if (filters.availability && filters.availability !== 'all') {
      supabaseQuery = supabaseQuery.ilike('availability', `%${filters.availability}%`);
    }
    
    // Execute the query
    const { data: candidates, error, count } = await supabaseQuery;
    
    if (error) {
      throw error;
    }
    
    // Check if we have any candidates in the database
    if (!candidates || candidates.length === 0) {
      // Seed sample data if no candidates exist
      await seedSampleCandidates();
      
      // Re-run the query
      const { data: seededCandidates, error: seededError } = await supabaseQuery;
      
      if (seededError) {
        throw seededError;
      }
      
      if (!seededCandidates || seededCandidates.length === 0) {
        // If still no candidates, return empty array
        return NextResponse.json([]);
      }
      
      // If AI matching is enabled, calculate match scores
      let processedCandidates = seededCandidates;
      if (useAI && query) {
        processedCandidates = calculateAIMatchScores(seededCandidates, query);
      }
      
      // Sort by match score (highest first)
      processedCandidates.sort((a, b) => b.match_score - a.match_score);
      
      return NextResponse.json(processedCandidates);
    }
    
    // If AI matching is enabled, calculate match scores
    let processedCandidates = candidates;
    if (useAI && query) {
      processedCandidates = calculateAIMatchScores(candidates, query);
    }
    
    // Sort by match score (highest first)
    processedCandidates.sort((a, b) => b.match_score - a.match_score);
    
    return NextResponse.json(processedCandidates);
    
  } catch (error) {
    console.error('Error searching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to search candidates' },
      { status: 500 }
    );
  }
}

// Function to seed sample candidates data
async function seedSampleCandidates() {
  const sampleCandidates = [
    {
      name: 'Aisha Khan',
      title: 'Senior Frontend Developer',
      location: 'Karachi, Pakistan',
      country: 'Pakistan',
      city: 'Karachi',
      match_score: 95,
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
      experience: 5,
      education: 'BS Computer Science',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Basic' }
      ],
      german_level: 'A1',
      visa_status: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Omar Farooq',
      title: 'Full Stack Developer',
      location: 'Lahore, Pakistan',
      country: 'Pakistan',
      city: 'Lahore',
      match_score: 87,
      skills: ['Node.js', 'React', 'MongoDB', 'Express'],
      experience: 3,
      education: 'MS Software Engineering',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      german_level: 'B1',
      visa_status: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Fatima Ali',
      title: 'UI/UX Designer',
      location: 'Islamabad, Pakistan',
      country: 'Pakistan',
      city: 'Islamabad',
      match_score: 82,
      skills: ['Figma', 'Adobe XD', 'UI Design', 'User Research'],
      experience: 4,
      education: 'BFA Design',
      availability: '1 month',
      languages: [
        { language: 'English', proficiency: 'Intermediate' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Fluent' }
      ],
      german_level: 'C1',
      visa_status: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Hassan Ahmed',
      title: 'Backend Developer',
      location: 'Karachi, Pakistan',
      country: 'Pakistan',
      city: 'Karachi',
      match_score: 79,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      experience: 2,
      education: 'BS Software Engineering',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      german_level: 'B1',
      visa_status: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Zainab Malik',
      title: 'DevOps Engineer',
      location: 'Lahore, Pakistan',
      country: 'Pakistan',
      city: 'Lahore',
      match_score: 75,
      skills: ['AWS', 'Kubernetes', 'CI/CD', 'Terraform'],
      experience: 6,
      education: 'MS Cloud Computing',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' },
        { language: 'German', proficiency: 'Intermediate' }
      ],
      german_level: 'B2',
      visa_status: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Ali Raza',
      title: 'Mobile Developer',
      location: 'Berlin, Germany',
      country: 'Germany',
      city: 'Berlin',
      match_score: 88,
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
      experience: 4,
      education: 'MS Mobile Computing',
      availability: 'Immediately',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'German', proficiency: 'Fluent' },
        { language: 'Urdu', proficiency: 'Native' }
      ],
      german_level: 'C2',
      visa_status: 'Not Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Sarah Johnson',
      title: 'Data Scientist',
      location: 'New York, USA',
      country: 'USA',
      city: 'New York',
      match_score: 92,
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      experience: 5,
      education: 'PhD Data Science',
      availability: '1 month',
      languages: [
        { language: 'English', proficiency: 'Native' },
        { language: 'German', proficiency: 'Basic' }
      ],
      german_level: 'A2',
      visa_status: 'Required',
      avatar: '/images/default-avatar.png'
    },
    {
      name: 'Ahmed Khan',
      title: 'Product Manager',
      location: 'Dubai, UAE',
      country: 'UAE',
      city: 'Dubai',
      match_score: 85,
      skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
      experience: 7,
      education: 'MBA',
      availability: '2 weeks',
      languages: [
        { language: 'English', proficiency: 'Fluent' },
        { language: 'Arabic', proficiency: 'Native' },
        { language: 'Urdu', proficiency: 'Fluent' }
      ],
      german_level: 'A1',
      visa_status: 'Required',
      avatar: '/images/default-avatar.png'
    }
  ];
  
  // Insert sample candidates into the database
  for (const candidate of sampleCandidates) {
    const { error } = await supabase
      .from('candidates')
      .insert(candidate);
    
    if (error) {
      console.error('Error seeding candidate:', error);
    }
  }
}

// Function to calculate AI match scores
function calculateAIMatchScores(candidates: any[], query: string) {
  // In a real implementation, this would use an AI model to calculate match scores
  // For now, we'll use a simple keyword matching algorithm
  
  const keywords = query.toLowerCase().split(' ');
  
  return candidates.map(candidate => {
    let score = candidate.match_score || 50; // Start with base score
    
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
      match_score: score
    };
  });
}
