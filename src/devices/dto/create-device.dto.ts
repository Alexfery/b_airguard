import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, MinLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MinLength(1)
  id: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  windowMode?: 'auto' | 'manual';

  @IsBoolean()
  @IsOptional()
  windowOpen?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  fanMode?: 'auto' | 'manual';

  @IsBoolean()
  @IsOptional()
  fanOn?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  humidifierMode?: 'auto' | 'manual';

  @IsBoolean()
  @IsOptional()
  humidifierOn?: boolean;

  @IsNumber()
  @IsOptional()
  co2Threshold?: number;

  @IsNumber()
  @IsOptional()
  tvocThreshold?: number;

  @IsNumber()
  @IsOptional()
  pm25Threshold?: number;

  @IsNumber()
  @IsOptional()
  tempThresholdMin?: number;

  @IsNumber()
  @IsOptional()
  tempThresholdMax?: number;

  @IsNumber()
  @IsOptional()
  humidityThresholdMin?: number;

  @IsNumber()
  @IsOptional()
  humidityThresholdMax?: number;
}
