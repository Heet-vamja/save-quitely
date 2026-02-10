import { IsString, IsNumber, IsNotEmpty, Min, Max, Matches, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /goals
 * Example: { "title": "Trip to Goa", "targetAmount": 50000, "totalMonths": 12, "upiId": "user@paytm" }
 */
export class CreateGoalDto {
  @ApiProperty({
    example: 'Trip to Goa',
    description: 'Short title for the savings goal (e.g. Trip to Goa, New iPhone, Emergency Fund)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  title: string;

  @ApiProperty({
    example: 50000,
    description: 'Target amount the user wants to save (in INR)',
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1, { message: 'targetAmount must be at least 1' })
  targetAmount: number;

  @ApiProperty({
    example: 12,
    description: 'Total number of months over which the user plans to complete this goal',
    minimum: 1,
    maximum: 120,
  })
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(1)
  @Max(120)
  totalMonths: number;

  @ApiProperty({
    example: 'user@paytm',
    description:
      'UPI ID where the user will transfer savings for this goal (e.g. user@paytm, 9876543210@ybl)',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 100)
  @Matches(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, {
    message: 'upiId must be in format identifier@bank (e.g. user@paytm)',
  })
  upiId: string;
}
