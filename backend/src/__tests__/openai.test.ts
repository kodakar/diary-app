import { generateAIFeedback } from '../services/openai';
import dotenv from 'dotenv';

dotenv.config();

describe('generateAIFeedback with real API', () => {
  it('should generate feedback for a given diary entry', async () => {
    const diaryContent = "Today was a good day. I accomplished a lot and felt very productive.";
    const feedback = await generateAIFeedback(diaryContent);
    
    expect(feedback).toHaveProperty('generalComment');
    expect(typeof feedback.generalComment).toBe('string');
    expect(feedback).toHaveProperty('positiveAspects');
    expect(Array.isArray(feedback.positiveAspects)).toBe(true);
    expect(feedback).toHaveProperty('improvementSuggestions');
    expect(Array.isArray(feedback.improvementSuggestions)).toBe(true);
    expect(feedback).toHaveProperty('overallScore');
    expect(typeof feedback.overallScore).toBe('number');

    console.log('Generated Feedback:', JSON.stringify(feedback, null, 2));
  }, 30000);

  it('should throw an error for empty diary content', async () => {
    await expect(generateAIFeedback("")).rejects.toThrow();
  });
});