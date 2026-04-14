import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { GithubPort } from '../../../domain/ports/github.port';
import { GithubRepo, GithubUser } from '../../../domain/github.types';

interface GithubUserApiResponse {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

interface GithubRepoApiResponse {
  stargazers_count: number;
  pushed_at: string | null;
  language: string | null;
}

@Injectable()
export class GithubHttpAdapter implements GithubPort {
  constructor(private readonly httpService: HttpService) {}

  async getUser(username: string): Promise<GithubUser> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GithubUserApiResponse>(`/users/${username}`),
      );
      return {
        login: data.login,
        name: data.name,
        avatarUrl: data.avatar_url,
        bio: data.bio,
        publicRepos: data.public_repos,
        followers: data.followers,
        htmlUrl: data.html_url,
      };
    } catch (error) {
      this.handleGithubError(error);
    }
  }

  async getUserRepos(username: string): Promise<GithubRepo[]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get<GithubRepoApiResponse[]>(
          `/users/${username}/repos`,
        ),
      );
      return data.map((repo) => ({
        stargazersCount: repo.stargazers_count,
        pushedAt: repo.pushed_at,
        language: repo.language,
      }));
    } catch (error) {
      this.handleGithubError(error);
    }
  }

  private handleGithubError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new HttpException('GitHub user not found', HttpStatus.NOT_FOUND);
      }
      if (status === 429) {
        throw new HttpException(
          'GitHub rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (status === 403) {
        throw new HttpException(
          'GitHub request forbidden (possible rate limit)',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }
    throw new ServiceUnavailableException('GitHub service unavailable');
  }
}
