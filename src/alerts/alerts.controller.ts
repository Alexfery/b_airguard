import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get(':deviceId')
  getByDevice(
    @Param('deviceId') deviceId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.alertsService.getAlertsByDevice(deviceId, limit);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.alertsService.markAsRead(id);
  }
}
