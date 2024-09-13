import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {Response} from '../interfaces/responce.interface'
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map(data => {
        // Check if the status code is not an error (e.g., 2xx)
        const statusCode = response.statusCode;
        console.log(statusCode);
        if (statusCode >= 200 && statusCode < 300) {
          return {
            statusCode: statusCode,
            message: this.reflector.get<string>("response_message", context.getHandler()) || 'Success',
            data,
          };
        }

        // If the status code is an error, let the default error handling apply
        return data;
      }),
    );
  }
}