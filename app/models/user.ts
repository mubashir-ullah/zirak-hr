import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the user interface
interface IUser extends Document {
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
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the user model interface with static methods
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser>;
}

// Define the schema for user
const UserSchema = new Schema({
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
    select: false, // Don't include password in query results by default
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Hash password before saving if it's modified
UserSchema.pre('save', async function(next) {
  const user = this as IUser;
  
  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password') || !user.password) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password along with the new salt
    const hash = await bcrypt.hash(user.password, salt);
    
    // Override the cleartext password with the hashed one
    user.password = hash;
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  if (!user.password) return false;
  
  try {
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    throw error;
  }
};

// Static method to find user by email
UserSchema.statics.findByEmail = async function(email: string) {
  return this.findOne({ email }).select('+password');
};

// Create the model if it doesn't exist, or use the existing one
export const User = (mongoose.models.User || mongoose.model<IUser, IUserModel>('User', UserSchema));

// Export the interfaces for use in other files
export type { IUser, IUserModel };
