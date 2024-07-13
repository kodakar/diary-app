import mongoose, { Document, Schema } from 'mongoose';

interface IDiary extends Document {
    user: mongoose.Types.ObjectId;
    content: string;
    mood?: string;
    aiAnalysis?: {
      feedback: string;
      suggestions: string[];
      score?: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }

const diarySchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    mood: { type: String },
}, { timestamps: true });

export default mongoose.model<IDiary>('Diary', diarySchema);
