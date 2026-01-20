import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { SeederService } from './shared/seeder/seeder.service';
import { AllExceptionsFilter } from './shared/allexceptions-filter';
import * as fs from 'fs';
import * as path from 'path';

const logPath = path.resolve(`${process.env.LOG_DIRECTORY}logs/app-error.log`);
function ensureLogDirectory() {
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
ensureLogDirectory();

try {
  fs.appendFileSync(logPath, `[${new Date().toISOString()}] App started\n`, 'utf8');
} catch (err) {
  console.error('❌ No se pudo escribir en el archivo de logs:', err);
}

process.on('uncaughtException', (err) => {
  const errorMessage = `[${new Date().toISOString()}] uncaughtException: ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(logPath, errorMessage, 'utf8');
  console.error(errorMessage);
});

process.on('unhandledRejection', (reason: any) => {
  const errorMessage = `[${new Date().toISOString()}] unhandledRejection: ${reason?.message || reason}\n\n`;
  fs.appendFileSync(logPath, errorMessage, 'utf8');
  console.error(errorMessage);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
   );

   const seedService = app.get(SeederService);
   await seedService.seed();

   // Configuración para recibir datos en formato XML
  app.use(bodyParser.text({ type: 'application/xml', limit: '100mb' }));

  // Configuración para recibir datos en formato texto plano
  app.use(bodyParser.text({ type: 'text/plain', limit: '100mb' }));

  // Si necesitas procesar JSON (incluido por defecto en NestJS)
  app.use(bodyParser.json({ limit: '100mb' }));

  app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
