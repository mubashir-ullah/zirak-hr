import mongoose, { Schema, Document } from 'mongoose';

export interface ISkillAnalytics extends Document {
  skillId: mongoose.Types.ObjectId;
  skillName: string;
  category: string;
  metrics: {
    jobPostings: number;
    applications: number;
    searches: number;
    profileViews: number;
    assessmentsTaken: number;
    completedAssessments: number;
    passedAssessments: number;
    failedAssessments: number;
    averageAssessmentScore: number;
    verifiedUsers: number;
    verificationsByAssessment: number;
    verificationsByEndorsement: number;
    verificationsByExperience: number;
  };
  timeSeries: {
    date: Date;
    jobPostings: number;
    applications: number;
    searches: number;
    assessmentsTaken: number;
    verifiedUsers: number;
  }[];
  marketInsights: {
    demandScore: number;
    growthRate: number;
    competitionLevel: number;
    salaryRange: {
      min: number;
      max: number;
      average: number;
      currency: string;
    };
    topLocations: {
      location: string;
      count: number;
    }[];
    relatedSkills: {
      skillName: string;
      coOccurrenceRate: number;
    }[];
  };
  assessmentInsights: {
    difficultyDistribution: {
      beginner: number;
      intermediate: number;
      advanced: number;
      expert: number;
    };
    averageTimeToComplete: number; // in seconds
    mostMissedQuestions: {
      questionText: string;
      failureRate: number;
    }[];
  };
  lastUpdated: Date;
  trackJobPosting: () => Promise<ISkillAnalytics>;
  trackApplication: () => Promise<ISkillAnalytics>;
  trackSearch: () => Promise<ISkillAnalytics>;
  trackProfileView: () => Promise<ISkillAnalytics>;
  trackAssessment: (score: number, passed: boolean, timeSpent: number, difficulty: string) => Promise<ISkillAnalytics>;
  trackVerification: (method: 'assessment' | 'endorsement' | 'experience') => Promise<ISkillAnalytics>;
  updateMarketInsights: () => Promise<void>;
}

const SkillAnalyticsSchema: Schema = new Schema({
  skillId: {
    type: Schema.Types.ObjectId,
    ref: 'TechnicalSkill',
    required: true
  },
  skillName: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  metrics: {
    jobPostings: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    completedAssessments: { type: Number, default: 0 },
    passedAssessments: { type: Number, default: 0 },
    failedAssessments: { type: Number, default: 0 },
    averageAssessmentScore: { type: Number, default: 0 },
    verifiedUsers: { type: Number, default: 0 },
    verificationsByAssessment: { type: Number, default: 0 },
    verificationsByEndorsement: { type: Number, default: 0 },
    verificationsByExperience: { type: Number, default: 0 }
  },
  timeSeries: [{
    date: { type: Date, required: true },
    jobPostings: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    searches: { type: Number, default: 0 },
    assessmentsTaken: { type: Number, default: 0 },
    verifiedUsers: { type: Number, default: 0 }
  }],
  marketInsights: {
    demandScore: { type: Number, default: 0, min: 0, max: 100 },
    growthRate: { type: Number, default: 0 },
    competitionLevel: { type: Number, default: 0, min: 0, max: 100 },
    salaryRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      currency: { type: String, default: 'EUR' }
    },
    topLocations: [{
      location: { type: String, required: true },
      count: { type: Number, default: 0 }
    }],
    relatedSkills: [{
      skillName: { type: String, required: true },
      coOccurrenceRate: { type: Number, default: 0, min: 0, max: 1 }
    }]
  },
  assessmentInsights: {
    difficultyDistribution: {
      beginner: { type: Number, default: 0 },
      intermediate: { type: Number, default: 0 },
      advanced: { type: Number, default: 0 },
      expert: { type: Number, default: 0 }
    },
    averageTimeToComplete: { type: Number, default: 0 }, // in seconds
    mostMissedQuestions: [{
      questionText: { type: String, required: true },
      failureRate: { type: Number, default: 0, min: 0, max: 1 }
    }]
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster queries
SkillAnalyticsSchema.index({ 'marketInsights.demandScore': -1 });
SkillAnalyticsSchema.index({ 'marketInsights.growthRate': -1 });
SkillAnalyticsSchema.index({ 'metrics.jobPostings': -1 });
SkillAnalyticsSchema.index({ 'metrics.searches': -1 });
SkillAnalyticsSchema.index({ 'metrics.verifiedUsers': -1 });
SkillAnalyticsSchema.index({ 'metrics.assessmentsTaken': -1 });

// Method to track a job posting that mentions this skill
SkillAnalyticsSchema.methods.trackJobPosting = async function() {
  this.metrics.jobPostings += 1;
  
  // Add to time series data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.timeSeries.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.jobPostings += 1;
  } else {
    this.timeSeries.push({
      date: today,
      jobPostings: 1,
      applications: 0,
      searches: 0,
      assessmentsTaken: 0,
      verifiedUsers: 0
    });
  }
  
  // Update market insights
  await this.updateMarketInsights();
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track a job application that mentions this skill
SkillAnalyticsSchema.methods.trackApplication = async function() {
  this.metrics.applications += 1;
  
  // Add to time series data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.timeSeries.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.applications += 1;
  } else {
    this.timeSeries.push({
      date: today,
      jobPostings: 0,
      applications: 1,
      searches: 0,
      assessmentsTaken: 0,
      verifiedUsers: 0
    });
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track a search for this skill
SkillAnalyticsSchema.methods.trackSearch = async function() {
  this.metrics.searches += 1;
  
  // Add to time series data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.timeSeries.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.searches += 1;
  } else {
    this.timeSeries.push({
      date: today,
      jobPostings: 0,
      applications: 0,
      searches: 1,
      assessmentsTaken: 0,
      verifiedUsers: 0
    });
  }
  
  // Update market insights
  await this.updateMarketInsights();
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track a profile view that has this skill
SkillAnalyticsSchema.methods.trackProfileView = async function() {
  this.metrics.profileViews += 1;
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track an assessment taken for this skill
SkillAnalyticsSchema.methods.trackAssessment = async function(
  score: number, 
  passed: boolean, 
  timeSpent: number = 0,
  difficulty: string = 'intermediate'
) {
  // Update assessment metrics
  this.metrics.assessmentsTaken += 1;
  this.metrics.completedAssessments += 1;
  
  if (passed) {
    this.metrics.passedAssessments += 1;
  } else {
    this.metrics.failedAssessments += 1;
  }
  
  // Update average score
  const totalScores = this.metrics.averageAssessmentScore * (this.metrics.completedAssessments - 1);
  this.metrics.averageAssessmentScore = (totalScores + score) / this.metrics.completedAssessments;
  
  // Update difficulty distribution
  if (difficulty === 'beginner' || difficulty === 'intermediate' || 
      difficulty === 'advanced' || difficulty === 'expert') {
    this.assessmentInsights.difficultyDistribution[difficulty] += 1;
  }
  
  // Update average time to complete
  if (timeSpent > 0) {
    const totalTime = this.assessmentInsights.averageTimeToComplete * (this.metrics.completedAssessments - 1);
    this.assessmentInsights.averageTimeToComplete = (totalTime + timeSpent) / this.metrics.completedAssessments;
  }
  
  // Add to time series data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.timeSeries.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.assessmentsTaken += 1;
  } else {
    this.timeSeries.push({
      date: today,
      jobPostings: 0,
      applications: 0,
      searches: 0,
      assessmentsTaken: 1,
      verifiedUsers: 0
    });
  }
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to track a skill verification
SkillAnalyticsSchema.methods.trackVerification = async function(
  method: 'assessment' | 'endorsement' | 'experience' = 'assessment'
) {
  // Update verification metrics
  this.metrics.verifiedUsers += 1;
  
  // Update verification method count
  if (method === 'assessment') {
    this.metrics.verificationsByAssessment += 1;
  } else if (method === 'endorsement') {
    this.metrics.verificationsByEndorsement += 1;
  } else if (method === 'experience') {
    this.metrics.verificationsByExperience += 1;
  }
  
  // Add to time series data
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayEntry = this.timeSeries.find(entry => 
    entry.date.getTime() === today.getTime()
  );
  
  if (todayEntry) {
    todayEntry.verifiedUsers += 1;
  } else {
    this.timeSeries.push({
      date: today,
      jobPostings: 0,
      applications: 0,
      searches: 0,
      assessmentsTaken: 0,
      verifiedUsers: 1
    });
  }
  
  // Update market insights since verification affects demand score
  await this.updateMarketInsights();
  
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update market insights based on current metrics
SkillAnalyticsSchema.methods.updateMarketInsights = async function() {
  // Calculate demand score based on job postings, searches, and verified users
  const jobPostingWeight = 0.5;
  const searchWeight = 0.3;
  const verifiedUsersWeight = 0.2;
  
  // Get the maximum values from the database for normalization
  const SkillAnalyticsModel = mongoose.model('SkillAnalytics');
  
  const maxStats = await SkillAnalyticsModel.aggregate([
    {
      $group: {
        _id: null,
        maxJobPostings: { $max: '$metrics.jobPostings' },
        maxSearches: { $max: '$metrics.searches' },
        maxVerifiedUsers: { $max: '$metrics.verifiedUsers' }
      }
    }
  ]);
  
  const maxJobPostings = maxStats.length > 0 && maxStats[0].maxJobPostings ? maxStats[0].maxJobPostings : 1;
  const maxSearches = maxStats.length > 0 && maxStats[0].maxSearches ? maxStats[0].maxSearches : 1;
  const maxVerifiedUsers = maxStats.length > 0 && maxStats[0].maxVerifiedUsers ? maxStats[0].maxVerifiedUsers : 1;
  
  // Normalize values between 0 and 100
  const normalizedJobPostings = (this.metrics.jobPostings / maxJobPostings) * 100;
  const normalizedSearches = (this.metrics.searches / maxSearches) * 100;
  const normalizedVerifiedUsers = (this.metrics.verifiedUsers / maxVerifiedUsers) * 100;
  
  // Calculate weighted demand score
  this.marketInsights.demandScore = 
    (normalizedJobPostings * jobPostingWeight) + 
    (normalizedSearches * searchWeight) + 
    (normalizedVerifiedUsers * verifiedUsersWeight);
  
  // Cap at 100
  this.marketInsights.demandScore = Math.min(100, this.marketInsights.demandScore);
  
  // Calculate growth rate based on time series data
  if (this.timeSeries.length >= 2) {
    // Sort by date
    const sortedTimeSeries = [...this.timeSeries].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Get the oldest and newest entries
    const oldest = sortedTimeSeries[0];
    const newest = sortedTimeSeries[sortedTimeSeries.length - 1];
    
    // Calculate days between
    const daysDiff = Math.max(1, (newest.date.getTime() - oldest.date.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate growth rate as percentage change per day
    const jobPostingsGrowth = (newest.jobPostings - oldest.jobPostings) / daysDiff;
    const searchesGrowth = (newest.searches - oldest.searches) / daysDiff;
    
    // Weighted growth rate
    this.marketInsights.growthRate = (jobPostingsGrowth * 0.7) + (searchesGrowth * 0.3);
  }
  
  // Calculate competition level based on verified users vs job postings
  if (this.metrics.jobPostings > 0) {
    this.marketInsights.competitionLevel = Math.min(100, (this.metrics.verifiedUsers / this.metrics.jobPostings) * 100);
  } else {
    this.marketInsights.competitionLevel = 0;
  }
};

// Static method to get trending skills
SkillAnalyticsSchema.statics.getTrendingSkills = async function(limit = 10) {
  return this.find()
    .sort({ 'metrics.searches': -1, 'metrics.jobPostings': -1 })
    .limit(limit)
    .lean();
};

// Static method to get fastest growing skills
SkillAnalyticsSchema.statics.getFastestGrowingSkills = async function(limit = 10) {
  return this.find()
    .sort({ 'marketInsights.growthRate': -1 })
    .limit(limit)
    .lean();
};

// Static method to get skills with low competition
SkillAnalyticsSchema.statics.getLowCompetitionSkills = async function(limit = 10) {
  return this.find({
    'marketInsights.demandScore': { $gt: 50 },
    'marketInsights.competitionLevel': { $lt: 50 }
  })
  .sort({ 'marketInsights.demandScore': -1 })
  .limit(limit)
  .lean();
};

// Static method to get skills by category with analytics
SkillAnalyticsSchema.statics.getSkillsByCategory = async function(category: string, limit = 20) {
  return this.find({ category })
    .sort({ 'marketInsights.demandScore': -1 })
    .limit(limit)
    .lean();
};

// Static method to get skills with highest verification rates
SkillAnalyticsSchema.statics.getHighestVerificationRateSkills = async function(limit = 10) {
  return this.find({
    'metrics.assessmentsTaken': { $gt: 10 } // Only consider skills with significant assessment data
  })
  .sort({ 
    'metrics.passedAssessments': -1,
    'metrics.verifiedUsers': -1 
  })
  .limit(limit)
  .lean();
};

// Check if model exists before creating a new one (for Next.js hot reloading)
const SkillAnalytics = mongoose.models.SkillAnalytics || 
  mongoose.model<ISkillAnalytics>('SkillAnalytics', SkillAnalyticsSchema);

export default SkillAnalytics;
