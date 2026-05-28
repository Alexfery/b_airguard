import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SensorsService } from '../sensors/sensors.service';
import { SupabaseService } from '../database/supabase.service';
export declare class MqttService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private sensorsService;
    private supabaseService;
    private client;
    private readonly logger;
    constructor(configService: ConfigService, sensorsService: SensorsService, supabaseService: SupabaseService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private connect;
    private handleMessage;
    private handleSensors;
    private handlePrediction;
    private handleStatus;
    private handleWindowState;
    private handleFanState;
    private handleHumidifierState;
    publishWindowCommand(deviceId: string, open: boolean): void;
    publishFanCommand(deviceId: string, on: boolean): void;
    publishHumidifierCommand(deviceId: string, on: boolean): void;
    publishControlCommand(deviceId: string, mode: string): void;
    get isConnected(): boolean;
}
