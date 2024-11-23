import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class LanguageAssessmentService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async assessLanguage(text: string): Promise<string> {
    const prompt = `Assess the following English sentence for grammar, fluency, and pronunciation, and suggest improvements if needed: "${text}"`;

    const maxRetries = 5;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        // Use the chat/completions endpoint instead of completions
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: 'You are an assistant that helps with language assessments.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 150,
        });

        return response.choices[0].message.content.trim(); // Access the response from the chat model
      } catch (error) {
        lastError = error;
        if (error.response && error.response.status === 429) {
          retryCount++;
          const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Rate limit exceeded. Retrying in ${backoffTime / 1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        } else {
          console.error('OpenAI error:', error.response ? error.response.data : error.message);
          break;
        }
      }
    }

    throw lastError; // Rethrow the error after maximum retries
  }
}