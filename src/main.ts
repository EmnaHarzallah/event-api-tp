import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Required for Socket.IO (NestJS uses ws by default otherwise)
  app.useWebSocketAdapter(new IoAdapter(app));

  // Allow cross-origin requests (needed when testing from file://)
  app.enableCors({ origin: '*' });

  // Serve static files from project root → http://localhost:3000/test-chat.html
  app.useStaticAssets(process.cwd());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
