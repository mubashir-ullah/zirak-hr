import mongoose, { Schema, Document } from 'mongoose';
import { randomBytes } from 'crypto';

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  verifiedSkills?: string[];
  education: {
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    url: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  languages: {
    name: string;
    proficiency: string;
  }[];
  pdfUrl: string;
  isPublic: boolean;
  shareableLink: string;
  shareExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    summary: { type: String },
    skills: [{ type: String }],
    verifiedSkills: [{ type: String }],
    education: [{
      degree: { type: String },
      institution: { type: String },
      location: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      description: { type: String }
    }],
    experience: [{
      title: { type: String },
      company: { type: String },
      location: { type: String },
      startDate: { type: String },
      endDate: { type: String },
      description: { type: String }
    }],
    projects: [{
      name: { type: String },
      description: { type: String },
      technologies: [{ type: String }],
      url: { type: String }
    }],
    certifications: [{
      name: { type: String },
      issuer: { type: String },
      date: { type: String }
    }],
    languages: [{
      name: { type: String },
      proficiency: { type: String }
    }],
    pdfUrl: { type: String },
    isPublic: { type: Boolean, default: false },
    shareableLink: { 
      type: String, 
      default: () => randomBytes(16).toString('hex') 
    },
    shareExpiry: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Create or get model
export const Resume = mongoose.models.Resume || mongoose.model<IResume>('Resume', ResumeSchema);

// Helper functions
export async function findResumeByUserId(db: mongoose.Connection, userId: string) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  return await Resume.findOne({ userId });
}

export async function findResumeByShareableLink(db: mongoose.Connection, shareableLink: string) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  return await Resume.findOne({ 
    shareableLink,
    isPublic: true,
    shareExpiry: { $gt: new Date() }
  });
}

export async function createResume(db: mongoose.Connection, resumeData: Partial<IResume>) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  const resume = new Resume(resumeData);
  return await resume.save();
}

export async function updateResume(db: mongoose.Connection, userId: string, resumeData: Partial<IResume>) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  return await Resume.findOneAndUpdate(
    { userId },
    { ...resumeData, updatedAt: new Date() },
    { new: true }
  );
}

export async function updateResumeSharing(db: mongoose.Connection, userId: string, isPublic: boolean, expiryDays: number = 30) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  
  const shareExpiry = new Date();
  shareExpiry.setDate(shareExpiry.getDate() + expiryDays);
  
  return await Resume.findOneAndUpdate(
    { userId },
    { 
      isPublic,
      shareExpiry,
      shareableLink: randomBytes(16).toString('hex'),
      updatedAt: new Date()
    },
    { new: true }
  );
}

export async function updateResumeVerifiedSkills(db: mongoose.Connection, userId: string, skill: string) {
  const Resume = db.models.Resume || db.model('Resume', ResumeSchema);
  
  // First ensure the skill exists in the skills array
  await Resume.updateOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $addToSet: { skills: skill } }
  );
  
  // Then add it to verified skills
  return await Resume.updateOne(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $addToSet: { verifiedSkills: skill } }
  );
}

export async function findResumeByUserIdForJobApplication(db: mongoose.Connection, userId: string) {
  const Resume = db.models.Resume || db.model('Resume', ResumeSchema);
  return await Resume.findOne({ userId: new mongoose.Types.ObjectId(userId) });
}

export async function deleteResume(db: mongoose.Connection, userId: string) {
  await db.models.Resume || db.model('Resume', ResumeSchema);
  return await Resume.findOneAndDelete({ userId });
}
