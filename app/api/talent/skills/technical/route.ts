import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Define type for technical skills
type TechnicalSkillsMap = {
  [category: string]: string[];
};

// Fallback technical skills data in case database is not available
const fallbackTechnicalSkills: TechnicalSkillsMap = {
  'Programming Languages': [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'Scala', 'Perl', 'Haskell',
    'Clojure', 'Elixir', 'R', 'MATLAB'
  ],
  'Web Development': [
    'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Gatsby',
    'Node.js', 'Express', 'Django', 'Flask', 'Ruby on Rails', 'Laravel',
    'Spring Boot', 'ASP.NET', 'jQuery', 'Bootstrap', 'Tailwind CSS',
    'Material UI', 'Redux', 'GraphQL', 'REST API', 'WebSockets'
  ],
  'Database': [
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
    'SQLite', 'Oracle', 'Microsoft SQL Server', 'Firebase', 'Supabase', 'Neo4j', 'CouchDB'
  ],
  'DevOps': [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'Terraform', 'Ansible',
    'Jenkins', 'GitHub Actions', 'CircleCI', 'Travis CI', 'Prometheus', 'Grafana',
    'ELK Stack', 'Nginx', 'Apache', 'Linux', 'Bash', 'PowerShell'
  ],
  'Mobile Development': [
    'iOS', 'Android', 'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Swift UI',
    'Jetpack Compose', 'Kotlin Multiplatform', 'Objective-C', 'Java for Android'
  ],
  'Data Science': [
    'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision',
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Pandas', 'NumPy', 'Data Visualization',
    'Jupyter', 'Tableau', 'Power BI', 'Big Data', 'Hadoop', 'Spark', 'Statistical Analysis'
  ],
  'Testing': [
    'Unit Testing', 'Integration Testing', 'E2E Testing', 'Jest', 'Mocha', 'Chai',
    'Cypress', 'Selenium', 'Puppeteer', 'JUnit', 'TestNG', 'PyTest', 'Test-Driven Development'
  ],
  'Security': [
    'Cybersecurity', 'Penetration Testing', 'OWASP', 'Authentication', 'Authorization',
    'Encryption', 'OAuth', 'JWT', 'HTTPS', 'Firewalls', 'Security Auditing'
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const query = searchParams.get('query')?.toLowerCase() || '';
    const includeAnalytics = searchParams.get('analytics') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    let skills: string[] = [];
    let categories: string[] = [];
    
    try {
      // Define technical skill categories
      categories = Object.keys(fallbackTechnicalSkills);
      
      // If category is specified, return only that category
      if (category && category in fallbackTechnicalSkills) {
        skills = [...fallbackTechnicalSkills[category]];
        
        if (query) {
          skills = skills.filter(skill => skill.toLowerCase().includes(query));
        }
      } else {
        // Otherwise return all categories
        for (const cat in fallbackTechnicalSkills) {
          if (fallbackTechnicalSkills.hasOwnProperty(cat)) {
            const catSkills = fallbackTechnicalSkills[cat];
            
            if (query) {
              skills = skills.concat(catSkills.filter(skill => skill.toLowerCase().includes(query)));
            } else {
              skills = skills.concat(catSkills);
            }
          }
        }
      }
      
      // Return the skills and categories
      return NextResponse.json({
        skills,
        categories,
        totalCount: skills.length
      });
    } catch (error) {
      console.error('Error fetching technical skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch technical skills' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in technical skills API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technical skills' },
      { status: 500 }
    );
  }
}
