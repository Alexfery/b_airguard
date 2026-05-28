export declare class UpdateDeviceDto {
    windowOpen?: boolean;
    windowMode?: 'auto' | 'manual';
    fanOn?: boolean;
    fanMode?: 'auto' | 'manual';
    humidifierOn?: boolean;
    humidifierMode?: 'auto' | 'manual';
    co2Threshold?: number;
    tvocThreshold?: number;
    pm25Threshold?: number;
    tempThresholdMin?: number;
    tempThresholdMax?: number;
    humidityThresholdMin?: number;
    humidityThresholdMax?: number;
    ai_mode?: 'reaction' | 'prediction' | 'auto';
}
