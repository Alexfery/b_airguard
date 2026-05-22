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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const devices_service_1 = require("./devices.service");
const create_device_dto_1 = require("./dto/create-device.dto");
const update_device_dto_1 = require("./dto/update-device.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let DevicesController = class DevicesController {
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    findAll(req) {
        return this.devicesService.findAll(req.user.id);
    }
    findOne(id, req) {
        return this.devicesService.findOne(id, req.user.id);
    }
    create(dto, req) {
        return this.devicesService.create(req.user.id, dto);
    }
    update(id, dto, req) {
        return this.devicesService.update(id, req.user.id, dto);
    }
    setFan(id, body) {
        return this.devicesService.setFan(id, body.on);
    }
    setHumidifier(id, body) {
        return this.devicesService.setHumidifier(id, body.on);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_dto_1.CreateDeviceDto, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_device_dto_1.UpdateDeviceDto, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/fan'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "setFan", null);
__decorate([
    (0, common_1.Patch)(':id/humidifier'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DevicesController.prototype, "setHumidifier", null);
exports.DevicesController = DevicesController = __decorate([
    (0, common_1.Controller)('devices'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map