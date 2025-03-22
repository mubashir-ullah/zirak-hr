import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedJob extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  savedDate: Date;
  notes: string;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    savedDate: { type: Date, default: Date.now },
    notes: { type: String }
  },
  { timestamps: true }
);

// Create compound index for user and job
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Check if the model already exists to prevent overwriting
export default mongoose.models.SavedJob || mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
