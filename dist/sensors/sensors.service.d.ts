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
export declare class SensorsService {
    private supabaseService;
    private alertsService;
    private sensorsGateway;
    private readonly logger;
    constructor(supabaseService: SupabaseService, alertsService: AlertsService, sensorsGateway: SensorsGateway);
    saveReading(deviceId: string, data: SensorReadingDto): Promise<void>;
    getHistory(deviceId: string, from: Date, to: Date): Promise<HistoryEntry[]>;
    getLatest(deviceId: string): Promise<HistoryEntry | null>;
    getPredictions(deviceId: string, limit?: number): Promise<PredictionEntry[]>;
}
