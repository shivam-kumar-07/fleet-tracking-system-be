
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {});
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  const routePrefix = 'api';
  
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
  });

  app.set('trust proxy', true);

  app.setGlobalPrefix(routePrefix);

  await app.listen(port);

  console.log(`Backend running on :${port}`);
}
bootstrap();
