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
const events = require('events');
events.EventEmitter.defaultMaxListeners = 100;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.LOG_LEVEL.split(',') as LogLevel[],
  });
  // const origins = process.env.ORIGIN?.trim()?.split(' ') ?? [''];
  // const allowedOrigin = origins.length === 1 ? origins.toString() : origins;
  // const corsOptions = {
  //   origin: allowedOrigin,
  //   methods: process.env.METHODS?.split(','),
  //   credentials: true,
  // };
  // app.enableCors(corsOptions);

  // app.setGlobalPrefix(process.env.GLOBAL_API_PREFIX);

  // app.startAllMicroservices();


  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      validateCustomDecorators: true,
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
      .setTitle('FeatureLand')
      .setDescription('FeatureLand')
      .setVersion('1.0')
      .addSecurity('token', { in: 'header', type: 'apiKey', name: 'token' })
      .build();
    const document = SwaggerModule.createDocument(app, config);
    const customOptions: SwaggerCustomOptions = {
      customSiteTitle: 'My API Docs',
    };
    SwaggerModule.setup('swagger', app, document, customOptions);
    console.log('app listening port',process.env.PORT)
  await app.listen(process.env.PORT);
}
bootstrap();
