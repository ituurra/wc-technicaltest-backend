import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { GithubModule } from './github/github.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), GithubModule],
  controllers: [HealthController],
})
export class AppModule {}
