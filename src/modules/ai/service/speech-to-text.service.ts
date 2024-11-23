import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';  // Import OpenAI SDK
import * as fs from 'fs';  // For file handling
import * as FormData from 'form-data';  // To send the form data
import * as fetch from 'node-fetch';  // For making HTTP requests

@Injectable()
export class SpeechToTextService {
  private openai = new OpenAI({
    apiKey: "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",  // Replace with your OpenAI API key
  });

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    try {
      // Step 1: Create a temporary file with the buffer
      const filePath = './temp_audio.wav';  // Define the file path
      fs.writeFileSync(filePath, audioBuffer);  // Write the buffer to a file

      // Step 2: Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));  // Add the file to FormData
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'text');

      // Step 3: Send the form data to the OpenAI API using fetch
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,  // Use correct API key
        },
        body: formData,
      });

      // Log raw response body before parsing
      const textResponse = await response.text();  // Get raw text response
      console.log('Raw response:', textResponse);  // Log the raw response

      // Check if response is ok, otherwise log the error
      if (!response.ok) {
        throw new Error(`Error from OpenAI API: ${textResponse}`);
      }

      // Since it's plain text, we can directly return the transcription
      return textResponse;  // Return the transcription text directly
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    } finally {
      // Clean up the temporary file
      fs.unlinkSync('./temp_audio.wav');
    }
  }
}
