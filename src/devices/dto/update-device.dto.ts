import { IsOptional, IsBoolean, IsNumber, IsIn } from 'class-validator';

export class UpdateDeviceDto {
  @IsBoolean()
  @IsOptional()
  windowOpen?: boolean;

  @IsIn(['auto', 'manual'])
  @IsOptional()
  windowMode?: 'auto' | 'manual';

  @IsNumber()
  @IsOptional()
  co2Threshold?: number;

  @IsNumber()
  @IsOptional()
  pm25Threshold?: number;
}
