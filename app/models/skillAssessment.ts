import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillAssessment extends Document {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  userId: mongoose.Types.ObjectId;
  assessmentType: 'quiz' | 'coding_challenge' | 'project' | 'interview';
  title: string;
  description: string;
  questions?: {
    id: string;
    text: string;
    options?: {
      id: string;
      text: string;
    }[];
    correctOptionId?: string;
    type: 'multiple_choice' | 'coding' | 'open_ended';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    points: number;
  }[];
  codingChallenge?: {
    title: string;
    description: string;
    requirements: string[];
    testCases: {
      input: string;
      expectedOutput: string;
    }[];
    timeLimit: number; // in minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  };
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  score?: number;
  passingScore: number;
  passed?: boolean;
  startTime?: Date;
  completionTime?: Date;
  timeLimit: number; // in minutes
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  completeAssessment: (userAnswers: any[], timeSpent: number) => Promise<{
    score: number;
    passed: boolean;
    feedback: string;
  }>;
  startAssessment: () => Promise<ISkillAssessment>;
  generateFeedback: () => string;
}

const SkillAssessmentSchema: Schema = new Schema({
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicalSkill',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assessmentType: {
    type: String,
    enum: ['quiz', 'coding_challenge', 'project', 'interview'],
    required: true
  },
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    options: [{
      id: { type: String, required: true },
      text: { type: String, required: true }
    }],
    correctOptionId: { type: String },
    type: {
      type: String,
      enum: ['multiple_choice', 'coding', 'open_ended'],
      required: true
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    points: { type: Number, default: 1 }
  }],
  codingChallenge: {
    title: { type: String },
    description: { type: String },
    requirements: [{ type: String }],
    testCases: [{
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true }
    }],
    timeLimit: { type: Number, default: 60 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'expired'],
    default: 'pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100,
    required: true
  },
  timeLimit: {
    type: Number,
    default: 15, // 15 minutes default
    required: true
  },
  passed: {
    type: Boolean
  },
  startTime: {
    type: Date
  },
  completionTime: {
    type: Date
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster queries
SkillAssessmentSchema.index({ skillId: 1, userId: 1 });
SkillAssessmentSchema.index({ userId: 1, status: 1 });
SkillAssessmentSchema.index({ skillName: 1 });

// Method to start an assessment
SkillAssessmentSchema.methods.startAssessment = async function() {
  if (this.status !== 'pending') {
    throw new Error('Assessment cannot be started because it is not in pending status');
  }
  
  this.status = 'in_progress';
  this.startTime = new Date();
  await this.save();
  return this;
};

// Method to complete an assessment and calculate score
SkillAssessmentSchema.methods.completeAssessment = async function(userAnswers: any[], timeSpent: number) {
  if (this.status !== 'in_progress' && this.status !== 'pending') {
    throw new Error('Assessment cannot be completed because it is not in progress');
  }
  
  // Calculate score based on assessment type
  let score = 0;
  let totalPoints = 0;
  let correctPoints = 0;
  
  if (this.assessmentType === 'quiz' && this.questions && this.questions.length > 0) {
    // Calculate quiz score with weighted points
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      totalPoints += question.points;
      
      // Find the user's answer for this question
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      
      if (userAnswer && userAnswer.optionId === question.correctOptionId) {
        correctPoints += question.points;
      }
    }
    
    score = totalPoints > 0 ? (correctPoints / totalPoints) * 100 : 0;
  } else if (this.assessmentType === 'coding_challenge' && userAnswers) {
    // For coding challenges, the score might be calculated differently
    // This is a simplified version
    score = userAnswers.reduce((acc, curr) => acc + curr.score, 0) / userAnswers.length;
  }
  
  this.score = Math.round(score);
  this.passed = this.score >= this.passingScore;
  this.status = 'completed';
  this.completionTime = new Date();
  
  // Generate detailed feedback
  this.feedback = this.generateFeedback();
  
  await this.save();
  
  return {
    score: this.score,
    passed: this.passed,
    feedback: this.feedback
  };
};

// Generate feedback based on performance
SkillAssessmentSchema.methods.generateFeedback = function() {
  if (!this.score) return '';
  
  let feedback = '';
  
  if (this.score >= 90) {
    feedback = `Excellent performance! You have demonstrated expert-level knowledge in ${this.skillName}. Your understanding of advanced concepts is impressive.`;
  } else if (this.score >= 80) {
    feedback = `Great job! You have strong advanced knowledge in ${this.skillName}. You've shown proficiency in most aspects of this skill.`;
  } else if (this.score >= 70) {
    feedback = `Good work! You have demonstrated solid intermediate knowledge of ${this.skillName}. You've passed the verification threshold.`;
  } else if (this.score >= 60) {
    feedback = `You have basic knowledge of ${this.skillName}, but didn't quite reach the verification threshold. Consider reviewing some intermediate concepts and trying again.`;
  } else if (this.score >= 40) {
    feedback = `You've shown some understanding of ${this.skillName}, but need more practice to reach proficiency. Focus on building your foundation and try again.`;
  } else {
    feedback = `You need more practice with ${this.skillName}. Consider starting with beginner tutorials and building a stronger foundation before attempting verification again.`;
  }
  
  // Add next steps based on performance
  if (this.passed) {
    feedback += ` Your skill has been verified and will be displayed on your profile, increasing your visibility to potential employers.`;
  } else {
    feedback += ` You can retake this assessment in 7 days. In the meantime, consider exploring learning resources to improve your knowledge.`;
  }
  
  return feedback;
};

// Static method to generate assessment for a skill
SkillAssessmentSchema.statics.generateAssessment = async function(
  skillId: mongoose.Types.ObjectId,
  skillName: string,
  userId: mongoose.Types.ObjectId,
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  type: 'quiz' | 'coding_challenge' = 'quiz'
) {
  // Set difficulty distribution based on user's proficiency level
  let questionDistribution;
  let timeLimit;
  let passingScore;
  let title;
  let description;
  
  switch (level) {
    case 'beginner':
      questionDistribution = {
        beginner: 0.7,
        intermediate: 0.3,
        advanced: 0,
        expert: 0
      };
      timeLimit = 10; // 10 minutes
      passingScore = 65;
      title = `${skillName} Fundamentals Assessment`;
      description = `This assessment tests your basic knowledge of ${skillName}. It focuses on fundamental concepts and beginner-level applications.`;
      break;
    case 'intermediate':
      questionDistribution = {
        beginner: 0.3,
        intermediate: 0.5,
        advanced: 0.2,
        expert: 0
      };
      timeLimit = 15; // 15 minutes
      passingScore = 70;
      title = `${skillName} Proficiency Assessment`;
      description = `This assessment evaluates your intermediate knowledge of ${skillName}. It covers both fundamentals and more advanced concepts.`;
      break;
    case 'advanced':
      questionDistribution = {
        beginner: 0.1,
        intermediate: 0.3,
        advanced: 0.5,
        expert: 0.1
      };
      timeLimit = 20; // 20 minutes
      passingScore = 75;
      title = `${skillName} Advanced Assessment`;
      description = `This assessment challenges your advanced knowledge of ${skillName}. It includes complex scenarios and specialized topics.`;
      break;
    case 'expert':
      questionDistribution = {
        beginner: 0,
        intermediate: 0.1,
        advanced: 0.4,
        expert: 0.5
      };
      timeLimit = 25; // 25 minutes
      passingScore = 80;
      title = `${skillName} Expert Assessment`;
      description = `This expert-level assessment tests your mastery of ${skillName}. It covers advanced topics, best practices, and complex problem-solving.`;
      break;
    default:
      questionDistribution = {
        beginner: 0.3,
        intermediate: 0.5,
        advanced: 0.2,
        expert: 0
      };
      timeLimit = 15;
      passingScore = 70;
      title = `${skillName} Assessment`;
      description = `This assessment evaluates your knowledge of ${skillName}.`;
  }
  
  // Create assessment based on type
  if (type === 'quiz') {
    const questions = await this.generateQuizQuestions(skillName, questionDistribution);
    
    return this.create({
      skillId,
      skillName,
      userId,
      assessmentType: 'quiz',
      title,
      description,
      questions,
      status: 'pending',
      passingScore,
      timeLimit
    });
  } else if (type === 'coding_challenge') {
    const challenge = await this.generateCodingChallenge(skillName, level);
    
    return this.create({
      skillId,
      skillName,
      userId,
      assessmentType: 'coding_challenge',
      title: `${skillName} Coding Challenge`,
      description: `Demonstrate your ${skillName} skills by completing this coding challenge.`,
      codingChallenge: challenge,
      status: 'pending',
      passingScore,
      timeLimit: challenge.timeLimit
    });
  }
};

// Helper function to generate quiz questions (would typically call an AI service)
SkillAssessmentSchema.statics.generateQuizQuestions = async function(
  skillName: string, 
  distribution: { beginner: number; intermediate: number; advanced: number; expert: number }
) {
  // In a real implementation, this would call an AI service or a database of questions
  // For this example, we'll create some placeholder questions
  
  const totalQuestions = 10;
  const questions = [];
  
  // Calculate how many questions of each difficulty to include
  const beginnerCount = Math.round(totalQuestions * distribution.beginner);
  const intermediateCount = Math.round(totalQuestions * distribution.intermediate);
  const advancedCount = Math.round(totalQuestions * distribution.advanced);
  const expertCount = totalQuestions - beginnerCount - intermediateCount - advancedCount;
  
  // Generate questions for each difficulty level
  for (let i = 0; i < beginnerCount; i++) {
    questions.push(createSampleQuestion(skillName, 'beginner', i, 1));
  }
  
  for (let i = 0; i < intermediateCount; i++) {
    questions.push(createSampleQuestion(skillName, 'intermediate', i + beginnerCount, 2));
  }
  
  for (let i = 0; i < advancedCount; i++) {
    questions.push(createSampleQuestion(skillName, 'advanced', i + beginnerCount + intermediateCount, 3));
  }
  
  for (let i = 0; i < expertCount; i++) {
    questions.push(createSampleQuestion(skillName, 'expert', i + beginnerCount + intermediateCount + advancedCount, 4));
  }
  
  return questions;
};

// Helper function to create a sample question
function createSampleQuestion(
  skillName: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  index: number,
  points: number
) {
  const id = `q-${difficulty}-${index}`;
  
  // Generate options
  const options = [
    { id: `${id}-opt-0`, text: `Option 1 for ${skillName} ${difficulty} question` },
    { id: `${id}-opt-1`, text: `Option 2 for ${skillName} ${difficulty} question` },
    { id: `${id}-opt-2`, text: `Option 3 for ${skillName} ${difficulty} question` },
    { id: `${id}-opt-3`, text: `Option 4 for ${skillName} ${difficulty} question` }
  ];
  
  // Randomly select a correct answer
  const correctOptionId = options[Math.floor(Math.random() * options.length)].id;
  
  return {
    id,
    text: `Sample ${difficulty} level question about ${skillName} (${index + 1})`,
    options,
    correctOptionId,
    type: 'multiple_choice',
    difficulty,
    points
  };
}

// Helper function to generate coding challenges (would typically call an AI service)
SkillAssessmentSchema.statics.generateCodingChallenge = async function(
  skillName: string, 
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
) {
  // In a real implementation, this would call an AI service or a database of challenges
  // For this example, we'll create a placeholder challenge
  
  let timeLimit;
  let requirements;
  
  switch (level) {
    case 'beginner':
      timeLimit = 30;
      requirements = ['Basic functionality', 'Simple error handling'];
      break;
    case 'intermediate':
      timeLimit = 45;
      requirements = ['Complete functionality', 'Error handling', 'Basic optimization'];
      break;
    case 'advanced':
      timeLimit = 60;
      requirements = ['Complete functionality', 'Comprehensive error handling', 'Optimization', 'Clean code'];
      break;
    case 'expert':
      timeLimit = 90;
      requirements = ['Complete functionality', 'Comprehensive error handling', 'Advanced optimization', 'Clean code', 'Scalability considerations'];
      break;
    default:
      timeLimit = 45;
      requirements = ['Complete functionality', 'Error handling'];
  }
  
  return {
    title: `${skillName} Coding Challenge (${level})`,
    description: `Demonstrate your ${skillName} skills by completing this ${level} level coding challenge.`,
    requirements,
    testCases: [
      { input: 'Sample input 1', expectedOutput: 'Sample output 1' },
      { input: 'Sample input 2', expectedOutput: 'Sample output 2' },
      { input: 'Sample input 3', expectedOutput: 'Sample output 3' }
    ],
    timeLimit,
    difficulty: level
  };
};

// Check if model exists before creating a new one (for Next.js hot reloading)
const SkillAssessment = mongoose.models.SkillAssessment || 
  mongoose.model<ISkillAssessment>('SkillAssessment', SkillAssessmentSchema);

export default SkillAssessment;
