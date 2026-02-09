import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * POST /payments/upi-intent
 * Example: { "installmentId": "b2c1d5e4-9f3a-4f2e-b1c3-8f6b1f2a9a21" }
 */
export class UpiIntentDto {
  @ApiProperty({
    example: 'b2c1d5e4-9f3a-4f2e-b1c3-8f6b1f2a9a21',
    description: 'UUID of the installment for which UPI payment intent is being created',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'installmentId must be a valid UUID v4' })
  @IsNotEmpty()
  installmentId: string;
}
