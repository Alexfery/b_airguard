import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.devicesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.devicesService.findOne(id, req.user.id);
  }

  @Post()
  create(@Body() dto: CreateDeviceDto, @Request() req: any) {
    return this.devicesService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto, @Request() req: any) {
    return this.devicesService.update(id, req.user.id, dto);
  }

  @Patch(':id/fan')
  setFan(@Param('id') id: string, @Body() body: { on: boolean }) {
    return this.devicesService.setFan(id, body.on);
  }

  @Patch(':id/humidifier')
  setHumidifier(@Param('id') id: string, @Body() body: { on: boolean }) {
    return this.devicesService.setHumidifier(id, body.on);
  }

  @Patch(':id/mode')
  setAiMode(
    @Param('id') id: string,
    @Body() body: { mode: 'reaction' | 'prediction' | 'auto' },
  ) {
    return this.devicesService.setAiMode(id, body.mode);
  }
}
