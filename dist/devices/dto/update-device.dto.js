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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDeviceDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateDeviceDto {
}
exports.UpdateDeviceDto = UpdateDeviceDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeviceDto.prototype, "windowOpen", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['auto', 'manual']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeviceDto.prototype, "windowMode", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeviceDto.prototype, "fanOn", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['auto', 'manual']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeviceDto.prototype, "fanMode", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDeviceDto.prototype, "humidifierOn", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['auto', 'manual']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDeviceDto.prototype, "humidifierMode", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "co2Threshold", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "tvocThreshold", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "pm25Threshold", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "tempThresholdMin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "tempThresholdMax", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "humidityThresholdMin", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateDeviceDto.prototype, "humidityThresholdMax", void 0);
//# sourceMappingURL=update-device.dto.js.map