import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
export declare class DevicesController {
    private devicesService;
    constructor(devicesService: DevicesService);
    findAll(req: any): Promise<import("./devices.service").DeviceResponse[]>;
    findOne(id: string, req: any): Promise<import("./devices.service").DeviceResponse>;
    create(dto: CreateDeviceDto, req: any): Promise<import("./devices.service").DeviceResponse>;
    update(id: string, dto: UpdateDeviceDto, req: any): Promise<import("./devices.service").DeviceResponse>;
    setFan(id: string, body: {
        on: boolean;
    }): Promise<void>;
    setHumidifier(id: string, body: {
        on: boolean;
    }): Promise<void>;
    setAiMode(id: string, body: {
        mode: 'reaction' | 'prediction' | 'auto';
    }): Promise<void>;
}
