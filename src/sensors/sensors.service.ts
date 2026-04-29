import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AlertsService } from '../alerts/alerts.service';
import { SensorsGateway } from '../gateway/sensors.gateway';

export interface SensorPayload {
  co2: number;
  pm25: number;
  temperature: number;
  humidity: number;
}

export interface HistoryEntry {
  deviceId: string;
  co2: number;
  pm25: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

@Injectable()
export class SensorsService {
  private readonly logger = new Logger(SensorsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private alertsService: AlertsService,
    private sensorsGateway: SensorsGateway,
  ) {}

  async saveReading(deviceId: string, data: SensorPayload): Promise<void> {
    const { error } = await this.supabaseService.supabase
      .from('sensor_readings')
      .insert({
        device_id: deviceId,
        co2: data.co2,
        pm25: data.pm25,
        temperature: data.temperature,
        humidity: data.humidity,
      });

    if (error) {
      this.logger.error(`Failed to save reading for ${deviceId}: ${error.message}`);
      return;
    }

    const { data: device } = await this.supabaseService.supabase
      .from('devices')
      .select('id, name, co2_threshold, pm25_threshold')
      .eq('id', deviceId)
      .maybeSingle();

    if (device) {
      await this.alertsService.checkAndCreateAlerts(
        {
          id: device.id,
          name: device.name,
          co2Threshold: device.co2_threshold,
          pm25Threshold: device.pm25_threshold,
        },
        data,
      );
    }

    this.sensorsGateway.emitSensorData({
      deviceId,
      co2: data.co2,
      pm25: data.pm25,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: new Date().toISOString(),
    });
  }

  async getHistory(deviceId: string, from: Date, to: Date): Promise<HistoryEntry[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map(row => ({
      deviceId: row.device_id,
      co2: row.co2,
      pm25: row.pm25,
      temperature: row.temperature,
      humidity: row.humidity,
      timestamp: row.created_at,
    }));
  }

  async getLatest(deviceId: string): Promise<HistoryEntry | null> {
    const { data } = await this.supabaseService.supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;

    return {
      deviceId: data.device_id,
      co2: data.co2,
      pm25: data.pm25,
      temperature: data.temperature,
      humidity: data.humidity,
      timestamp: data.created_at,
    };
  }
}
