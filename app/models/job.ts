import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string; // Full-time, Part-time, Contract, etc.
  experienceLevel: string; // Entry, Mid, Senior
  germanRequired: string; // None, Basic, Fluent, etc.
  visaSponsorship: boolean;
  remoteOption: string; // Remote, Hybrid, On-site
  applicationDeadline: Date;
  postedBy: mongoose.Types.ObjectId;
  status: string; // Active, Closed, Draft
  applicants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    responsibilities: [{ type: String }],
    skills: [{ type: String }],
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'EUR' }
    },
    employmentType: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    germanRequired: { type: String, default: 'None' },
    visaSponsorship: { type: Boolean, default: false },
    remoteOption: { type: String, default: 'On-site' },
    applicationDeadline: { type: Date },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, default: 'Active' },
    applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create or get model
export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

// Helper functions
export async function findJobs(db: mongoose.Connection, query: any = {}, limit: number = 20, skip: number = 0) {
  await db.models.Job || db.model('Job', JobSchema);
  return await Job.find({ status: 'Active', ...query })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

export async function findJobById(db: mongoose.Connection, jobId: string) {
  await db.models.Job || db.model('Job', JobSchema);
  return await Job.findById(jobId);
}

export async function findJobsBySkills(db: mongoose.Connection, skills: string[], limit: number = 10) {
  await db.models.Job || db.model('Job', JobSchema);
  return await Job.find({ 
    status: 'Active',
    skills: { $in: skills }
  })
  .sort({ createdAt: -1 })
  .limit(limit);
}

export async function createJob(db: mongoose.Connection, jobData: Partial<IJob>) {
  await db.models.Job || db.model('Job', JobSchema);
  const job = new Job(jobData);
  return await job.save();
}

export async function updateJob(db: mongoose.Connection, jobId: string, jobData: Partial<IJob>) {
  await db.models.Job || db.model('Job', JobSchema);
  return await Job.findByIdAndUpdate(jobId, jobData, { new: true });
}

export async function applyToJob(db: mongoose.Connection, jobId: string, userId: string) {
  await db.models.Job || db.model('Job', JobSchema);
  return await Job.findByIdAndUpdate(
    jobId,
    { $addToSet: { applicants: userId } },
    { new: true }
  );
}
