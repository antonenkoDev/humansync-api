import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // const adminDataSource = app.get('ADMIN_DATA_SOURCE_TOKEN');
  // await adminDataSource.initialize();
  // await adminDataSource.runMigrations();

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: true,
  });
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('HumanSync v.alpha')
      .setDescription('HumanSync v.alpha API documentation')
      .setVersion('0.alpha')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document, {
      useGlobalPrefix: true,
    });
  }
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(4000);
}

bootstrap();
