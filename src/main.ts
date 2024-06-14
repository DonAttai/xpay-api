import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.setGlobalPrefix("api", { exclude: ["/"] });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT");
  app.enableCors({
    credentials: true,
    origin: [
      configService.get<string>("CLIENT_URL_REMOTE"),
      configService.get<string>("CLIENT_URL_LOCAL"),
    ],
  });
  app.useGlobalPipes(new ValidationPipe());

  // swagger
  const config = new DocumentBuilder()
    .setTitle("X-Pay")
    .setDescription("X-Pay api")
    .setVersion("1.0")
    .addTag("x-pay")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
}
bootstrap();
