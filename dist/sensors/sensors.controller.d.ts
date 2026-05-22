import { SensorsService } from './sensors.service';
export declare class SensorsController {
    private sensorsService;
    constructor(sensorsService: SensorsService);
    getHistory(deviceId: string, from: string, to: string): Promise<import("./sensors.service").HistoryEntry[]>;
    getPredictions(deviceId: string, limit: number): Promise<import("./sensors.service").PredictionEntry[]>;
}
