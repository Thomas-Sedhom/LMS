import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechToTextService } from './service/speech-to-text.service';
import { LanguageAssessmentService } from './service/language-assessment.service';
import { Express } from 'express';
import { ChatService } from './service/chat.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { VideoDto } from '../course/dto/video.dto';

@Controller('ai')
export class AiController {
  constructor(
    private readonly speechToTextService: SpeechToTextService,
    private readonly languageAssessmentService: LanguageAssessmentService,
    private readonly chatService: ChatService,
  ) {}

  @ApiOperation({ summary: "evaluate audio" })
  @ApiResponse({ status: 201, description: 'Video evaluated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('evaluate')
  @UseInterceptors(FileInterceptor('audio'))
  async evaluateStudentSpeech(@UploadedFile() audio: Express.Multer.File) {
    const transcription = await this.speechToTextService.transcribeAudio(audio.buffer);
    const assessment = await this.languageAssessmentService.assessLanguage(transcription);
    return { transcription, assessment };
  }

  @ApiOperation({ summary: "chat with ai" })
  @ApiResponse({ status: 201, description: 'chat done successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post('chat')
  @UseInterceptors(FileInterceptor('audio'))
  async chat(
    @Body('message') message: string,
    @UploadedFile() audio: Express.Multer.File,
  ): Promise<{ response: string }> {
    try {
      let userMessage: string;

      if (audio) {
        // Use the existing SpeechToTextService to transcribe audio
        userMessage = await this.speechToTextService.transcribeAudio(audio.buffer);
      } else if (message) {
        userMessage = message;
      } else {
        throw new BadRequestException('Either a text message or audio file must be provided.');
      }

      // Get the AI response
      const aiResponse = await this.chatService.chatWithStudent(userMessage);
      return { response: aiResponse };
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      return { response: 'Failed to communicate with the AI' };
    }
  }
}