import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ProfilesController } from './infrastructure/adapters/in/http/controllers/profiles.controller';
import { MetricsController } from './infrastructure/adapters/in/http/controllers/metrics.controller';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { GetMetricsUseCase } from './application/use-cases/get-metrics.use-case';
import { GithubHttpAdapter } from './infrastructure/adapters/out/github-http.adapter';
import { InMemoryCacheAdapter } from './infrastructure/adapters/out/memory-cache.adapter';
import { CACHE_PORT, GITHUB_PORT } from './composition/tokens';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const userAgent = configService.get<string>(
          'USER_AGENT',
          'wc-technicaltest-backend',
        );
        const githubToken = configService.get<string>('GITHUB_TOKEN');
        return {
          baseURL: 'https://api.github.com',
          timeout: 5000,
          headers: {
            'User-Agent': userAgent,
            ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
          },
        };
      },
    }),
  ],
  controllers: [ProfilesController, MetricsController],
  providers: [
    GetProfileUseCase,
    GetMetricsUseCase,
    GithubHttpAdapter,
    InMemoryCacheAdapter,
    { provide: GITHUB_PORT, useExisting: GithubHttpAdapter },
    { provide: CACHE_PORT, useExisting: InMemoryCacheAdapter },
  ],
})
export class GithubModule {}
