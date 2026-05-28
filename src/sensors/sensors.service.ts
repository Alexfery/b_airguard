import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AlertsService } from '../alerts/alerts.service';
import { SensorsGateway } from '../gateway/sensors.gateway';
import { SensorReadingDto } from './dto/sensor-reading.dto';

export interface HistoryEntry {
  deviceId: string;
  co2Ppm: number;
  tvocPpb: number;
  pm25Ugm3: number;
  temperatureC: number;
  humidityPct: number;
  pressureAtm: number;
  fanOn: boolean;
  humidifierOn: boolean;
  timestamp: string;
}

export interface PredictionEntry {
  deviceId: string;
  timestamp: string;
  predCo2: number;
  predTvoc: number;
  predPm25: number;
  predTemperature: number;
  predHumidity: number;
  predPressure: number;
}

@Injectable()
export class SensorsService {
  private readonly logger = new Logger(SensorsService.name);

  constructor(
    private supabaseService: SupabaseService,
    private alertsService: AlertsService,
    private sensorsGateway: SensorsGateway,
  ) {}

  async saveReading(deviceId: string, data: SensorReadingDto): Promise<void> {
    const record = {
      device_id:     deviceId,
      timestamp:     new Date().toISOString(),
      co2_ppm:       null,
      tvoc_ppb:      null,
      pm25_ugm3:     data.pm25,
      temperature_c: data.temperature,
      humidity_pct:  data.humidity,
      pressure_atm:  data.pressure / 1013.25,
      fan_on:        data.fan_state === 1,
      humidifier_on: data.hum_state === 1,
    };

    const { error } = await this.supabaseService.supabase
      .from('sensor_readings')
      .insert(record);

    if (error) {
      this.logger.error(`Failed to save reading for ${deviceId}: ${error.message}`);
      return;
    }

    const { data: device } = await this.supabaseService.supabase
      .from('devices')
      .select(`
        id, name,
        co2_threshold, tvoc_threshold, pm25_threshold,
        temp_threshold_min, temp_threshold_max,
        humidity_threshold_min, humidity_threshold_max
      `)
      .eq('id', deviceId)
      .maybeSingle();

    if (device) {
      await this.alertsService.checkAndCreateAlerts(
        {
          id: device.id,
          name: device.name,
          co2Threshold: device.co2_threshold,
          tvocThreshold: device.tvoc_threshold,
          pm25Threshold: device.pm25_threshold,
          tempThresholdMin: device.temp_threshold_min,
          tempThresholdMax: device.temp_threshold_max,
          humidityThresholdMin: device.humidity_threshold_min,
          humidityThresholdMax: device.humidity_threshold_max,
        },
        data,
      );
    }

    this.sensorsGateway.emitSensorData({
      deviceId,
      co2Ppm: 0,
      tvocPpb: 0,
      pm25Ugm3: data.pm25,
      temperatureC: data.temperature,
      humidityPct: data.humidity,
      pressureAtm: data.pressure / 1013.25,
      fanOn: data.fan_state === 1,
      humidifierOn: data.hum_state === 1,
      timestamp: new Date().toISOString(),
    });
  }

  async savePrediction(deviceId: string, data: any): Promise<void> {
    const record = {
      device_id:        deviceId,
      timestamp:        new Date().toISOString(),
      pred_co2:         null,
      pred_tvoc:        null,
      pred_pm25:        data.pred_pm25,
      pred_temperature: data.pred_temperature,
      pred_humidity:    data.pred_humidity,
      pred_pressure:    data.pred_pressure / 1013.25,
    };

    const { error } = await this.supabaseService.supabase
      .from('predictions')
      .insert(record);

    if (error) {
      this.logger.error(`Failed to save prediction for ${deviceId}: ${error.message}`);
    }
  }

  async getHistory(deviceId: string, from: Date, to: Date): Promise<HistoryEntry[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .gte('timestamp', from.toISOString())
      .lte('timestamp', to.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map(row => ({
      deviceId: row.device_id,
      co2Ppm: row.co2_ppm,
      tvocPpb: row.tvoc_ppb,
      pm25Ugm3: row.pm25_ugm3,
      temperatureC: row.temperature_c,
      humidityPct: row.humidity_pct,
      pressureAtm: row.pressure_atm,
      fanOn: row.fan_on,
      humidifierOn: row.humidifier_on,
      timestamp: row.timestamp,
    }));
  }

  async getLatest(deviceId: string): Promise<HistoryEntry | null> {
    const { data } = await this.supabaseService.supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return null;

    return {
      deviceId: data.device_id,
      co2Ppm: data.co2_ppm,
      tvocPpb: data.tvoc_ppb,
      pm25Ugm3: data.pm25_ugm3,
      temperatureC: data.temperature_c,
      humidityPct: data.humidity_pct,
      pressureAtm: data.pressure_atm,
      fanOn: data.fan_on,
      humidifierOn: data.humidifier_on,
      timestamp: data.timestamp,
    };
  }

  async getPredictions(deviceId: string, limit = 20): Promise<PredictionEntry[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('predictions')
      .select('*')
      .eq('device_id', deviceId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    return (data || []).map(row => ({
      deviceId: row.device_id,
      timestamp: row.timestamp,
      predCo2: row.pred_co2,
      predTvoc: row.pred_tvoc,
      predPm25: row.pred_pm25,
      predTemperature: row.pred_temperature,
      predHumidity: row.pred_humidity,
      predPressure: row.pred_pressure,
    }));
  }
}
