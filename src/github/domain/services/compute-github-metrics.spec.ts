import { computeGithubMetricsSummary } from './compute-github-metrics';
import type { GithubRepo, GithubUser } from '../github.types';

describe('computeGithubMetricsSummary (domain)', () => {
  const baseUser: GithubUser = {
    login: 'octocat',
    name: 'Cat',
    avatarUrl: 'https://example.com/a.png',
    bio: null,
    publicRepos: 4,
    followers: 11,
    htmlUrl: 'https://github.com/octocat',
  };

  it('calcula estrellas, ratio y días desde último push', () => {
    const now = new Date('2026-01-10T12:00:00.000Z').getTime();
    const repos: GithubRepo[] = [
      {
        stargazersCount: 5,
        pushedAt: new Date('2026-01-07T12:00:00.000Z').toISOString(),
        language: 'TypeScript',
      },
      {
        stargazersCount: 6,
        pushedAt: new Date('2026-01-09T12:00:00.000Z').toISOString(),
        language: 'TypeScript',
      },
    ];

    const result = computeGithubMetricsSummary(baseUser, repos, now);

    expect(result.username).toBe('octocat');
    expect(result.metrics.totalStars).toBe(11);
    expect(result.metrics.followersToReposRatio).toBe(2.75);
    expect(result.metrics.lastPushDaysAgo).toBe(1);
    expect(result.metrics.topLanguage).toBe('TypeScript');
  });

  it('sin actividad en repos devuelve null en lastPush y ratio 0 si no hay repos públicos', () => {
    const user: GithubUser = { ...baseUser, publicRepos: 0, followers: 0 };
    const result = computeGithubMetricsSummary(user, [], Date.now());

    expect(result.metrics.totalStars).toBe(0);
    expect(result.metrics.followersToReposRatio).toBe(0);
    expect(result.metrics.lastPushDaysAgo).toBeNull();
    expect(result.metrics.topLanguage).toBeNull();
  });

  it('elige el lenguaje más frecuente con desempate alfabético', () => {
    const repos: GithubRepo[] = [
      {
        stargazersCount: 1,
        pushedAt: null,
        language: 'Ruby',
      },
      {
        stargazersCount: 1,
        pushedAt: null,
        language: 'Go',
      },
      {
        stargazersCount: 1,
        pushedAt: null,
        language: 'Go',
      },
    ];
    const result = computeGithubMetricsSummary(baseUser, repos);
    expect(result.metrics.topLanguage).toBe('Go');
  });
});
