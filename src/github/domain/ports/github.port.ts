import type { GithubRepo, GithubUser } from '../github.types';

export interface GithubPort {
  getUser(username: string): Promise<GithubUser>;
  getUserRepos(username: string): Promise<GithubRepo[]>;
}
