"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DevicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../database/supabase.service");
const mqtt_service_1 = require("../mqtt/mqtt.service");
let DevicesService = DevicesService_1 = class DevicesService {
    constructor(supabaseService, mqttService) {
        this.supabaseService = supabaseService;
        this.mqttService = mqttService;
        this.logger = new common_1.Logger(DevicesService_1.name);
    }
    async findAll(userId) {
        const { data, error } = await this.supabaseService.supabase
            .from('devices')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return (data || []).map(this.mapDevice);
    }
    async findOne(id, userId) {
        const { data, error } = await this.supabaseService.supabase
            .from('devices')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        if (!data)
            throw new common_1.NotFoundException(`Device ${id} not found`);
        return this.mapDevice(data);
    }
    async create(userId, dto) {
        const { data, error } = await this.supabaseService.supabase
            .from('devices')
            .insert({
            id: dto.id,
            user_id: userId,
            name: dto.name,
            location: dto.location ?? '',
            window_mode: dto.windowMode ?? 'manual',
            window_open: dto.windowOpen ?? false,
            fan_on: dto.fanOn ?? false,
            fan_mode: dto.fanMode ?? 'manual',
            humidifier_on: dto.humidifierOn ?? false,
            humidifier_mode: dto.humidifierMode ?? 'manual',
            co2_threshold: dto.co2Threshold ?? 1000,
            tvoc_threshold: dto.tvocThreshold ?? 500,
            pm25_threshold: dto.pm25Threshold ?? 25,
            temp_threshold_min: dto.tempThresholdMin ?? 16,
            temp_threshold_max: dto.tempThresholdMax ?? 30,
            humidity_threshold_min: dto.humidityThresholdMin ?? 30,
            humidity_threshold_max: dto.humidityThresholdMax ?? 70,
            status: 'offline',
            firmware: 'v2.1.3',
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return this.mapDevice(data);
    }
    async update(id, userId, dto) {
        await this.findOne(id, userId);
        const patch = {};
        if (dto.windowOpen !== undefined)
            patch.window_open = dto.windowOpen;
        if (dto.windowMode !== undefined)
            patch.window_mode = dto.windowMode;
        if (dto.fanOn !== undefined)
            patch.fan_on = dto.fanOn;
        if (dto.fanMode !== undefined)
            patch.fan_mode = dto.fanMode;
        if (dto.humidifierOn !== undefined)
            patch.humidifier_on = dto.humidifierOn;
        if (dto.humidifierMode !== undefined)
            patch.humidifier_mode = dto.humidifierMode;
        if (dto.co2Threshold !== undefined)
            patch.co2_threshold = dto.co2Threshold;
        if (dto.tvocThreshold !== undefined)
            patch.tvoc_threshold = dto.tvocThreshold;
        if (dto.pm25Threshold !== undefined)
            patch.pm25_threshold = dto.pm25Threshold;
        if (dto.tempThresholdMin !== undefined)
            patch.temp_threshold_min = dto.tempThresholdMin;
        if (dto.tempThresholdMax !== undefined)
            patch.temp_threshold_max = dto.tempThresholdMax;
        if (dto.humidityThresholdMin !== undefined)
            patch.humidity_threshold_min = dto.humidityThresholdMin;
        if (dto.humidityThresholdMax !== undefined)
            patch.humidity_threshold_max = dto.humidityThresholdMax;
        const { data, error } = await this.supabaseService.supabase
            .from('devices')
            .update(patch)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        if (dto.windowOpen !== undefined) {
            this.mqttService.publishWindowCommand(id, dto.windowOpen);
        }
        return this.mapDevice(data);
    }
    async setFan(deviceId, on) {
        this.mqttService.publishFanCommand(deviceId, on);
        await this.supabaseService.supabase
            .from('devices')
            .update({ fan_on: on })
            .eq('id', deviceId);
    }
    async setHumidifier(deviceId, on) {
        this.mqttService.publishHumidifierCommand(deviceId, on);
        await this.supabaseService.supabase
            .from('devices')
            .update({ humidifier_on: on })
            .eq('id', deviceId);
    }
    mapDevice(row) {
        return {
            id: row.id,
            name: row.name,
            location: row.location ?? '',
            status: row.status,
            windowOpen: row.window_open,
            windowMode: row.window_mode,
            fanOn: row.fan_on ?? false,
            fanMode: (row.fan_mode ?? 'manual'),
            humidifierOn: row.humidifier_on ?? false,
            humidifierMode: (row.humidifier_mode ?? 'manual'),
            co2Threshold: row.co2_threshold,
            tvocThreshold: row.tvoc_threshold ?? 500,
            pm25Threshold: row.pm25_threshold,
            tempThresholdMin: row.temp_threshold_min ?? 16,
            tempThresholdMax: row.temp_threshold_max ?? 30,
            humidityThresholdMin: row.humidity_threshold_min ?? 30,
            humidityThresholdMax: row.humidity_threshold_max ?? 70,
            firmware: row.firmware ?? 'v2.1.3',
            lastSync: row.last_sync ?? null,
        };
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = DevicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        mqtt_service_1.MqttService])
], DevicesService);
//# sourceMappingURL=devices.service.js.map