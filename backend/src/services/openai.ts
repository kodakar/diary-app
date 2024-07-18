import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { AppError } from '../utils/errors';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AIAnalysis {
  generalComment: string;
  positiveAspects: string[];
  improvementSuggestions: string[];
  overallScore: number;
}

export async function generateAIFeedback(diaryContent: string): Promise<AIAnalysis> {
  if (!diaryContent.trim()) {
    throw new AppError('Diary content cannot be empty', 400);
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
    //   model: "gpt-4o",
    messages: [
      {
        "role": "system",
        "content": "You are an AI assistant that analyzes diary entries and provides constructive feedback. Your response should be in JSON format with the following structure: {generalComment: string, positiveAspects: string[], improvementSuggestions: string[], overallScore: number}. The feedback should be in Japanese and focus on improving the writer's composition skills. Positive aspects should highlight good points about the diary's structure, while improvement suggestions should point out areas where the composition could be better. The overall score should be based on 'logical consistency and structure,' 'clarity and conciseness,' and 'reader interest and engagement,' rated on a scale from 1 to 10, with the overall score being an average of these three criteria."
      },
      {
        "role": "user",
        "content": "Analyze the following diary entry and provide feedback in the specified JSON format:\n\n${diaryContent}"
      }
    ],
    
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content;
    if (!aiResponse) {
      throw new AppError('No feedback generated from AI', 500);
    }

    try {
      const parsedResponse = JSON.parse(aiResponse) as AIAnalysis;
      if (!parsedResponse.generalComment || !Array.isArray(parsedResponse.positiveAspects) || 
          !Array.isArray(parsedResponse.improvementSuggestions) || typeof parsedResponse.overallScore !== 'number') {
        throw new Error('Invalid response structure');
      }
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new AppError('Invalid response format from AI', 500);
    }
  } catch (error) {
    console.error('Error in generateAIFeedback:', error);
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError(`Failed to generate AI feedback: ${error.message}`, 500);
    }
    throw new AppError('Failed to generate AI feedback: Unknown error', 500);
  }
}