import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Query Supabase for skills
    const { data: skillsData, error } = await supabase
      .from('skills')
      .select('name')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    // Extract skill names from the data
    const skills = skillsData.map(skill => skill.name);
    
    // If no skills are found in the database, return a predefined list
    if (skills.length === 0) {
      const commonSkills = [
        // Frontend
        'React', 'Angular', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 
        'Tailwind CSS', 'Material UI', 'Redux', 'Webpack', 'Responsive Design',
        
        // Backend
        'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
        'ASP.NET', 'Java', 'Python', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
        
        // Database
        'MongoDB', 'PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'Redis', 'Elasticsearch',
        'Firebase', 'DynamoDB', 'Cassandra',
        
        // DevOps
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'Terraform',
        'Ansible', 'Linux', 'Nginx', 'Apache',
        
        // Mobile
        'React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Xamarin',
        
        // Design
        'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design',
        'User Research', 'Wireframing', 'Prototyping',
        
        // Data
        'SQL', 'Data Analysis', 'Data Visualization', 'Machine Learning', 'TensorFlow',
        'PyTorch', 'Pandas', 'NumPy', 'R', 'Tableau', 'Power BI',
        
        // Project Management
        'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Trello', 'Asana',
        
        // Soft Skills
        'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Leadership'
      ];
      
      return NextResponse.json(commonSkills);
    }
    
    return NextResponse.json(skills);
    
  } catch (error) {
    console.error('Error fetching skills:', error);
    
    // If there's an error, return the predefined list as a fallback
    const fallbackSkills = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 
      'Docker', 'Kubernetes', 'TypeScript', 'HTML', 'CSS', 'Git'
    ];
    
    return NextResponse.json(fallbackSkills);
  }
}
