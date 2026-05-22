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
}
export declare class DevicesService {
    private supabaseService;
    private mqttService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, mqttService: MqttService);
    findAll(userId: string): Promise<DeviceResponse[]>;
    findOne(id: string, userId: string): Promise<DeviceResponse>;
    create(userId: string, dto: CreateDeviceDto): Promise<DeviceResponse>;
    update(id: string, userId: string, dto: UpdateDeviceDto): Promise<DeviceResponse>;
    setFan(deviceId: string, on: boolean): Promise<void>;
    setHumidifier(deviceId: string, on: boolean): Promise<void>;
    private mapDevice;
}
