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
export declare class SensorsService {
    private supabaseService;
    private alertsService;
    private sensorsGateway;
    private readonly logger;
    constructor(supabaseService: SupabaseService, alertsService: AlertsService, sensorsGateway: SensorsGateway);
    saveReading(deviceId: string, data: SensorPayload): Promise<void>;
    getHistory(deviceId: string, from: Date, to: Date): Promise<HistoryEntry[]>;
    getLatest(deviceId: string): Promise<HistoryEntry | null>;
}
