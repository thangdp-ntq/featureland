import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { LogLevel, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptor/logging.interceptor';
import { config } from 'aws-sdk';
import { HttpValidationError } from './common/responses/api-errors';
import { CommonCode } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL.split(',') as LogLevel[],
  });
  app.enableCors();
  app.startAllMicroservices();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const _messages = (errors: ValidationError[]) => {
          let messages = [];
          for (let index = 0; index < errors.length; index++) {
            const error = errors[index];
            if (error.constraints) {
              for (const [, value] of Object.entries(error.constraints)) {
                messages.push(value);
              }
            } else if (error.children) {
              const childMessages = _messages(error.children);
              messages = [...messages, ...childMessages];
            }
          }

          return messages;
        };
        throw HttpValidationError.error(
          CommonCode.E0,
          CommonCode.DEFAULT_VALIDATION_ERROR_MESSAGE,
          _messages(errors),
        );
      },
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
    const config = new DocumentBuilder()
      .setTitle('Marketplace')
      .setDescription('The marketplace API description')
      .setVersion('1.0')
      .addSecurity('token', { in: 'header', type: 'apiKey', name: 'token' })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'My API Docs',
    };
    SwaggerModule.setup('swagger', app, document, customOptions);

  await app.listen(process.env.PORT);
}
bootstrap();
