import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.goalsService.findAll(userId);
  }

  @Get(':id')
  findOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.goalsService.findOne(userId, id);
  }

  @Get(':id/progress')
  getProgress(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.goalsService.getGoalProgress(userId, id);
  }
}
