import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';

@Injectable()
export class ChatService {
  private openai = new OpenAI({
    apiKey: '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', // Replace with your OpenAI API key
  });

  async chatWithStudent(studentMessage: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: studentMessage }],
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      throw new Error('Failed to process the chat');
    }
  }
}
