import mongoose, { Schema } from 'mongoose';

// Define the Language schema
const LanguageSchema = new Schema({
  language: { type: String, required: true },
  proficiency: { type: String, required: true }
});

// Define the Candidate schema
const CandidateSchema = new Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  matchScore: { type: Number, default: 0 },
  skills: [{ type: String }],
  experience: { type: Number, required: true },
  education: { type: String, required: true },
  availability: { type: String, required: true },
  languages: [LanguageSchema],
  germanLevel: { type: String },
  visaStatus: { type: String, required: true },
  avatar: { type: String, default: '/images/default-avatar.png' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create a text index for search functionality
CandidateSchema.index({ 
  name: 'text', 
  title: 'text', 
  skills: 'text',
  location: 'text',
  country: 'text',
  city: 'text'
});

export default mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);
