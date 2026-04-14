export interface GithubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  htmlUrl: string;
}

export interface GithubRepo {
  stargazersCount: number;
  pushedAt: string | null;
  language: string | null;
}

export interface ProfileSummary {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  profileUrl: string;
}

export interface MetricsSummary {
  username: string;
  metrics: {
    totalStars: number;
    followersToReposRatio: number;
    lastPushDaysAgo: number | null;
    topLanguage: string | null;
  };
}
