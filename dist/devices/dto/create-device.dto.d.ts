export declare class CreateDeviceDto {
    id: string;
    name: string;
    location?: string;
    windowMode?: 'auto' | 'manual';
    windowOpen?: boolean;
    fanMode?: 'auto' | 'manual';
    fanOn?: boolean;
    humidifierMode?: 'auto' | 'manual';
    humidifierOn?: boolean;
    co2Threshold?: number;
    tvocThreshold?: number;
    pm25Threshold?: number;
    tempThresholdMin?: number;
    tempThresholdMax?: number;
    humidityThresholdMin?: number;
    humidityThresholdMax?: number;
}
