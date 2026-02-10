import { Controller, Get, Post, Param } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get(':goalId')
  getInstallments(
    @CurrentUser('sub') userId: string,
    @Param('goalId') goalId: string,
  ) {
    return this.installmentsService.getInstallments(userId, goalId);
  }

  @Post(':id/mark-paid')
  markPaid(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.installmentsService.markPaid(userId, id);
  }
}
