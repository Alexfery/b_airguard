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
export declare class AlertsService {
    private supabaseService;
    private sensorsGateway;
    private readonly logger;
    private readonly TEMP_DANGER;
    private readonly TEMP_WARNING;
    private readonly HUMIDITY_DANGER;
    private readonly HUMIDITY_WARNING;
    constructor(supabaseService: SupabaseService, sensorsGateway: SensorsGateway);
    checkAndCreateAlerts(device: DeviceThresholds, reading: SensorReading): Promise<void>;
    private persistAlert;
    getAlertsByDevice(deviceId: string, limit?: number): Promise<{
        id: any;
        deviceId: any;
        metric: any;
        value: any;
        severity: any;
        message: any;
        isRead: any;
        timestamp: any;
    }[]>;
    markAsRead(alertId: string): Promise<void>;
}
