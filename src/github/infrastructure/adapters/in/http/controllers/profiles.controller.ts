import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetProfileUseCase } from '../../../../../application/use-cases/get-profile.use-case';
import { UsernameParamDto } from './dto/username-param.dto';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get(':username')
  @ApiOperation({ summary: 'Perfil resumido de un usuario de GitHub' })
  @ApiParam({ name: 'username', description: 'Login de GitHub' })
  getProfile(@Param() { username }: UsernameParamDto) {
    return this.getProfileUseCase.execute(username);
  }
}
