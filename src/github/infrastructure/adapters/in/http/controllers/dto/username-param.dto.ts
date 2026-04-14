import { IsString, Matches } from 'class-validator';

export class UsernameParamDto {
  @IsString()
  @Matches(/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i, {
    message: 'Invalid GitHub username format',
  })
  username!: string;
}
