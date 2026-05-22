import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private alertsService;
    constructor(alertsService: AlertsService);
    getByDevice(deviceId: string, limit: number): Promise<{
        id: any;
        deviceId: any;
        metric: any;
        value: any;
        severity: any;
        message: any;
        isRead: any;
        timestamp: any;
    }[]>;
    markAsRead(id: string): Promise<void>;
}
