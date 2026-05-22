import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { SensorsService } from '../sensors/sensors.service';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient | null = null;
  private readonly logger = new Logger(MqttService.name);

  constructor(
    private configService: ConfigService,
    private sensorsService: SensorsService,
    private supabaseService: SupabaseService,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  private connect() {
    const host = this.configService.get<string>('mqtt.host');
    const port = this.configService.get<number>('mqtt.port');
    const username = this.configService.get<string>('mqtt.username');
    const password = this.configService.get<string>('mqtt.password');
    const clientId = this.configService.get<string>('mqtt.clientId');

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

    this.client.on('message', (topic: string, payload: Buffer) => {
      this.handleMessage(topic, payload.toString()).catch(err =>
        this.logger.error(`Message handler error on ${topic}: ${err.message}`),
      );
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`MQTT error: ${err.message}`);
    });

    this.client.on('reconnect', () => {
      this.logger.log('MQTT reconnecting...');
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT client offline');
    });
  }

  private async handleMessage(topic: string, payloadStr: string): Promise<void> {
    let payload: any;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      this.logger.error(`Invalid JSON on topic ${topic}`);
      return;
    }

    const parts = topic.split('/');
    if (parts.length < 3 || parts[0] !== 'airguard') return;

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

  private async handleSensors(deviceId: string, payload: any): Promise<void> {
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

  private async handleStatus(deviceId: string, payload: any): Promise<void> {
    const status = payload.online ? 'online' : 'offline';
    await this.supabaseService.supabase
      .from('devices')
      .update({ status, last_sync: new Date().toISOString() })
      .eq('id', deviceId);
    this.logger.log(`Device ${deviceId} status: ${status}`);
  }

  private async handleWindowState(deviceId: string, payload: any): Promise<void> {
    await this.supabaseService.supabase
      .from('devices')
      .update({ window_open: payload.open })
      .eq('id', deviceId);
    this.logger.log(`Device ${deviceId} window confirmed: ${payload.open ? 'open' : 'closed'}`);
  }

  private async handleFanState(deviceId: string, payload: any): Promise<void> {
    await this.supabaseService.supabase
      .from('devices')
      .update({ fan_on: payload.on })
      .eq('id', deviceId);
    this.logger.log(`Device ${deviceId} fan confirmed: ${payload.on ? 'on' : 'off'}`);
  }

  private async handleHumidifierState(deviceId: string, payload: any): Promise<void> {
    await this.supabaseService.supabase
      .from('devices')
      .update({ humidifier_on: payload.on })
      .eq('id', deviceId);
    this.logger.log(`Device ${deviceId} humidifier confirmed: ${payload.on ? 'on' : 'off'}`);
  }

  publishWindowCommand(deviceId: string, open: boolean): void {
    if (!this.client?.connected) {
      this.logger.warn(`MQTT not connected — cannot send window command to ${deviceId}`);
      return;
    }
    const topic = `airguard/${deviceId}/window/cmd`;
    const payload = JSON.stringify({ open });
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
      } else {
        this.logger.log(`Window command sent: ${topic} → ${payload}`);
      }
    });
  }

  publishFanCommand(deviceId: string, on: boolean): void {
    if (!this.client?.connected) {
      this.logger.warn(`MQTT not connected — cannot send fan command to ${deviceId}`);
      return;
    }
    const topic = `airguard/${deviceId}/fan/cmd`;
    const payload = JSON.stringify({ on });
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
      } else {
        this.logger.log(`Fan command sent: ${topic} → ${payload}`);
      }
    });
  }

  publishHumidifierCommand(deviceId: string, on: boolean): void {
    if (!this.client?.connected) {
      this.logger.warn(`MQTT not connected — cannot send humidifier command to ${deviceId}`);
      return;
    }
    const topic = `airguard/${deviceId}/humidifier/cmd`;
    const payload = JSON.stringify({ on });
    this.client.publish(topic, payload, { qos: 1 }, (err) => {
      if (err) {
        this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
      } else {
        this.logger.log(`Humidifier command sent: ${topic} → ${payload}`);
      }
    });
  }

  get isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}
