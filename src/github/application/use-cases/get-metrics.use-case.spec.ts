import { GetMetricsUseCase } from './get-metrics.use-case';
import { GithubPort } from '../../domain/ports/github.port';
import { CachePort } from '../../domain/ports/cache.port';

describe('GetMetricsUseCase', () => {
  const githubPortMock: GithubPort = {
    getUser: jest.fn(),
    getUserRepos: jest.fn(),
  };

  const cacheStore = new Map<string, unknown>();
  const setSpy = jest.fn((key: string, value: unknown) => {
    cacheStore.set(key, value);
  }) as CachePort['set'];
  const cachePortMock: CachePort = {
    get<T>(key: string): T | null {
      return (cacheStore.get(key) as T | undefined) ?? null;
    },
    set: setSpy,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cacheStore.clear();
  });

  it('computes expected metrics values', async () => {
    (githubPortMock.getUser as jest.Mock).mockResolvedValue({
      login: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://example.com/octocat.png',
      bio: null,
      publicRepos: 4,
      followers: 11,
      htmlUrl: 'https://github.com/octocat',
    });

    (githubPortMock.getUserRepos as jest.Mock).mockResolvedValue([
      {
        stargazersCount: 5,
        pushedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        language: null,
      },
      {
        stargazersCount: 6,
        pushedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        language: null,
      },
    ]);

    const useCase = new GetMetricsUseCase(githubPortMock, cachePortMock);
    const result = await useCase.execute('octocat');

    expect(result.username).toBe('octocat');
    expect(result.metrics.totalStars).toBe(11);
    expect(result.metrics.followersToReposRatio).toBe(2.75);
    expect(result.metrics.lastPushDaysAgo).toBe(1);
    expect(result.metrics.topLanguage).toBeNull();
    expect(setSpy).toHaveBeenCalled();
  });

  it('returns null when there is no repo activity', async () => {
    (githubPortMock.getUser as jest.Mock).mockResolvedValue({
      login: 'octocat',
      name: null,
      avatarUrl: 'https://example.com/octocat.png',
      bio: null,
      publicRepos: 0,
      followers: 0,
      htmlUrl: 'https://github.com/octocat',
    });
    (githubPortMock.getUserRepos as jest.Mock).mockResolvedValue([]);

    const useCase = new GetMetricsUseCase(githubPortMock, cachePortMock);
    const result = await useCase.execute('octocat');

    expect(result.metrics.totalStars).toBe(0);
    expect(result.metrics.followersToReposRatio).toBe(0);
    expect(result.metrics.lastPushDaysAgo).toBeNull();
    expect(result.metrics.topLanguage).toBeNull();
  });
});
