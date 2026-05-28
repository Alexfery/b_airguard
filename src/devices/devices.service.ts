import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { MqttService } from '../mqtt/mqtt.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

export interface DeviceResponse {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  windowOpen: boolean;
  windowMode: 'auto' | 'manual';
  fanOn: boolean;
  fanMode: 'auto' | 'manual';
  humidifierOn: boolean;
  humidifierMode: 'auto' | 'manual';
  co2Threshold: number;
  tvocThreshold: number;
  pm25Threshold: number;
  tempThresholdMin: number;
  tempThresholdMax: number;
  humidityThresholdMin: number;
  humidityThresholdMax: number;
  firmware: string;
  lastSync: string | null;
  aiMode: 'reaction' | 'prediction' | 'auto';
}

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private mqttService: MqttService,
  ) {}

  async findAll(userId: string): Promise<DeviceResponse[]> {
    const { data, error } = await this.supabaseService.supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map(this.mapDevice);
  }

  async findOne(id: string, userId: string): Promise<DeviceResponse> {
    const { data, error } = await this.supabaseService.supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundException(`Device ${id} not found`);
    return this.mapDevice(data);
  }

  async create(userId: string, dto: CreateDeviceDto): Promise<DeviceResponse> {
    const { data, error } = await this.supabaseService.supabase
      .from('devices')
      .insert({
        id: dto.id,
        user_id: userId,
        name: dto.name,
        location: dto.location ?? '',
        window_mode: dto.windowMode ?? 'manual',
        window_open: dto.windowOpen ?? false,
        fan_on: dto.fanOn ?? false,
        fan_mode: dto.fanMode ?? 'manual',
        humidifier_on: dto.humidifierOn ?? false,
        humidifier_mode: dto.humidifierMode ?? 'manual',
        co2_threshold: dto.co2Threshold ?? 1000,
        tvoc_threshold: dto.tvocThreshold ?? 500,
        pm25_threshold: dto.pm25Threshold ?? 25,
        temp_threshold_min: dto.tempThresholdMin ?? 16,
        temp_threshold_max: dto.tempThresholdMax ?? 30,
        humidity_threshold_min: dto.humidityThresholdMin ?? 30,
        humidity_threshold_max: dto.humidityThresholdMax ?? 70,
        status: 'offline',
        firmware: 'v2.1.3',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapDevice(data);
  }

  async update(id: string, userId: string, dto: UpdateDeviceDto): Promise<DeviceResponse> {
    await this.findOne(id, userId);

    const patch: Record<string, any> = {};
    if (dto.windowOpen !== undefined) patch.window_open = dto.windowOpen;
    if (dto.windowMode !== undefined) patch.window_mode = dto.windowMode;
    if (dto.fanOn !== undefined) patch.fan_on = dto.fanOn;
    if (dto.fanMode !== undefined) patch.fan_mode = dto.fanMode;
    if (dto.humidifierOn !== undefined) patch.humidifier_on = dto.humidifierOn;
    if (dto.humidifierMode !== undefined) patch.humidifier_mode = dto.humidifierMode;
    if (dto.co2Threshold !== undefined) patch.co2_threshold = dto.co2Threshold;
    if (dto.tvocThreshold !== undefined) patch.tvoc_threshold = dto.tvocThreshold;
    if (dto.pm25Threshold !== undefined) patch.pm25_threshold = dto.pm25Threshold;
    if (dto.tempThresholdMin !== undefined) patch.temp_threshold_min = dto.tempThresholdMin;
    if (dto.tempThresholdMax !== undefined) patch.temp_threshold_max = dto.tempThresholdMax;
    if (dto.humidityThresholdMin !== undefined) patch.humidity_threshold_min = dto.humidityThresholdMin;
    if (dto.humidityThresholdMax !== undefined) patch.humidity_threshold_max = dto.humidityThresholdMax;

    const { data, error } = await this.supabaseService.supabase
      .from('devices')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (dto.windowOpen !== undefined) {
      this.mqttService.publishWindowCommand(id, dto.windowOpen);
    }

    return this.mapDevice(data);
  }

  async setFan(deviceId: string, on: boolean): Promise<void> {
    this.mqttService.publishFanCommand(deviceId, on);
    await this.supabaseService.supabase
      .from('devices')
      .update({ fan_on: on })
      .eq('id', deviceId);
  }

  async setHumidifier(deviceId: string, on: boolean): Promise<void> {
    this.mqttService.publishHumidifierCommand(deviceId, on);
    await this.supabaseService.supabase
      .from('devices')
      .update({ humidifier_on: on })
      .eq('id', deviceId);
  }

  private mapDevice(row: any): DeviceResponse {
    return {
      id: row.id,
      name: row.name,
      location: row.location ?? '',
      status: row.status as 'online' | 'offline',
      windowOpen: row.window_open,
      windowMode: row.window_mode as 'auto' | 'manual',
      fanOn: row.fan_on ?? false,
      fanMode: (row.fan_mode ?? 'manual') as 'auto' | 'manual',
      humidifierOn: row.humidifier_on ?? false,
      humidifierMode: (row.humidifier_mode ?? 'manual') as 'auto' | 'manual',
      co2Threshold: row.co2_threshold,
      tvocThreshold: row.tvoc_threshold ?? 500,
      pm25Threshold: row.pm25_threshold,
      tempThresholdMin: row.temp_threshold_min ?? 16,
      tempThresholdMax: row.temp_threshold_max ?? 30,
      humidityThresholdMin: row.humidity_threshold_min ?? 30,
      humidityThresholdMax: row.humidity_threshold_max ?? 70,
      firmware: row.firmware ?? 'v2.1.3',
      lastSync: row.last_sync ?? null,
      aiMode: (row.ai_mode ?? 'auto') as 'reaction' | 'prediction' | 'auto',
    };
  }

  async setAiMode(deviceId: string, mode: 'reaction' | 'prediction' | 'auto'): Promise<void> {
    const validModes = ['reaction', 'prediction', 'auto'];
    if (!validModes.includes(mode)) {
      throw new BadRequestException(`Invalid AI mode: ${mode}`);
    }

    const { error } = await this.supabaseService.supabase
      .from('devices')
      .update({ ai_mode: mode })
      .eq('id', deviceId);

    if (error) throw new Error(error.message);

    this.mqttService.publishControlCommand(deviceId, mode);
    this.logger.log(`[DevicesService] AI mode set to ${mode} for device ${deviceId}`);
  }
}
