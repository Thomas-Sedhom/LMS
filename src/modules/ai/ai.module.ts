import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { LanguageAssessmentService } from './service/language-assessment.service';
import { SpeechToTextService } from './service/speech-to-text.service';
import { ChatService } from './service/chat.service';

@Module({
  controllers: [AiController],
  providers: [LanguageAssessmentService, SpeechToTextService, ChatService],
})
export class AiModule {}
