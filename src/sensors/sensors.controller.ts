import {
  Controller, Get, Param, Query,
  UseGuards, BadRequestException,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sensors')
@UseGuards(JwtAuthGuard)
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}

  /**
   * GET /sensors/:deviceId/history?from=ISO&to=ISO
   */
  @Get(':deviceId/history')
  getHistory(
    @Param('deviceId') deviceId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) {
      throw new BadRequestException('Query params "from" and "to" are required (ISO 8601)');
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid date format — use ISO 8601');
    }

    return this.sensorsService.getHistory(deviceId, fromDate, toDate);
  }

  /**
   * GET /sensors/:deviceId/predictions?limit=20
   */
  @Get(':deviceId/predictions')
  getPredictions(
    @Param('deviceId') deviceId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.sensorsService.getPredictions(deviceId, limit);
  }
}
