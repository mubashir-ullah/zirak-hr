import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import TechnicalSkill from '@/app/models/technicalSkill';
import SkillAnalytics from '@/app/models/skillAnalytics';

// Fallback technical skills data in case database is not available
const fallbackTechnicalSkills = {
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'Go', 'Rust', 'PHP', 'Ruby',
    'Swift', 'Kotlin', 'Scala', 'R', 'Perl', 'Haskell', 'Clojure', 'Elixir', 'Dart'
  ],
  frontend: [
    'React', 'Angular', 'Vue.js', 'Next.js', 'Svelte', 'Redux', 'HTML5', 'CSS3', 'SASS/SCSS',
    'Tailwind CSS', 'Material-UI', 'Bootstrap', 'Webpack', 'Vite', 'jQuery', 'Responsive Design',
    'Web Components', 'PWA', 'Storybook', 'Figma'
  ],
  backend: [
    'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP.NET Core',
    'Ruby on Rails', 'FastAPI', 'NestJS', 'GraphQL', 'REST API', 'gRPC', 'WebSockets',
    'Microservices', 'Serverless', 'Socket.io'
  ],
  database: [
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB', 'Cassandra',
    'SQLite', 'Oracle', 'MS SQL Server', 'Firebase', 'Supabase', 'Prisma', 'Mongoose', 'Sequelize',
    'TypeORM', 'Knex.js'
  ],
  devops: [
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions',
    'GitLab CI', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'ELK Stack', 'Nginx',
    'Apache', 'Linux', 'Bash/Shell', 'Networking', 'Security'
  ],
  testing: [
    'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'Testing Library', 'JUnit', 'PyTest',
    'Jasmine', 'Karma', 'Enzyme', 'Postman', 'Swagger', 'TDD', 'BDD', 'E2E Testing',
    'Unit Testing', 'Integration Testing'
  ],
  mobile: [
    'React Native', 'Flutter', 'iOS', 'Android', 'Swift UI', 'Kotlin Multiplatform',
    'Xamarin', 'Ionic', 'Capacitor', 'Mobile UI/UX', 'App Store Optimization',
    'Push Notifications', 'Mobile Security'
  ],
  ai_ml: [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP',
    'Computer Vision', 'Data Science', 'Big Data', 'Pandas', 'NumPy', 'Jupyter',
    'OpenAI API', 'LLMs', 'Generative AI', 'Hugging Face', 'Neural Networks'
  ],
  blockchain: [
    'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3.js', 'Ethers.js',
    'Hardhat', 'Truffle', 'DeFi', 'NFTs', 'Cryptocurrency', 'Consensus Algorithms'
  ],
  ar_vr: [
    'AR/VR', 'Unity', 'Unreal Engine', 'WebXR', 'Three.js', 'A-Frame', 'Babylon.js',
    '3D Modeling', 'Spatial Computing', 'WebGL'
  ],
  iot: [
    'IoT', 'Embedded Systems', 'Arduino', 'Raspberry Pi', 'MQTT', 'Sensors',
    'Edge Computing', 'Firmware Development', 'Hardware Prototyping'
  ],
  cybersecurity: [
    'Cybersecurity', 'Penetration Testing', 'Ethical Hacking', 'Security Auditing',
    'Encryption', 'Authentication', 'Authorization', 'OAuth', 'JWT', 'OWASP',
    'Vulnerability Assessment', 'Network Security'
  ],
  project_management: [
    'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Git', 'GitHub', 'GitLab',
    'Bitbucket', 'Version Control', 'Code Review', 'Technical Documentation'
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const includeAnalytics = searchParams.get('analytics') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Connect to the database
    const { db } = await connectToDatabase();
    
    let skills = [];
    let categories = [];
    
    try {
      // Get categories from the database
      categories = await db.collection('technicalskills').distinct('category');
      
      // Build the query
      let query_filter: any = {};
      
      if (category) {
        query_filter.category = category;
      }
      
      if (query) {
        query_filter.name = { $regex: query, $options: 'i' };
      }
      
      // Fetch skills from the database
      if (includeAnalytics) {
        // Join with analytics data
        const pipeline = [
          { $match: query_filter },
          { $sort: { popularity: -1 } },
          { $limit: limit },
          {
            $lookup: {
              from: 'skillanalytics',
              localField: '_id',
              foreignField: 'skillId',
              as: 'analytics'
            }
          },
          {
            $project: {
              _id: 1,
              name: 1,
              category: 1,
              description: 1,
              popularity: 1,
              demandTrend: 1,
              relatedSkills: 1,
              analytics: { $arrayElemAt: ['$analytics', 0] }
            }
          }
        ];
        
        skills = await db.collection('technicalskills').aggregate(pipeline).toArray();
        
        // Track search in analytics
        if (query) {
          // For each skill in the results, track that it was searched
          for (const skill of skills) {
            try {
              const analyticsDoc = await SkillAnalytics.findOne({ skillId: skill._id });
              if (analyticsDoc) {
                await analyticsDoc.trackSearch();
              }
            } catch (error) {
              console.error(`Error tracking search for skill ${skill.name}:`, error);
            }
          }
        }
      } else {
        // Simple query without analytics
        skills = await db.collection('technicalskills')
          .find(query_filter)
          .sort({ popularity: -1 })
          .limit(limit)
          .toArray();
      }
      
      // If no skills found in the database, use fallback data
      if (skills.length === 0) {
        let fallbackSkills: string[] = [];
        
        if (category && category in fallbackTechnicalSkills) {
          fallbackSkills = fallbackTechnicalSkills[category as keyof typeof fallbackTechnicalSkills];
        } else {
          fallbackSkills = Object.values(fallbackTechnicalSkills).flat();
        }
        
        if (query) {
          fallbackSkills = fallbackSkills.filter(skill => 
            skill.toLowerCase().includes(query)
          );
        }
        
        // Convert to the same format as database results
        skills = fallbackSkills.map(name => ({
          name,
          category: Object.entries(fallbackTechnicalSkills).find(([_, skills]) => 
            (skills as string[]).includes(name)
          )?.[0] || 'other'
        }));
        
        // Use fallback categories if none found in database
        if (categories.length === 0) {
          categories = Object.keys(fallbackTechnicalSkills);
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Fallback to hardcoded data if database query fails
      let fallbackSkills: string[] = [];
      
      if (category && category in fallbackTechnicalSkills) {
        fallbackSkills = fallbackTechnicalSkills[category as keyof typeof fallbackTechnicalSkills];
      } else {
        fallbackSkills = Object.values(fallbackTechnicalSkills).flat();
      }
      
      if (query) {
        fallbackSkills = fallbackSkills.filter(skill => 
          skill.toLowerCase().includes(query)
        );
      }
      
      // Convert to the same format as database results
      skills = fallbackSkills.map(name => ({
        name,
        category: Object.entries(fallbackTechnicalSkills).find(([_, skills]) => 
          (skills as string[]).includes(name)
        )?.[0] || 'other'
      }));
      
      categories = Object.keys(fallbackTechnicalSkills);
    }
    
    // Return the skills and categories
    return NextResponse.json({
      skills,
      categories,
      totalCount: skills.length
    });
    
  } catch (error) {
    console.error('Error in technical skills API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch technical skills' },
      { status: 500 }
    );
  }
}
