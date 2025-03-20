import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    const { db } = await connectToDatabase();
    
    // In a real implementation, this would query the database for all unique skills
    // For now, we'll return a predefined list of skills
    
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
    
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
