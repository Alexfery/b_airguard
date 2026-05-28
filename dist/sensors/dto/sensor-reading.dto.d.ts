export declare class SensorReadingDto {
    device?: string;
    location?: string;
    temperature: number;
    humidity: number;
    pressure: number;
    pm25: number;
    hum_state: number;
    fan_state: number;
    ble?: number;
    ts?: number;
}
