import type { GithubRepo, GithubUser, MetricsSummary } from '../github.types';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function computeGithubMetricsSummary(
  user: GithubUser,
  repos: GithubRepo[],
  nowMs: number = Date.now(),
): MetricsSummary {
  return {
    username: user.login,
    metrics: {
      totalStars: sumStargazers(repos),
      followersToReposRatio: followersToPublicReposRatio(
        user.followers,
        user.publicRepos,
      ),
      lastPushDaysAgo: daysSinceLatestPush(repos, nowMs),
      topLanguage: mostFrequentLanguage(repos),
    },
  };
}

function sumStargazers(repos: GithubRepo[]): number {
  return repos.reduce((acc, repo) => acc + repo.stargazersCount, 0);
}

function followersToPublicReposRatio(
  followers: number,
  publicRepos: number,
): number {
  if (publicRepos <= 0) {
    return 0;
  }
  return Number((followers / publicRepos).toFixed(2));
}

function mostFrequentLanguage(repos: GithubRepo[]): string | null {
  const counts = new Map<string, number>();
  for (const repo of repos) {
    if (repo.language) {
      counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    }
  }
  if (counts.size === 0) {
    return null;
  }
  const sorted = [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  return sorted[0][0];
}

function daysSinceLatestPush(
  repos: GithubRepo[],
  nowMs: number,
): number | null {
  const pushedDates = repos
    .map((repo) => repo.pushedAt)
    .filter((pushedAt): pushedAt is string => Boolean(pushedAt))
    .map((pushedAt) => new Date(pushedAt).getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  if (pushedDates.length === 0) {
    return null;
  }

  const latestPush = Math.max(...pushedDates);
  const daysAgo = Math.floor((nowMs - latestPush) / ONE_DAY_MS);
  return daysAgo < 0 ? 0 : daysAgo;
}
