import OpenAI from 'openai';
import dotenv from 'dotenv';
import { AppError } from '../utils/errors';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in the environment variables');
}

interface AIAnalysis {
  generalComment: string;
  positiveAspects: string[];
  improvementSuggestions: string[];
  overallScore: number;
}

export async function generateAIFeedback(diaryContent: string): Promise<AIAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI assistant that analyzes diary entries and provides constructive feedback. Your response should be in JSON format with the following structure: {generalComment: string, positiveAspects: string[], improvementSuggestions: string[], overallScore: number}." },
        { role: "user", content: `Analyze the following diary entry:\n\n${diaryContent}` }
      ],
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) {
      throw new AppError('No feedback generated from AI', 500);
    }

    const parsedResponse: AIAnalysis = JSON.parse(aiResponse);
    return parsedResponse;
  } catch (error) {
    console.error('Error generating AI feedback:', error);
    if (error instanceof SyntaxError) {
      throw new AppError('Failed to parse AI response: Invalid JSON format', 500);
    }
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Failed to generate AI feedback: Unexpected error occurred', 500);
  }
}