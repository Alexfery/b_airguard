"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorsModule = void 0;
const common_1 = require("@nestjs/common");
const sensors_service_1 = require("./sensors.service");
const sensors_controller_1 = require("./sensors.controller");
const database_module_1 = require("../database/database.module");
const alerts_module_1 = require("../alerts/alerts.module");
const gateway_module_1 = require("../gateway/gateway.module");
let SensorsModule = class SensorsModule {
};
exports.SensorsModule = SensorsModule;
exports.SensorsModule = SensorsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, alerts_module_1.AlertsModule, gateway_module_1.GatewayModule],
        providers: [sensors_service_1.SensorsService],
        controllers: [sensors_controller_1.SensorsController],
        exports: [sensors_service_1.SensorsService],
    })
], SensorsModule);
//# sourceMappingURL=sensors.module.js.map