import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { TypeORMError } from 'typeorm';
import * as process from 'process';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      console.error(exception);
      response.status(exception.getStatus()).json(exception.getResponse());
    } else if (exception instanceof TypeORMError) {
      const message = exception.message;
      response.status(500).json(message);
    } else {
      let debug: string;
      if ((process.env.DEBUG_ENABLED = 'true')) {
        debug = exception.toString();
      }
      console.error(exception);
      response.status(500).json({
        error: 'Internal Server Error',
        debug,
      });
    }
  }
}
