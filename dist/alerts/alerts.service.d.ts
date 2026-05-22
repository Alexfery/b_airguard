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
export declare class AlertsService {
    private supabaseService;
    private sensorsGateway;
    private readonly logger;
    constructor(supabaseService: SupabaseService, sensorsGateway: SensorsGateway);
    checkAndCreateAlerts(device: DeviceThresholds, reading: SensorReadingDto): Promise<void>;
    private checkSimple;
    private checkRange;
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
