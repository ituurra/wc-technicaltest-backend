import type { GithubUser } from '../github.types';
import { buildProfileSummary } from './build-profile-summary';

describe('buildProfileSummary (domain)', () => {
  it('mapea GithubUser a ProfileSummary', () => {
    const user: GithubUser = {
      login: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://example.com/octo.png',
      bio: 'Mascot',
      publicRepos: 2,
      followers: 10,
      htmlUrl: 'https://github.com/octocat',
    };

    const summary = buildProfileSummary(user);

    expect(summary).toEqual({
      username: 'octocat',
      name: 'The Octocat',
      avatarUrl: 'https://example.com/octo.png',
      bio: 'Mascot',
      publicRepos: 2,
      followers: 10,
      profileUrl: 'https://github.com/octocat',
    });
  });
});
