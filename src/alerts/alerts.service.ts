import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SensorsGateway } from '../gateway/sensors.gateway';

export interface DeviceThresholds {
  id: string;
  name: string;
  co2Threshold: number;
  pm25Threshold: number;
}

export interface SensorReading {
  co2: number;
  pm25: number;
  temperature: number;
  humidity: number;
}

interface AlertCheck {
  metric: string;
  value: number;
  dangerThreshold: number;
  warningThreshold: number;
  unit: string;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  private readonly TEMP_DANGER = 30;
  private readonly TEMP_WARNING = 26;
  private readonly HUMIDITY_DANGER = 70;
  private readonly HUMIDITY_WARNING = 60;

  constructor(
    private supabaseService: SupabaseService,
    private sensorsGateway: SensorsGateway,
  ) {}

  async checkAndCreateAlerts(device: DeviceThresholds, reading: SensorReading): Promise<void> {
    const checks: AlertCheck[] = [
      {
        metric: 'CO2',
        value: reading.co2,
        dangerThreshold: device.co2Threshold,
        warningThreshold: device.co2Threshold * 0.8,
        unit: 'ppm',
      },
      {
        metric: 'PM2.5',
        value: reading.pm25,
        dangerThreshold: device.pm25Threshold,
        warningThreshold: device.pm25Threshold * 0.8,
        unit: 'μg/m³',
      },
      {
        metric: 'temperature',
        value: reading.temperature,
        dangerThreshold: this.TEMP_DANGER,
        warningThreshold: this.TEMP_WARNING,
        unit: '°C',
      },
      {
        metric: 'humidity',
        value: reading.humidity,
        dangerThreshold: this.HUMIDITY_DANGER,
        warningThreshold: this.HUMIDITY_WARNING,
        unit: '%',
      },
    ];

    for (const check of checks) {
      if (check.value > check.dangerThreshold) {
        await this.persistAlert(device, check, 'danger');
      } else if (check.value > check.warningThreshold) {
        await this.persistAlert(device, check, 'warning');
      }
    }
  }

  private async persistAlert(
    device: DeviceThresholds,
    check: AlertCheck,
    severity: 'warning' | 'danger',
  ): Promise<void> {
    const label = severity === 'danger' ? 'Pericol' : 'Atenție';
    const message = `${check.metric} ${label.toLowerCase()}: ${check.value.toFixed(1)} ${check.unit} în ${device.name}`;

    const { error } = await this.supabaseService.supabase
      .from('alerts')
      .insert({
        device_id: device.id,
        metric: check.metric,
        value: check.value,
        severity,
        message,
      });

    if (error) {
      this.logger.error(`Failed to persist alert: ${error.message}`);
    }
  }

  async getAlertsByDevice(deviceId: string, limit = 20) {
    const { data, error } = await this.supabaseService.supabase
      .from('alerts')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return (data || []).map(row => ({
      id: row.id,
      deviceId: row.device_id,
      metric: row.metric,
      value: row.value,
      severity: row.severity,
      message: row.message,
      isRead: row.is_read,
      timestamp: row.created_at,
    }));
  }

  async markAsRead(alertId: string): Promise<void> {
    await this.supabaseService.supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId);
  }
}
