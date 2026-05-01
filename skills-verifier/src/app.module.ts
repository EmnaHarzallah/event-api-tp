import { Module } from '@nestjs/common';
import { VerifyModule } from './verify/verify.module';

@Module({
  imports: [VerifyModule],
})
export class AppModule {}
