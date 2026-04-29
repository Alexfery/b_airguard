import { IsString, IsOptional, IsBoolean, IsNumber, IsIn, MinLength } from 'class-validator';

export class CreateDeviceDto {
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

  @IsNumber()
  @IsOptional()
  co2Threshold?: number;

  @IsNumber()
  @IsOptional()
  pm25Threshold?: number;
}
