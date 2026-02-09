import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /auth/verify-otp
 * Example: { "phone": "+919876543210", "otp": "123456" }
 */
export class VerifyOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'User phone number in E.164 format with country code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,14}$/, {
    message: 'phone must be a valid E.164 format',
  })
  phone: string;

  @ApiProperty({
    example: '123456',
    description: 'One-time password sent to the user phone number',
    minLength: 4,
    maxLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 6, { message: 'otp must be 6 digits' })
  @Matches(/^\d+$/, { message: 'otp must contain only digits' })
  otp: string;
}
