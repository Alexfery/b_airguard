import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export interface SensorData {
    deviceId: string;
    co2: number;
    pm25: number;
    temperature: number;
    humidity: number;
    timestamp: string;
}
export declare class SensorsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitSensorData(data: SensorData): void;
}
