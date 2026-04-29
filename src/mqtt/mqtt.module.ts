import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { SensorsModule } from '../sensors/sensors.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, SensorsModule],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
