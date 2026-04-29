import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('supabase.url');
    const key = this.configService.get<string>('supabase.serviceKey');

    if (!url || !key) {
      this.logger.warn('Supabase credentials not configured — DB operations will fail');
    }

    this.client = createClient(url || 'http://placeholder', key || 'placeholder');
    this.logger.log('Supabase client initialized');
  }

  get supabase(): SupabaseClient {
    return this.client;
  }
}
