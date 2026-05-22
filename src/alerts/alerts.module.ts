import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { DatabaseModule } from '../database/database.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [DatabaseModule, GatewayModule],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
