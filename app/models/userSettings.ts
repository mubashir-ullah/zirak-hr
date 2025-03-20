import mongoose, { Schema } from 'mongoose';

// Define the schema for user settings
const UserSettingsSchema = new Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    applicationUpdates: {
      type: Boolean,
      default: true,
    },
    messageNotifications: {
      type: Boolean,
      default: true,
    },
    marketingEmails: {
      type: Boolean,
      default: false,
    },
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['all', 'connections', 'private'],
      default: 'all',
    },
    activityTracking: {
      type: Boolean,
      default: true,
    },
    dataSharing: {
      type: Boolean,
      default: false,
    },
  },
  account: {
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: '',
    },
    twoFactorAuth: {
      type: Boolean,
      default: false,
    },
  },
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      enum: ['en', 'de', 'ur', 'ar', 'es', 'fr'],
      default: 'en',
    },
    compactView: {
      type: Boolean,
      default: false,
    },
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
UserSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the model if it doesn't exist, or use the existing one
export const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
