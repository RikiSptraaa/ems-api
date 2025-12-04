import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transforms payloads into DTO instances
      whitelist: true, // Strips properties that are not part of the DTO
      forbidNonWhitelisted: true, // Throws error if unknown properties are provided
    }),
  );

  // CORS Configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*';

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed methods
    allowedHeaders: 'Content-Type, Accept, Authorization', // Allowed headers
    credentials: true, // Allow cookies
  });

  // Cookie Parser
  app.use(cookieParser());

  app.use(helmet());

  // Session
  app.use(
    session({
      secret: Math.random().toString(),
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 30 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
      },
    }),
  );
  await app.listen(process.env.PORT ?? 8800);
}
bootstrap();
