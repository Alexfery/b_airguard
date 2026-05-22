import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export interface SensorData {
    deviceId: string;
    timestamp: string;
    co2Ppm: number;
    tvocPpb: number;
    pm25Ugm3: number;
    temperatureC: number;
    humidityPct: number;
    pressureAtm: number;
    fanOn: boolean;
    humidifierOn: boolean;
}
export declare class SensorsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitSensorData(data: SensorData): void;
}
