import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 500; // Default status code
    let message = 'Internal server error'; // Default error message
    let errorResponse: any;

    // If it's an HttpException, handle it differently
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // If it's a validation error, handle the response properly
      if (exception instanceof BadRequestException && typeof exceptionResponse === 'object') {
        errorResponse = {
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          // Extract message from ValidationPipe
          message: (exceptionResponse as any).message || 'Bad request',
          error: (exceptionResponse as any).error || 'Bad Request',
        };
      } else {
        // Handle other HttpExceptions
        errorResponse = {
          statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: (typeof exceptionResponse === 'object' ? (exceptionResponse as any).message : exceptionResponse) || exception.message,
        };
      }
    } else {
      // Handle non-HttpExceptions
      errorResponse = {
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message || 'Internal server error',
      };
    }

    response.status(statusCode).json(errorResponse);
  }
}