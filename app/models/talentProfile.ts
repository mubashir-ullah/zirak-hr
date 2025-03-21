import mongoose, { Schema, Document } from 'mongoose';

export interface ITalentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  title: string;
  email: string;
  country: string;
  city: string;
  germanLevel: string;
  availability: string;
  visaRequired: boolean;
  visaType: string;
  linkedinUrl: string;
  githubUrl: string;
  bio: string;
  profilePicture: string;
  resumeUrl: string;
  phone: string;
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    verified: boolean;
    verificationMethod?: 'assessment' | 'certification' | 'interview' | 'portfolio';
    verificationDate?: Date;
  }[];
  experience: string;
  education: {
    degree: string;
    institution: string;
    graduationYear: string;
  }[];
  preferredJobTypes: string[];
  preferredLocations: string[];
  languages: {
    name: string;
    level: string;
  }[];
  profileCompletionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const TalentProfileSchema = new Schema<ITalentProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    title: { type: String, default: '' },
    email: { type: String, required: true },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    germanLevel: { type: String, default: 'A1' },
    availability: { type: String, default: 'Immediate' },
    visaRequired: { type: Boolean, default: false },
    visaType: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    skills: [
      {
        name: { type: String, required: true },
        level: { 
          type: String, 
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        },
        verified: { type: Boolean, default: false },
        verificationMethod: { 
          type: String, 
          enum: ['assessment', 'certification', 'interview', 'portfolio'],
          required: false
        },
        verificationDate: { type: Date, required: false }
      }
    ],
    experience: { type: String, default: '' },
    education: [
      {
        degree: { type: String, default: '' },
        institution: { type: String, default: '' },
        graduationYear: { type: String, default: '' }
      }
    ],
    preferredJobTypes: [{ type: String }],
    preferredLocations: [{ type: String }],
    languages: [
      {
        name: { type: String, default: '' },
        level: { type: String, default: 'Intermediate' }
      }
    ],
    profileCompletionPercentage: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Calculate profile completion percentage
TalentProfileSchema.pre('save', function(next) {
  const profile = this;
  let completedFields = 0;
  let totalFields = 0;

  // Basic fields
  const basicFields = [
    'fullName', 'title', 'email', 'country', 'city', 'germanLevel', 
    'availability', 'phone', 'bio', 'experience'
  ];
  
  basicFields.forEach(field => {
    totalFields++;
    if (profile[field as keyof typeof profile] && String(profile[field as keyof typeof profile]).trim() !== '') {
      completedFields++;
    }
  });

  // Optional fields that count but aren't required
  const optionalFields = [
    'linkedinUrl', 'githubUrl', 'profilePicture', 'resumeUrl', 'visaType'
  ];
  
  optionalFields.forEach(field => {
    totalFields++;
    if (profile[field as keyof typeof profile] && String(profile[field as keyof typeof profile]).trim() !== '') {
      completedFields++;
    }
  });

  // Skills
  totalFields++;
  if (profile.skills && profile.skills.length > 0) {
    completedFields++;
  }

  // Education
  totalFields++;
  if (profile.education && profile.education.length > 0) {
    completedFields++;
  }
  
  // Languages
  totalFields++;
  if (profile.languages && profile.languages.length > 0) {
    completedFields++;
  }
  
  // Preferred job types
  totalFields++;
  if (profile.preferredJobTypes && profile.preferredJobTypes.length > 0) {
    completedFields++;
  }
  
  // Preferred locations
  totalFields++;
  if (profile.preferredLocations && profile.preferredLocations.length > 0) {
    completedFields++;
  }

  // Calculate percentage
  profile.profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
  next();
});

// Initialize the model
let TalentProfile: mongoose.Model<ITalentProfile>;

try {
  // Try to get the existing model
  TalentProfile = mongoose.model<ITalentProfile>('TalentProfile');
} catch (error) {
  // Model doesn't exist, create it
  TalentProfile = mongoose.model<ITalentProfile>('TalentProfile', TalentProfileSchema);
}

// Helper functions
export async function findProfileByUserId(db: mongoose.Connection, userId: string) {
  const TalentProfileModel = db.model<ITalentProfile>('TalentProfile', TalentProfileSchema);
  return await TalentProfileModel.findOne({ userId: new mongoose.Types.ObjectId(userId) });
}

export async function createOrUpdateProfile(db: mongoose.Connection, userId: string, profileData: Partial<ITalentProfile>) {
  const TalentProfileModel = db.model<ITalentProfile>('TalentProfile', TalentProfileSchema);
  
  const profile = await TalentProfileModel.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { ...profileData, userId: new mongoose.Types.ObjectId(userId) },
    { new: true, upsert: true, runValidators: true }
  );
  
  return profile;
}
