import mongoose, { Document, Schema } from 'mongoose';

export interface IDiary extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  mood?: string;
  aiAnalysis: {
    generalComment: string;
    positiveAspects: string[];
    improvementSuggestions: string[];
    overallScore: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const diarySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mood: { type: String },
  aiAnalysis: {
    generalComment: { type: String },
    positiveAspects: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    overallScore: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model<IDiary>('Diary', diarySchema);