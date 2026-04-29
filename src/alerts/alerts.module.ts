import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { DatabaseModule } from '../database/database.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [DatabaseModule, GatewayModule],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
