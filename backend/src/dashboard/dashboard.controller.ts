import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getSummary(@CurrentUser('sub') userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('timeline')
  getTimeline(@CurrentUser('sub') userId: string) {
    return this.dashboardService.getTimeline(userId);
  }
}
