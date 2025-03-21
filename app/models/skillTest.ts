import mongoose, { Schema, Document, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

// Interface for a test question
export interface IQuestion {
  _id?: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index of the correct option
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Interface for a skill test
export interface ISkillTest {
  _id?: string;
  title: string;
  description: string;
  skillCategory: string;
  questions: IQuestion[];
  timeLimit: number; // in minutes
  passingScore: number; // percentage required to pass
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

// Interface for a user's test attempt
export interface ITestAttempt {
  _id?: string;
  userId: string | ObjectId;
  testId: string | ObjectId;
  score: number;
  passed: boolean;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  startTime: Date;
  endTime: Date;
  completionTime: number; // in seconds
  createdAt: Date;
}

// Interface for a user's verified skills
export interface IVerifiedSkill {
  _id?: string;
  userId: string | ObjectId;
  skill: string;
  testId: string | ObjectId;
  score: number;
  verifiedAt: Date;
  expiresAt?: Date; // Optional expiration date
}

// Mongoose schema for questions
const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

// Mongoose schema for skill tests
const SkillTestSchema = new Schema<ISkillTest>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skillCategory: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  timeLimit: { type: Number, required: true, default: 30 },
  passingScore: { type: Number, required: true, default: 70 },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'intermediate' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Mongoose schema for test attempts
const TestAttemptSchema = new Schema<ITestAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'SkillTest', required: true },
  score: { type: Number, required: true },
  passed: { type: Boolean, required: true, default: false },
  answers: [{
    questionId: { type: String, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  completionTime: { type: Number, required: true }, // in seconds
  createdAt: { type: Date, default: Date.now }
});

// Mongoose schema for verified skills
const VerifiedSkillSchema = new Schema<IVerifiedSkill>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'SkillTest', required: true },
  score: { type: Number, required: true },
  verifiedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date } // Optional expiration date
});

// Helper functions for skill tests
export async function createSkillTest(db: mongoose.Connection, testData: Partial<ISkillTest>) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  return await SkillTest.create(testData);
}

export async function findSkillTestById(db: mongoose.Connection, testId: string) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  return await SkillTest.findById(testId);
}

export async function findSkillTests(db: mongoose.Connection, filter = {}, limit = 20) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  return await SkillTest.find(filter).limit(limit);
}

export async function findSkillTestsByCategory(db: mongoose.Connection, category: string, limit = 20) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  return await SkillTest.find({ skillCategory: category }).limit(limit);
}

export async function updateSkillTest(db: mongoose.Connection, testId: string, updateData: Partial<ISkillTest>) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  return await SkillTest.findByIdAndUpdate(testId, updateData, { new: true });
}

// Helper functions for test attempts
export async function createTestAttempt(db: mongoose.Connection, attemptData: Partial<ITestAttempt>) {
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  return await TestAttempt.create(attemptData);
}

export async function findTestAttemptById(db: mongoose.Connection, attemptId: string) {
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  return await TestAttempt.findById(attemptId);
}

export async function findUserTestAttempts(db: mongoose.Connection, userId: string) {
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  return await TestAttempt.find({ 
    userId: new mongoose.Types.ObjectId(userId) 
  }).sort({ createdAt: -1 });
}

export async function findUserTestAttemptByTestId(db: mongoose.Connection, userId: string, testId: string) {
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  return await TestAttempt.findOne({ userId, testId }).sort({ createdAt: -1 });
}

export async function findUserCompletedTests(db: mongoose.Connection, userId: string) {
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  return await TestAttempt.find({ userId, endTime: { $exists: true } })
    .sort({ createdAt: -1 })
    .populate('testId');
}

// Helper functions for verified skills
export async function createVerifiedSkill(db: mongoose.Connection, skillData: Partial<IVerifiedSkill>) {
  const VerifiedSkill = db.models.VerifiedSkill || db.model('VerifiedSkill', VerifiedSkillSchema);
  return await VerifiedSkill.create(skillData);
}

export async function findUserVerifiedSkills(db: mongoose.Connection, userId: string) {
  const VerifiedSkill = db.models.VerifiedSkill || db.model('VerifiedSkill', VerifiedSkillSchema);
  const verifiedSkills = await VerifiedSkill.find({ 
    userId: new mongoose.Types.ObjectId(userId) 
  });
  
  // Return just the skill names
  return verifiedSkills.map(vs => vs.skill);
}

export async function isSkillVerified(db: mongoose.Connection, userId: string, skill: string) {
  const VerifiedSkill = db.models.VerifiedSkill || db.model('VerifiedSkill', VerifiedSkillSchema);
  const verifiedSkill = await VerifiedSkill.findOne({ 
    userId, 
    skill,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  return !!verifiedSkill;
}

// Function to recommend skill tests based on user profile and skills
export async function recommendSkillTests(db: mongoose.Connection, userId: string, userSkills: string[], limit = 5) {
  const SkillTest = db.models.SkillTest || db.model('SkillTest', SkillTestSchema);
  const TestAttempt = db.models.TestAttempt || db.model('TestAttempt', TestAttemptSchema);
  
  // Get tests the user has already completed
  const completedTests = await TestAttempt.find({ userId }).distinct('testId');
  const completedTestIds = completedTests.map(id => id.toString());
  
  // Find tests that match user skills and haven't been completed
  const matchingTests = await SkillTest.find({
    skillCategory: { $in: userSkills },
    _id: { $nin: completedTestIds }
  }).limit(limit);
  
  // If we don't have enough matching tests, add some popular tests
  if (matchingTests.length < limit) {
    const additionalTests = await SkillTest.find({
      _id: { $nin: [...completedTestIds, ...matchingTests.map(t => t._id)] }
    }).limit(limit - matchingTests.length);
    
    return [...matchingTests, ...additionalTests];
  }
  
  return matchingTests;
}

// Export the models
export const models = {
  SkillTest: SkillTestSchema,
  TestAttempt: TestAttemptSchema,
  VerifiedSkill: VerifiedSkillSchema
};
