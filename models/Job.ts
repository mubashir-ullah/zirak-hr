import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  jobType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  experienceLevel: 'entry' | 'junior' | 'mid-level' | 'senior' | 'lead';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  remote: boolean;
  applicationDeadline: Date;
  postedBy: mongoose.Types.ObjectId;
  postedDate: Date;
  status: 'active' | 'filled' | 'expired' | 'draft';
  applicationCount: number;
  viewCount: number;
  industry: string;
  companySize: string;
  benefits: string[];
  educationLevel: string;
  germanLevel: string;
  visaSponsorship: boolean;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String, index: true }],
    jobType: { 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      required: true,
      index: true
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'junior', 'mid-level', 'senior', 'lead'],
      required: true,
      index: true
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'EUR' }
    },
    remote: { type: Boolean, default: false, index: true },
    applicationDeadline: { type: Date, required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postedDate: { type: Date, default: Date.now, index: true },
    status: { 
      type: String, 
      enum: ['active', 'filled', 'expired', 'draft'],
      default: 'active',
      index: true
    },
    applicationCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    industry: { type: String, index: true },
    companySize: { type: String },
    benefits: [{ type: String }],
    educationLevel: { type: String },
    germanLevel: { type: String, index: true },
    visaSponsorship: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Create text indexes for search
JobSchema.index({ 
  title: 'text', 
  description: 'text', 
  company: 'text',
  location: 'text',
  industry: 'text'
});

// Check if the model already exists to prevent overwriting
export default mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
