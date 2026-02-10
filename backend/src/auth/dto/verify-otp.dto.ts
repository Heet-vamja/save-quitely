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
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'otp must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'otp must contain exactly 6 digits' })
  otp: string;
}
