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
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../database/supabase.service");
const sensors_gateway_1 = require("../gateway/sensors.gateway");
let AlertsService = AlertsService_1 = class AlertsService {
    constructor(supabaseService, sensorsGateway) {
        this.supabaseService = supabaseService;
        this.sensorsGateway = sensorsGateway;
        this.logger = new common_1.Logger(AlertsService_1.name);
    }
    async checkAndCreateAlerts(device, reading) {
        const checks = [
            this.checkSimple('CO2', reading.co2_ppm, device.co2Threshold * 0.8, device.co2Threshold, 'ppm'),
            this.checkSimple('TVOC', reading.tvoc_ppb, device.tvocThreshold * 0.6, device.tvocThreshold, 'ppb'),
            this.checkSimple('PM2.5', reading.pm25_ugm3, device.pm25Threshold * 0.6, device.pm25Threshold, 'μg/m³'),
            this.checkRange('Temperatură', reading.temperature_c, device.tempThresholdMin, device.tempThresholdMax, '°C'),
            this.checkRange('Umiditate', reading.humidity_pct, device.humidityThresholdMin, device.humidityThresholdMax, '%'),
        ];
        for (const check of checks) {
            if (check.severity) {
                await this.persistAlert(device, check);
            }
        }
    }
    checkSimple(metric, value, warningThreshold, dangerThreshold, unit) {
        let severity = null;
        let label = '';
        if (value > dangerThreshold) {
            severity = 'danger';
            label = `${metric} pericol: ${value.toFixed(1)} ${unit} (prag: ${dangerThreshold})`;
        }
        else if (value > warningThreshold) {
            severity = 'warning';
            label = `${metric} atenție: ${value.toFixed(1)} ${unit}`;
        }
        return { metric, value, severity, unit, label };
    }
    checkRange(metric, value, min, max, unit) {
        let severity = null;
        let label = '';
        if (value < min || value > max) {
            severity = 'warning';
            label = `${metric} în afara intervalului normal: ${value.toFixed(1)} ${unit} (interval: ${min}–${max})`;
        }
        return { metric, value, severity, unit, label };
    }
    async persistAlert(device, check) {
        const { error } = await this.supabaseService.supabase
            .from('alerts')
            .insert({
            device_id: device.id,
            metric: check.metric,
            value: check.value,
            severity: check.severity,
            message: `${check.label} în ${device.name}`,
        });
        if (error) {
            this.logger.error(`Failed to persist alert: ${error.message}`);
        }
    }
    async getAlertsByDevice(deviceId, limit = 20) {
        const { data, error } = await this.supabaseService.supabase
            .from('alerts')
            .select('*')
            .eq('device_id', deviceId)
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return (data || []).map(row => ({
            id: row.id,
            deviceId: row.device_id,
            metric: row.metric,
            value: row.value,
            severity: row.severity,
            message: row.message,
            isRead: row.is_read,
            timestamp: row.created_at,
        }));
    }
    async markAsRead(alertId) {
        await this.supabaseService.supabase
            .from('alerts')
            .update({ is_read: true })
            .eq('id', alertId);
    }
};
exports.AlertsService = AlertsService;
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        sensors_gateway_1.SensorsGateway])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map