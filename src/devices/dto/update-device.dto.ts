import { IsOptional, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class UpdateDeviceDto {
  @IsBoolean()
  @IsOptional()
  windowOpen?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  windowMode?: 'auto' | 'manual';

  @IsBoolean()
  @IsOptional()
  fanOn?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  fanMode?: 'auto' | 'manual';

  @IsBoolean()
  @IsOptional()
  humidifierOn?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  humidifierMode?: 'auto' | 'manual';

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
