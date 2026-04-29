import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
  firmware: string;
  lastSync: string | null;
  co2Threshold: number;
  pm25Threshold: number;
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
        user_id: userId,
        name: dto.name,
        location: dto.location ?? '',
        window_mode: dto.windowMode ?? 'manual',
        window_open: dto.windowOpen ?? false,
        co2_threshold: dto.co2Threshold ?? 1000,
        pm25_threshold: dto.pm25Threshold ?? 25,
        status: 'offline',
        firmware: 'v2.1.3',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return this.mapDevice(data);
  }

  async update(id: string, userId: string, dto: UpdateDeviceDto): Promise<DeviceResponse> {
    // Verify ownership before update
    await this.findOne(id, userId);

    const patch: Record<string, any> = {};
    if (dto.windowOpen !== undefined) patch.window_open = dto.windowOpen;
    if (dto.windowMode !== undefined) patch.window_mode = dto.windowMode;
    if (dto.co2Threshold !== undefined) patch.co2_threshold = dto.co2Threshold;
    if (dto.pm25Threshold !== undefined) patch.pm25_threshold = dto.pm25Threshold;

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

  private mapDevice(row: any): DeviceResponse {
    return {
      id: row.id,
      name: row.name,
      location: row.location ?? '',
      status: row.status as 'online' | 'offline',
      windowOpen: row.window_open,
      windowMode: row.window_mode as 'auto' | 'manual',
      firmware: row.firmware ?? 'v2.1.3',
      lastSync: row.last_sync ?? null,
      co2Threshold: row.co2_threshold,
      pm25Threshold: row.pm25_threshold,
    };
  }
}
