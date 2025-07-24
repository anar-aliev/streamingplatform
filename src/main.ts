import { NestFactory } from '@nestjs/core';
import { CoreModule } from './core/core.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as graphqlUpload from 'graphql-upload/graphqlUploadExpress.js';
import { ValidationPipe } from '@nestjs/common';
import { ms, type StringValue } from './shared/utils/ms.util';
import { parseBoolean } from './shared/utils/parse-boolean.util';
import { RedisService } from './core/redis/redis.service';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(CoreModule);

  const config = app.get(ConfigService);
  const redis = app.get(RedisService);

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')));
  app.use(config.getOrThrow<string>('GRAPHQL_PREFIX'), graphqlUpload());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN') || undefined,
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: false,
        sameSite: 'lax',
      },
      store: new RedisStore({
        client: redis,
        prefix: config.getOrThrow<string>('SESSION_FOLDER'),
        ttl: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')) / 1000,
      }),
    }),
  );

  app.enableCors({
    origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(config.getOrThrow<number>('APPLICATION_PORT'));
}
void bootstrap();
