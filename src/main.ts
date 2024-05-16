import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  app.enableCors({
    // origin: [configService.get<string>('URL_LOCAL')],
    // credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());

  // swagger
  const config = new DocumentBuilder()
    .setTitle('X-Pay')
    .setDescription('X-Pay api')
    .setVersion('1.0')
    .addTag('x-pay')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('@api', app, document);

  await app.listen(port);
}
bootstrap();
