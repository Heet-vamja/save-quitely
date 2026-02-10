import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { Logger } from "@nestjs/common";
import { DocumentBuilder } from "@nestjs/swagger/dist/document-builder";
import { SwaggerModule } from "@nestjs/swagger/dist/swagger-module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger("Bootstrap");

  // Set global prefix for all routes to match ingress routing
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle("Save Quietly API")
    .setDescription("API for Save Quietly application")
    .setVersion("1.0")
    .addBearerAuth() // JWT Auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`SaveQuietly API running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
