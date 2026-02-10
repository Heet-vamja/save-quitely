import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpiIntentDto } from './dto/upi-intent.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('history/:goalId')
  getPaymentHistory(
    @CurrentUser('sub') userId: string,
    @Param('goalId') goalId: string,
  ) {
    return this.paymentsService.getPaymentHistory(userId, goalId);
  }

  @Post('upi-intent')
  createUpiIntent(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpiIntentDto,
  ) {
    return this.paymentsService.createUpiIntent(userId, dto.installmentId);
  }
}
