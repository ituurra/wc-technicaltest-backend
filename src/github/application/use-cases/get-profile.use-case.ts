import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CachePort } from '../../domain/ports/cache.port';
import type { GithubPort } from '../../domain/ports/github.port';
import type { ProfileSummary } from '../../domain/github.types';
import { buildProfileSummary } from '../../domain/services/build-profile-summary';
import { CACHE_PORT, GITHUB_PORT } from '../../composition/tokens';

const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;

@Injectable()
export class GetProfileUseCase {
  private readonly logger = new Logger(GetProfileUseCase.name);

  constructor(
    @Inject(GITHUB_PORT) private readonly githubPort: GithubPort,
    @Inject(CACHE_PORT) private readonly cachePort: CachePort,
  ) {}

  async execute(username: string): Promise<ProfileSummary> {
    const startedAt = Date.now();
    this.logger.log(`start username=${username}`);
    try {
      const cacheKey = `profile:${username.toLowerCase()}`;
      const cached = this.cachePort.get<ProfileSummary>(cacheKey);
      if (cached) {
        return cached;
      }

      const user = await this.githubPort.getUser(username);
      const profile = buildProfileSummary(user);
      this.cachePort.set(cacheKey, profile, FIVE_MINUTES_IN_MS);
      return profile;
    } finally {
      this.logger.log(
        `end username=${username} durationMs=${Date.now() - startedAt}`,
      );
    }
  }
}
