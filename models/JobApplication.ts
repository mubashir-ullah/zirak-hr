import mongoose, { Document, Schema } from 'mongoose';

export interface IJobApplication extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  appliedDate: Date;
  resumeUrl: string;
  coverLetter: string;
  notes: string;
  hiringManagerNotes?: string;
  lastStatusUpdateDate: Date;
  interviews?: {
    date: Date;
    type: 'phone' | 'video' | 'in-person';
    interviewerName: string;
    notes: string;
    status: 'scheduled' | 'completed' | 'cancelled';
  }[];
  statusHistory?: {
    status: string;
    date: Date;
    note?: string;
  }[];
  feedback?: {
    message: string;
    sentBy: 'candidate' | 'employer';
    senderDetails: {
      userId: mongoose.Types.ObjectId | string;
      name: string;
      email: string;
      profilePicture?: string;
    };
    sentAt: Date;
    isRead: boolean;
  }[];
  matchScore?: number;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
      index: true
    },
    appliedDate: { type: Date, default: Date.now },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    notes: { type: String },
    hiringManagerNotes: { type: String },
    lastStatusUpdateDate: { type: Date, default: Date.now },
    interviews: [{
      date: { type: Date },
      type: { type: String, enum: ['phone', 'video', 'in-person'] },
      interviewerName: { type: String },
      notes: { type: String },
      status: { 
        type: String, 
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
      }
    }],
    statusHistory: [{
      status: { type: String },
      date: { type: Date },
      note: { type: String }
    }],
    feedback: [{
      message: { type: String, required: true },
      sentBy: { 
        type: String, 
        enum: ['candidate', 'employer'],
        required: true
      },
      senderDetails: {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        email: { type: String },
        profilePicture: { type: String }
      },
      sentAt: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false }
    }],
    matchScore: { type: Number }
  },
  { timestamps: true }
);

// Create compound index for userId and jobId to ensure a user can only apply once to a job
JobApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Create indexes for common queries
JobApplicationSchema.index({ userId: 1, status: 1 });
JobApplicationSchema.index({ jobId: 1, status: 1 });
JobApplicationSchema.index({ appliedDate: -1 });
JobApplicationSchema.index({ lastStatusUpdateDate: -1 });

const JobApplication = mongoose.models.JobApplication || mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

export default JobApplication;
