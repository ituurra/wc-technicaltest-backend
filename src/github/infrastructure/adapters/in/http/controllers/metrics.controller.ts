import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { GetMetricsUseCase } from '../../../../../application/use-cases/get-metrics.use-case';
import { UsernameParamDto } from './dto/username-param.dto';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly getMetricsUseCase: GetMetricsUseCase) {}

  @Get(':username')
  @ApiOperation({
    summary:
      'Métricas derivadas (estrellas, ratio, último push, lenguaje principal)',
  })
  @ApiParam({ name: 'username', description: 'Login de GitHub' })
  getMetrics(@Param() { username }: UsernameParamDto) {
    return this.getMetricsUseCase.execute(username);
  }
}
