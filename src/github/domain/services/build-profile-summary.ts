import type { GithubUser, ProfileSummary } from '../github.types';

export function buildProfileSummary(user: GithubUser): ProfileSummary {
  return {
    username: user.login,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    publicRepos: user.publicRepos,
    followers: user.followers,
    profileUrl: user.htmlUrl,
  };
}
