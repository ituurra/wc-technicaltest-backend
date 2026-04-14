import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CachePort } from '../../domain/ports/cache.port';
import type { GithubPort } from '../../domain/ports/github.port';
import type { MetricsSummary } from '../../domain/github.types';
import { computeGithubMetricsSummary } from '../../domain/services/compute-github-metrics';
import { CACHE_PORT, GITHUB_PORT } from '../../composition/tokens';

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

@Injectable()
export class GetMetricsUseCase {
  private readonly logger = new Logger(GetMetricsUseCase.name);

  constructor(
    @Inject(GITHUB_PORT) private readonly githubPort: GithubPort,
    @Inject(CACHE_PORT) private readonly cachePort: CachePort,
  ) {}

  async execute(username: string): Promise<MetricsSummary> {
    const startedAt = Date.now();
    this.logger.log(`start username=${username}`);
    try {
      const cacheKey = `metrics:${username.toLowerCase()}`;
      const cached = this.cachePort.get<MetricsSummary>(cacheKey);
      if (cached) {
        return cached;
      }

      const [user, repos] = await Promise.all([
        this.githubPort.getUser(username),
        this.githubPort.getUserRepos(username),
      ]);

      const metrics = computeGithubMetricsSummary(user, repos);

      this.cachePort.set(cacheKey, metrics, FIVE_MINUTES_IN_MS);
      return metrics;
    } finally {
      this.logger.log(
        `end username=${username} durationMs=${Date.now() - startedAt}`,
      );
    }
  }
}
