import { Controller, Get, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { SensorsService } from './sensors.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}

  /**
   * GET /history/:deviceId?from=ISO&to=ISO
   * Frontend calls: `${apiUrl}/history/${deviceId}?from=${from.toISOString()}&to=${to.toISOString()}`
   */
  @Get(':deviceId')
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
}
