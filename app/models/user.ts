import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User document (instance methods)
export interface IUserDocument extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'admin' | 'hr_manager' | 'recruiter' | 'candidate';
  profileImage: string;
  department: string;
  company: string;
  isActive: boolean;
  authProvider: 'credentials' | 'google' | 'github' | 'linkedin' | 'apple';
  providerId: string;
  lastLogin: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for User model (static methods)
export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByResetToken(token: string): Promise<IUserDocument | null>;
}

// Define the schema
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['admin', 'hr_manager', 'recruiter', 'candidate'],
      default: 'hr_manager',
    },
    profileImage: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    authProvider: {
      type: String,
      enum: ['credentials', 'google', 'github', 'linkedin', 'apple'],
      default: 'credentials',
    },
    providerId: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Update the updatedAt field before saving
UserSchema.pre<IUserDocument>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password before saving
UserSchema.pre<IUserDocument>('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    // If no password exists (social login), return false
    if (!this.password) return false;
    
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Static method to find user by email
UserSchema.statics.findByEmail = async function (
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email }).select('+password');
};

// Static method to find user by reset token
UserSchema.statics.findByResetToken = async function (
  token: string
): Promise<IUserDocument | null> {
  return this.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password');
};

// Create or get the model
export const User = (mongoose.models.User as IUserModel) || 
  mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

// Export the interfaces for use in other files
export type { IUserModel };
