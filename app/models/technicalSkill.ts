import mongoose, { Schema, Document } from 'mongoose';

export interface ITechnicalSkill extends Document {
  name: string;
  category: string;
  description?: string;
  popularity: number;
  demandTrend: 'rising' | 'stable' | 'declining';
  relatedSkills: string[];
  lastUpdated: Date;
}

const TechnicalSkillSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'programming',
      'frontend',
      'backend',
      'database',
      'devops',
      'testing',
      'mobile',
      'ai_ml',
      'blockchain',
      'ar_vr',
      'iot',
      'cybersecurity',
      'project_management'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  popularity: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  demandTrend: {
    type: String,
    enum: ['rising', 'stable', 'declining'],
    default: 'stable'
  },
  relatedSkills: [{
    type: String,
    ref: 'TechnicalSkill'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes for faster queries
TechnicalSkillSchema.index({ name: 1 });
TechnicalSkillSchema.index({ category: 1 });
TechnicalSkillSchema.index({ popularity: -1 });
TechnicalSkillSchema.index({ demandTrend: 1 });

// Add a method to update popularity based on usage
TechnicalSkillSchema.methods.incrementPopularity = async function(amount = 1) {
  this.popularity = Math.min(100, this.popularity + amount);
  await this.save();
  return this;
};

// Add a static method to get trending skills
TechnicalSkillSchema.statics.getTrendingSkills = async function(limit = 10) {
  return this.find({ demandTrend: 'rising' })
    .sort({ popularity: -1 })
    .limit(limit);
};

// Add a static method to get skills by category
TechnicalSkillSchema.statics.getSkillsByCategory = async function(category: string) {
  return this.find({ category })
    .sort({ popularity: -1 });
};

// Check if model exists before creating a new one (for Next.js hot reloading)
const TechnicalSkill = mongoose.models.TechnicalSkill || 
  mongoose.model<ITechnicalSkill>('TechnicalSkill', TechnicalSkillSchema);

export default TechnicalSkill;
