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
var MqttService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mqtt = require("mqtt");
const sensors_service_1 = require("../sensors/sensors.service");
const supabase_service_1 = require("../database/supabase.service");
let MqttService = MqttService_1 = class MqttService {
    constructor(configService, sensorsService, supabaseService) {
        this.configService = configService;
        this.sensorsService = sensorsService;
        this.supabaseService = supabaseService;
        this.client = null;
        this.logger = new common_1.Logger(MqttService_1.name);
    }
    onModuleInit() {
        this.connect();
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.end();
            this.logger.log('MQTT client disconnected');
        }
    }
    connect() {
        const host = this.configService.get('mqtt.host');
        const port = this.configService.get('mqtt.port');
        const username = this.configService.get('mqtt.username');
        const password = this.configService.get('mqtt.password');
        const clientId = this.configService.get('mqtt.clientId');
        if (!host) {
            this.logger.warn('MQTT_HOST not configured — MQTT bridge disabled');
            return;
        }
        const brokerUrl = `mqtts://${host}:${port}`;
        this.logger.log(`Connecting to MQTT broker: ${brokerUrl}`);
        this.client = mqtt.connect(brokerUrl, {
            username,
            password,
            clientId: `${clientId}-${Date.now()}`,
            rejectUnauthorized: true,
            reconnectPeriod: 5000,
            connectTimeout: 10000,
        });
        this.client.on('connect', () => {
            this.logger.log('MQTT connected');
            this.client.subscribe('airguard/+/sensors', { qos: 1 });
            this.client.subscribe('airguard/+/status', { qos: 1 });
            this.client.subscribe('airguard/+/window/state', { qos: 1 });
            this.client.subscribe('airguard/+/fan/state', { qos: 1 });
            this.client.subscribe('airguard/+/humidifier/state', { qos: 1 });
            this.logger.log('Subscribed to airguard/# topics');
        });
        this.client.on('message', (topic, payload) => {
            this.handleMessage(topic, payload.toString()).catch(err => this.logger.error(`Message handler error on ${topic}: ${err.message}`));
        });
        this.client.on('error', (err) => {
            this.logger.error(`MQTT error: ${err.message}`);
        });
        this.client.on('reconnect', () => {
            this.logger.log('MQTT reconnecting...');
        });
        this.client.on('offline', () => {
            this.logger.warn('MQTT client offline');
        });
    }
    async handleMessage(topic, payloadStr) {
        let payload;
        try {
            payload = JSON.parse(payloadStr);
        }
        catch {
            this.logger.error(`Invalid JSON on topic ${topic}`);
            return;
        }
        const parts = topic.split('/');
        if (parts.length < 3 || parts[0] !== 'airguard')
            return;
        const deviceId = parts[1];
        const subtopic = parts.slice(2).join('/');
        switch (subtopic) {
            case 'sensors':
                await this.handleSensors(deviceId, payload);
                break;
            case 'status':
                await this.handleStatus(deviceId, payload);
                break;
            case 'window/state':
                await this.handleWindowState(deviceId, payload);
                break;
            case 'fan/state':
                await this.handleFanState(deviceId, payload);
                break;
            case 'humidifier/state':
                await this.handleHumidifierState(deviceId, payload);
                break;
            default:
                this.logger.debug(`Unhandled subtopic: ${subtopic}`);
        }
    }
    async handleSensors(deviceId, payload) {
        const { co2_ppm, tvoc_ppb, pm25_ugm3, temperature_c, humidity_pct, pressure_atm, fan_on, humidifier_on } = payload;
        if (co2_ppm == null || pm25_ugm3 == null || temperature_c == null || humidity_pct == null) {
            this.logger.warn(`Incomplete sensor payload for ${deviceId}`);
            return;
        }
        await this.sensorsService.saveReading(deviceId, {
            co2_ppm,
            tvoc_ppb: tvoc_ppb ?? 0,
            pm25_ugm3,
            temperature_c,
            humidity_pct,
            pressure_atm: pressure_atm ?? 1.013,
            fan_on: fan_on ?? false,
            humidifier_on: humidifier_on ?? false,
        });
    }
    async handleStatus(deviceId, payload) {
        const status = payload.online ? 'online' : 'offline';
        await this.supabaseService.supabase
            .from('devices')
            .update({ status, last_sync: new Date().toISOString() })
            .eq('id', deviceId);
        this.logger.log(`Device ${deviceId} status: ${status}`);
    }
    async handleWindowState(deviceId, payload) {
        await this.supabaseService.supabase
            .from('devices')
            .update({ window_open: payload.open })
            .eq('id', deviceId);
        this.logger.log(`Device ${deviceId} window confirmed: ${payload.open ? 'open' : 'closed'}`);
    }
    async handleFanState(deviceId, payload) {
        await this.supabaseService.supabase
            .from('devices')
            .update({ fan_on: payload.on })
            .eq('id', deviceId);
        this.logger.log(`Device ${deviceId} fan confirmed: ${payload.on ? 'on' : 'off'}`);
    }
    async handleHumidifierState(deviceId, payload) {
        await this.supabaseService.supabase
            .from('devices')
            .update({ humidifier_on: payload.on })
            .eq('id', deviceId);
        this.logger.log(`Device ${deviceId} humidifier confirmed: ${payload.on ? 'on' : 'off'}`);
    }
    publishWindowCommand(deviceId, open) {
        if (!this.client?.connected) {
            this.logger.warn(`MQTT not connected — cannot send window command to ${deviceId}`);
            return;
        }
        const topic = `airguard/${deviceId}/window/cmd`;
        const payload = JSON.stringify({ open });
        this.client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
            }
            else {
                this.logger.log(`Window command sent: ${topic} → ${payload}`);
            }
        });
    }
    publishFanCommand(deviceId, on) {
        if (!this.client?.connected) {
            this.logger.warn(`MQTT not connected — cannot send fan command to ${deviceId}`);
            return;
        }
        const topic = `airguard/${deviceId}/fan/cmd`;
        const payload = JSON.stringify({ on });
        this.client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
            }
            else {
                this.logger.log(`Fan command sent: ${topic} → ${payload}`);
            }
        });
    }
    publishHumidifierCommand(deviceId, on) {
        if (!this.client?.connected) {
            this.logger.warn(`MQTT not connected — cannot send humidifier command to ${deviceId}`);
            return;
        }
        const topic = `airguard/${deviceId}/humidifier/cmd`;
        const payload = JSON.stringify({ on });
        this.client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
            }
            else {
                this.logger.log(`Humidifier command sent: ${topic} → ${payload}`);
            }
        });
    }
    get isConnected() {
        return this.client?.connected ?? false;
    }
};
exports.MqttService = MqttService;
exports.MqttService = MqttService = MqttService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        sensors_service_1.SensorsService,
        supabase_service_1.SupabaseService])
], MqttService);
//# sourceMappingURL=mqtt.service.js.map