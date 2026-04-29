"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./config/configuration");
const database_module_1 = require("./database/database.module");
const gateway_module_1 = require("./gateway/gateway.module");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const alerts_module_1 = require("./alerts/alerts.module");
const sensors_module_1 = require("./sensors/sensors.module");
const mqtt_module_1 = require("./mqtt/mqtt.module");
const devices_module_1 = require("./devices/devices.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            gateway_module_1.GatewayModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            alerts_module_1.AlertsModule,
            sensors_module_1.SensorsModule,
            mqtt_module_1.MqttModule,
            devices_module_1.DevicesModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map