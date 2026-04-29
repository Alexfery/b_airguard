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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../database/supabase.service");
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async findByEmail(email) {
        const { data } = await this.supabaseService.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();
        return data;
    }
    async findById(id) {
        const { data } = await this.supabaseService.supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        return data;
    }
    async create(params) {
        const { data, error } = await this.supabaseService.supabase
            .from('users')
            .insert({
            name: params.name,
            email: params.email,
            password_hash: params.passwordHash,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map