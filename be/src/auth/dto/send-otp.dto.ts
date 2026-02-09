import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /auth/send-otp
 * Example: { "phone": "+919876543210", "name": "John Doe" }
 */
export class SendOtpDto {
  @ApiProperty({
    example: '+919876543210',
    description: 'User phone number in E.164 format with country code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,14}$/, {
    message: 'phone must be a valid E.164 format (e.g. 9876543210)',
  })
  phone: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
