import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    const { data } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    return data;
  }

  async findById(id: string): Promise<UserRow | null> {
    const { data } = await this.supabaseService.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return data;
  }

  async create(params: { name: string; email: string; passwordHash: string }): Promise<UserRow> {
    const { data, error } = await this.supabaseService.supabase
      .from('users')
      .insert({
        name: params.name,
        email: params.email,
        password_hash: params.passwordHash,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
