import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { GITHUB_PORT } from '../src/github/composition/tokens';
import { GithubPort } from '../src/github/domain/ports/github.port';

const githubMock: GithubPort = {
  getUser: jest.fn(() =>
    Promise.resolve({
      login: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://example.com/octocat.png',
      bio: 'Mascot',
      publicRepos: 2,
      followers: 10,
      htmlUrl: 'https://github.com/octocat',
    }),
  ),
  getUserRepos: jest.fn(() =>
    Promise.resolve([
      {
        stargazersCount: 3,
        pushedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        language: 'TypeScript',
      },
      {
        stargazersCount: 7,
        pushedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        language: 'TypeScript',
      },
    ]),
  ),
};

describe('MetricsController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GITHUB_PORT)
      .useValue(githubMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  it('/metrics/:username (GET)', () => {
    return request(app.getHttpServer())
      .get('/metrics/octocat')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          username: string;
          metrics: {
            totalStars: number;
            followersToReposRatio: number;
            lastPushDaysAgo: number;
            topLanguage: string | null;
          };
        };
        expect(body.username).toBe('octocat');
        expect(body.metrics.totalStars).toBe(10);
        expect(body.metrics.followersToReposRatio).toBe(5);
        expect(typeof body.metrics.lastPushDaysAgo).toBe('number');
        expect(body.metrics.topLanguage).toBe('TypeScript');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
