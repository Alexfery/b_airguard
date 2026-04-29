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
var SensorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../database/supabase.service");
const alerts_service_1 = require("../alerts/alerts.service");
const sensors_gateway_1 = require("../gateway/sensors.gateway");
let SensorsService = SensorsService_1 = class SensorsService {
    constructor(supabaseService, alertsService, sensorsGateway) {
        this.supabaseService = supabaseService;
        this.alertsService = alertsService;
        this.sensorsGateway = sensorsGateway;
        this.logger = new common_1.Logger(SensorsService_1.name);
    }
    async saveReading(deviceId, data) {
        const { error } = await this.supabaseService.supabase
            .from('sensor_readings')
            .insert({
            device_id: deviceId,
            co2: data.co2,
            pm25: data.pm25,
            temperature: data.temperature,
            humidity: data.humidity,
        });
        if (error) {
            this.logger.error(`Failed to save reading for ${deviceId}: ${error.message}`);
            return;
        }
        const { data: device } = await this.supabaseService.supabase
            .from('devices')
            .select('id, name, co2_threshold, pm25_threshold')
            .eq('id', deviceId)
            .maybeSingle();
        if (device) {
            await this.alertsService.checkAndCreateAlerts({
                id: device.id,
                name: device.name,
                co2Threshold: device.co2_threshold,
                pm25Threshold: device.pm25_threshold,
            }, data);
        }
        this.sensorsGateway.emitSensorData({
            deviceId,
            co2: data.co2,
            pm25: data.pm25,
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: new Date().toISOString(),
        });
    }
    async getHistory(deviceId, from, to) {
        const { data, error } = await this.supabaseService.supabase
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .gte('created_at', from.toISOString())
            .lte('created_at', to.toISOString())
            .order('created_at', { ascending: true });
        if (error)
            throw new Error(error.message);
        return (data || []).map(row => ({
            deviceId: row.device_id,
            co2: row.co2,
            pm25: row.pm25,
            temperature: row.temperature,
            humidity: row.humidity,
            timestamp: row.created_at,
        }));
    }
    async getLatest(deviceId) {
        const { data } = await this.supabaseService.supabase
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!data)
            return null;
        return {
            deviceId: data.device_id,
            co2: data.co2,
            pm25: data.pm25,
            temperature: data.temperature,
            humidity: data.humidity,
            timestamp: data.created_at,
        };
    }
};
exports.SensorsService = SensorsService;
exports.SensorsService = SensorsService = SensorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        alerts_service_1.AlertsService,
        sensors_gateway_1.SensorsGateway])
], SensorsService);
//# sourceMappingURL=sensors.service.js.map