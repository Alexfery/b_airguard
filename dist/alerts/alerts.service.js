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
        this.TEMP_DANGER = 30;
        this.TEMP_WARNING = 26;
        this.HUMIDITY_DANGER = 70;
        this.HUMIDITY_WARNING = 60;
    }
    async checkAndCreateAlerts(device, reading) {
        const checks = [
            {
                metric: 'CO2',
                value: reading.co2,
                dangerThreshold: device.co2Threshold,
                warningThreshold: device.co2Threshold * 0.8,
                unit: 'ppm',
            },
            {
                metric: 'PM2.5',
                value: reading.pm25,
                dangerThreshold: device.pm25Threshold,
                warningThreshold: device.pm25Threshold * 0.8,
                unit: 'μg/m³',
            },
            {
                metric: 'temperature',
                value: reading.temperature,
                dangerThreshold: this.TEMP_DANGER,
                warningThreshold: this.TEMP_WARNING,
                unit: '°C',
            },
            {
                metric: 'humidity',
                value: reading.humidity,
                dangerThreshold: this.HUMIDITY_DANGER,
                warningThreshold: this.HUMIDITY_WARNING,
                unit: '%',
            },
        ];
        for (const check of checks) {
            if (check.value > check.dangerThreshold) {
                await this.persistAlert(device, check, 'danger');
            }
            else if (check.value > check.warningThreshold) {
                await this.persistAlert(device, check, 'warning');
            }
        }
    }
    async persistAlert(device, check, severity) {
        const label = severity === 'danger' ? 'Pericol' : 'Atenție';
        const message = `${check.metric} ${label.toLowerCase()}: ${check.value.toFixed(1)} ${check.unit} în ${device.name}`;
        const { error } = await this.supabaseService.supabase
            .from('alerts')
            .insert({
            device_id: device.id,
            metric: check.metric,
            value: check.value,
            severity,
            message,
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