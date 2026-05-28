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
        const record = {
            device_id: deviceId,
            timestamp: new Date().toISOString(),
            co2_ppm: null,
            tvoc_ppb: null,
            pm25_ugm3: data.pm25,
            temperature_c: data.temperature,
            humidity_pct: data.humidity,
            pressure_atm: data.pressure / 1013.25,
            fan_on: data.fan_state === 1,
            humidifier_on: data.hum_state === 1,
        };
        const { error } = await this.supabaseService.supabase
            .from('sensor_readings')
            .insert(record);
        if (error) {
            this.logger.error(`Failed to save reading for ${deviceId}: ${error.message}`);
            return;
        }
        const { data: device } = await this.supabaseService.supabase
            .from('devices')
            .select(`
        id, name,
        co2_threshold, tvoc_threshold, pm25_threshold,
        temp_threshold_min, temp_threshold_max,
        humidity_threshold_min, humidity_threshold_max
      `)
            .eq('id', deviceId)
            .maybeSingle();
        if (device) {
            await this.alertsService.checkAndCreateAlerts({
                id: device.id,
                name: device.name,
                co2Threshold: device.co2_threshold,
                tvocThreshold: device.tvoc_threshold,
                pm25Threshold: device.pm25_threshold,
                tempThresholdMin: device.temp_threshold_min,
                tempThresholdMax: device.temp_threshold_max,
                humidityThresholdMin: device.humidity_threshold_min,
                humidityThresholdMax: device.humidity_threshold_max,
            }, data);
        }
        this.sensorsGateway.emitSensorData({
            deviceId,
            co2Ppm: 0,
            tvocPpb: 0,
            pm25Ugm3: data.pm25,
            temperatureC: data.temperature,
            humidityPct: data.humidity,
            pressureAtm: data.pressure / 1013.25,
            fanOn: data.fan_state === 1,
            humidifierOn: data.hum_state === 1,
            timestamp: new Date().toISOString(),
        });
    }
    async savePrediction(deviceId, data) {
        const record = {
            device_id: deviceId,
            timestamp: new Date().toISOString(),
            pred_co2: null,
            pred_tvoc: null,
            pred_pm25: data.pred_pm25,
            pred_temperature: data.pred_temperature,
            pred_humidity: data.pred_humidity,
            pred_pressure: data.pred_pressure / 1013.25,
        };
        const { error } = await this.supabaseService.supabase
            .from('predictions')
            .insert(record);
        if (error) {
            this.logger.error(`Failed to save prediction for ${deviceId}: ${error.message}`);
        }
    }
    async getHistory(deviceId, from, to) {
        const { data, error } = await this.supabaseService.supabase
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .gte('timestamp', from.toISOString())
            .lte('timestamp', to.toISOString())
            .order('timestamp', { ascending: true });
        if (error)
            throw new Error(error.message);
        return (data || []).map(row => ({
            deviceId: row.device_id,
            co2Ppm: row.co2_ppm,
            tvocPpb: row.tvoc_ppb,
            pm25Ugm3: row.pm25_ugm3,
            temperatureC: row.temperature_c,
            humidityPct: row.humidity_pct,
            pressureAtm: row.pressure_atm,
            fanOn: row.fan_on,
            humidifierOn: row.humidifier_on,
            timestamp: row.timestamp,
        }));
    }
    async getLatest(deviceId) {
        const { data } = await this.supabaseService.supabase
            .from('sensor_readings')
            .select('*')
            .eq('device_id', deviceId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (!data)
            return null;
        return {
            deviceId: data.device_id,
            co2Ppm: data.co2_ppm,
            tvocPpb: data.tvoc_ppb,
            pm25Ugm3: data.pm25_ugm3,
            temperatureC: data.temperature_c,
            humidityPct: data.humidity_pct,
            pressureAtm: data.pressure_atm,
            fanOn: data.fan_on,
            humidifierOn: data.humidifier_on,
            timestamp: data.timestamp,
        };
    }
    async getPredictions(deviceId, limit = 20) {
        const { data, error } = await this.supabaseService.supabase
            .from('predictions')
            .select('*')
            .eq('device_id', deviceId)
            .order('timestamp', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return (data || []).map(row => ({
            deviceId: row.device_id,
            timestamp: row.timestamp,
            predCo2: row.pred_co2,
            predTvoc: row.pred_tvoc,
            predPm25: row.pred_pm25,
            predTemperature: row.pred_temperature,
            predHumidity: row.pred_humidity,
            predPressure: row.pred_pressure,
        }));
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