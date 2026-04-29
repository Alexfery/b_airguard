import { Module } from '@nestjs/common';
import { SensorsGateway } from './sensors.gateway';

@Module({
  providers: [SensorsGateway],
  exports: [SensorsGateway],
})
export class GatewayModule {}
