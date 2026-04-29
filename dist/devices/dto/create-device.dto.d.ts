export declare class CreateDeviceDto {
    name: string;
    location?: string;
    windowMode?: 'auto' | 'manual';
    windowOpen?: boolean;
    co2Threshold?: number;
    pm25Threshold?: number;
}
