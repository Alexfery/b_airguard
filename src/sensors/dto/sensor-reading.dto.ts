export class SensorReadingDto {
  co2_ppm: number;
  tvoc_ppb: number;
  pm25_ugm3: number;
  temperature_c: number;
  humidity_pct: number;
  pressure_atm: number;
  fan_on: boolean;
  humidifier_on: boolean;
}
