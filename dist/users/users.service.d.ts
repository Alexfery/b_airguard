import { SupabaseService } from '../database/supabase.service';
export interface UserRow {
    id: string;
    email: string;
    name: string;
    password_hash: string;
    role: string;
    created_at: string;
}
export declare class UsersService {
    private supabaseService;
    constructor(supabaseService: SupabaseService);
    findByEmail(email: string): Promise<UserRow | null>;
    findById(id: string): Promise<UserRow | null>;
    create(params: {
        name: string;
        email: string;
        passwordHash: string;
    }): Promise<UserRow>;
}
