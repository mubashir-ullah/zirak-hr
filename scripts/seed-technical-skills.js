/**
 * Seed script for technical skills and analytics data
 * 
 * This script populates the MongoDB database with:
 * 1. Technical skills categorized by domain
 * 2. Initial analytics data for each skill
 * 
 * Run with: node scripts/seed-technical-skills.js
 */

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Technical skills data categorized by domain
const technicalSkillsData = {
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

// Skill descriptions for some popular skills
const skillDescriptions = {
  'JavaScript': 'A high-level, interpreted programming language that conforms to the ECMAScript specification.',
  'TypeScript': 'A strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.',
  'Python': 'An interpreted, high-level, general-purpose programming language with dynamic semantics.',
  'React': 'A JavaScript library for building user interfaces, particularly single-page applications.',
  'Angular': 'A TypeScript-based open-source web application framework led by the Angular Team at Google.',
  'Node.js': 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine for building scalable network applications.',
  'MongoDB': 'A cross-platform document-oriented NoSQL database program that uses JSON-like documents.',
  'AWS': 'Amazon Web Services, a comprehensive, evolving cloud computing platform provided by Amazon.',
  'Docker': 'A set of platform as a service products that use OS-level virtualization to deliver software in containers.',
  'Machine Learning': 'A field of AI that uses statistical techniques to give computer systems the ability to learn from data.'
};

// Generate demand trends for skills
function generateDemandTrend() {
  const trends = ['rising', 'stable', 'declining'];
  const weights = [0.6, 0.3, 0.1]; // 60% rising, 30% stable, 10% declining
  
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return trends[i];
    }
  }
  
  return trends[0]; // Default to rising
}

// Generate related skills
function generateRelatedSkills(skillName, category, allSkills) {
  // Get skills from the same category, excluding the current skill
  const sameCategory = technicalSkillsData[category].filter(s => s !== skillName);
  
  // Randomly select 3-5 related skills
  const count = Math.floor(Math.random() * 3) + 3; // 3-5 related skills
  const relatedSkills = [];
  
  for (let i = 0; i < count && i < sameCategory.length; i++) {
    const randomIndex = Math.floor(Math.random() * sameCategory.length);
    const skill = sameCategory[randomIndex];
    
    // Avoid duplicates
    if (!relatedSkills.includes(skill)) {
      relatedSkills.push(skill);
    }
  }
  
  return relatedSkills;
}

// Generate analytics data for a skill
function generateAnalyticsData(skillId, skillName, category) {
  // Base popularity score (0-100)
  let popularity = Math.floor(Math.random() * 100);
  
  // Adjust popularity based on common skills
  if (['JavaScript', 'Python', 'Java', 'React', 'AWS', 'Docker'].includes(skillName)) {
    popularity = Math.min(100, popularity + 30); // Boost popular skills
  }
  
  // Generate time series data for the last 30 days
  const timeSeries = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    // Generate random metrics with some trend
    const baseJobPostings = Math.floor(Math.random() * 10) + 1;
    const trend = (30 - i) / 30; // Increasing trend over time
    const trendFactor = 1 + (trend * 0.5); // Up to 50% increase
    
    timeSeries.push({
      date,
      jobPostings: Math.floor(baseJobPostings * trendFactor),
      applications: Math.floor(Math.random() * 20) + 1,
      searches: Math.floor(Math.random() * 30) + 5
    });
  }
  
  // Calculate metrics based on time series
  const jobPostings = timeSeries.reduce((sum, entry) => sum + entry.jobPostings, 0);
  const applications = timeSeries.reduce((sum, entry) => sum + entry.applications, 0);
  const searches = timeSeries.reduce((sum, entry) => sum + entry.searches, 0);
  
  // Generate market insights
  const demandScore = Math.min(100, Math.floor(popularity * 0.7 + Math.random() * 30));
  
  // Calculate growth rate (percentage change over last 30 days)
  const first15Days = timeSeries.slice(0, 15);
  const last15Days = timeSeries.slice(15);
  
  const first15Sum = first15Days.reduce((sum, entry) => sum + entry.jobPostings, 0);
  const last15Sum = last15Days.reduce((sum, entry) => sum + entry.jobPostings, 0);
  
  let growthRate = 0;
  if (first15Sum > 0) {
    growthRate = ((last15Sum - first15Sum) / first15Sum) * 100;
  }
  
  // Generate competition level (0-100)
  const competitionLevel = Math.floor(Math.random() * 100);
  
  // Generate salary range
  const baseSalary = 50000 + Math.floor(Math.random() * 50000);
  const salaryRange = {
    min: baseSalary,
    max: baseSalary + 20000 + Math.floor(Math.random() * 30000),
    average: baseSalary + 10000 + Math.floor(Math.random() * 15000),
    currency: 'EUR'
  };
  
  // Generate top locations
  const locations = ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart', 'Düsseldorf'];
  const topLocations = [];
  
  // Select 3-5 random locations
  const locationCount = Math.floor(Math.random() * 3) + 3;
  for (let i = 0; i < locationCount; i++) {
    const randomIndex = Math.floor(Math.random() * locations.length);
    const location = locations[randomIndex];
    
    // Avoid duplicates
    if (!topLocations.find(l => l.location === location)) {
      topLocations.push({
        location,
        count: Math.floor(Math.random() * 100) + 10
      });
    }
  }
  
  // Sort by count
  topLocations.sort((a, b) => b.count - a.count);
  
  return {
    skillId,
    skillName,
    category,
    metrics: {
      jobPostings,
      applications,
      searches,
      profileViews: Math.floor(Math.random() * 200) + 50,
      assessmentsTaken: Math.floor(Math.random() * 50) + 10,
      averageAssessmentScore: Math.floor(Math.random() * 30) + 70, // 70-100
      verifiedUsers: Math.floor(Math.random() * 30) + 5
    },
    timeSeries,
    marketInsights: {
      demandScore,
      growthRate,
      competitionLevel,
      salaryRange,
      topLocations,
      relatedSkills: [] // Will be populated after all skills are created
    },
    lastUpdated: new Date()
  };
}

// Main function to seed the database
async function seedDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    if (!collectionNames.includes('technicalskills')) {
      await db.createCollection('technicalskills');
      console.log('Created technicalskills collection');
    }
    
    if (!collectionNames.includes('skillanalytics')) {
      await db.createCollection('skillanalytics');
      console.log('Created skillanalytics collection');
    }
    
    // Clear existing data
    await db.collection('technicalskills').deleteMany({});
    await db.collection('skillanalytics').deleteMany({});
    console.log('Cleared existing data');
    
    // Prepare skills data
    const skillsToInsert = [];
    const analyticsToInsert = [];
    const skillMap = new Map(); // Map skill names to their IDs
    
    // Process each category
    for (const [category, skills] of Object.entries(technicalSkillsData)) {
      for (const skillName of skills) {
        const skillId = new ObjectId();
        
        // Create skill document
        const skill = {
          _id: skillId,
          name: skillName,
          category,
          description: skillDescriptions[skillName] || `${skillName} is a technical skill in the ${category} domain.`,
          popularity: Math.floor(Math.random() * 100),
          demandTrend: generateDemandTrend(),
          relatedSkills: [], // Will be populated after all skills are created
          lastUpdated: new Date()
        };
        
        skillsToInsert.push(skill);
        skillMap.set(skillName, skillId);
        
        // Create analytics document
        const analytics = generateAnalyticsData(skillId, skillName, category);
        analyticsToInsert.push(analytics);
      }
    }
    
    // Populate related skills
    for (const skill of skillsToInsert) {
      const relatedSkillNames = generateRelatedSkills(skill.name, skill.category, skillsToInsert);
      skill.relatedSkills = relatedSkillNames;
      
      // Find the corresponding analytics document
      const analytics = analyticsToInsert.find(a => a.skillId.toString() === skill._id.toString());
      
      if (analytics) {
        // Add related skills to analytics
        analytics.marketInsights.relatedSkills = relatedSkillNames.map(name => ({
          skillName: name,
          coOccurrenceRate: Math.random().toFixed(2)
        }));
      }
    }
    
    // Insert data into collections
    if (skillsToInsert.length > 0) {
      await db.collection('technicalskills').insertMany(skillsToInsert);
      console.log(`Inserted ${skillsToInsert.length} technical skills`);
    }
    
    if (analyticsToInsert.length > 0) {
      await db.collection('skillanalytics').insertMany(analyticsToInsert);
      console.log(`Inserted ${analyticsToInsert.length} skill analytics records`);
    }
    
    console.log('Database seeding completed successfully');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase().catch(console.error);
