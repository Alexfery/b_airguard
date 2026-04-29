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
    private handleStatus;
    private handleWindowState;
    publishWindowCommand(deviceId: string, open: boolean): void;
    get isConnected(): boolean;
}
