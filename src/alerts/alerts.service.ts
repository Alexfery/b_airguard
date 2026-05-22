import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { SensorsGateway } from '../gateway/sensors.gateway';
import { SensorReadingDto } from '../sensors/dto/sensor-reading.dto';

export interface DeviceThresholds {
  id: string;
  name: string;
  co2Threshold: number;
  tvocThreshold: number;
  pm25Threshold: number;
  tempThresholdMin: number;
  tempThresholdMax: number;
  humidityThresholdMin: number;
  humidityThresholdMax: number;
}

interface AlertCheck {
  metric: string;
  value: number;
  severity: 'warning' | 'danger' | null;
  unit: string;
  label: string;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private sensorsGateway: SensorsGateway,
  ) {}

  async checkAndCreateAlerts(device: DeviceThresholds, reading: SensorReadingDto): Promise<void> {
    const checks: AlertCheck[] = [
      this.checkSimple('CO2', reading.co2_ppm, device.co2Threshold * 0.8, device.co2Threshold, 'ppm'),
      this.checkSimple('TVOC', reading.tvoc_ppb, device.tvocThreshold * 0.6, device.tvocThreshold, 'ppb'),
      this.checkSimple('PM2.5', reading.pm25_ugm3, device.pm25Threshold * 0.6, device.pm25Threshold, 'μg/m³'),
      this.checkRange('Temperatură', reading.temperature_c, device.tempThresholdMin, device.tempThresholdMax, '°C'),
      this.checkRange('Umiditate', reading.humidity_pct, device.humidityThresholdMin, device.humidityThresholdMax, '%'),
    ];

    for (const check of checks) {
      if (check.severity) {
        await this.persistAlert(device, check);
      }
    }
  }

  private checkSimple(
    metric: string,
    value: number,
    warningThreshold: number,
    dangerThreshold: number,
    unit: string,
  ): AlertCheck {
    let severity: 'warning' | 'danger' | null = null;
    let label = '';
    if (value > dangerThreshold) {
      severity = 'danger';
      label = `${metric} pericol: ${value.toFixed(1)} ${unit} (prag: ${dangerThreshold})`;
    } else if (value > warningThreshold) {
      severity = 'warning';
      label = `${metric} atenție: ${value.toFixed(1)} ${unit}`;
    }
    return { metric, value, severity, unit, label };
  }

  private checkRange(
    metric: string,
    value: number,
    min: number,
    max: number,
    unit: string,
  ): AlertCheck {
    let severity: 'warning' | 'danger' | null = null;
    let label = '';
    if (value < min || value > max) {
      severity = 'warning';
      label = `${metric} în afara intervalului normal: ${value.toFixed(1)} ${unit} (interval: ${min}–${max})`;
    }
    return { metric, value, severity, unit, label };
  }

  private async persistAlert(device: DeviceThresholds, check: AlertCheck): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('alerts')
      .insert({
        device_id: device.id,
        metric: check.metric,
        value: check.value,
        severity: check.severity,
        message: `${check.label} în ${device.name}`,
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
