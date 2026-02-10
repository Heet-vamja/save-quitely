import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { GoalStatus, Prisma } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    const monthlyAmount = Number(
      (new Prisma.Decimal(dto.targetAmount).div(dto.totalMonths)).toFixed(2),
    );
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        targetAmount: new Prisma.Decimal(dto.targetAmount),
        monthlyAmount: new Prisma.Decimal(monthlyAmount),
        totalMonths: dto.totalMonths,
        startDate,
        upiId: dto.upiId,
        status: GoalStatus.ACTIVE,
      },
    });

    const installments = this.buildInstallments(
      goal.id,
      startDate,
      monthlyAmount,
      dto.totalMonths,
    );
    await this.prisma.installment.createMany({ data: installments });

    const withInstallments = await this.prisma.goal.findUnique({
      where: { id: goal.id },
      include: {
        installments: { orderBy: { dueDate: 'asc' } },
      },
    });
    return this.toGoalResponse(withInstallments!);
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        installments: { orderBy: { dueDate: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return goals.map((g) => this.toGoalResponse(g));
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        installments: { orderBy: { dueDate: 'asc' } },
      },
    });
    if (!goal) throw new NotFoundException('Goal not found');
    if (goal.userId !== userId) throw new ForbiddenException();
    return this.toGoalResponse(goal);
  }

  private buildInstallments(
    goalId: string,
    startDate: Date,
    monthlyAmount: number,
    totalMonths: number,
  ): { goalId: string; dueDate: Date; amount: Prisma.Decimal }[] {
    const list: { goalId: string; dueDate: Date; amount: Prisma.Decimal }[] = [];
    const d = new Date(startDate);
    for (let i = 0; i < totalMonths; i++) {
      const due = new Date(d);
      due.setMonth(d.getMonth() + i + 1);
      due.setHours(0, 0, 0, 0);
      list.push({
        goalId,
        dueDate: due,
        amount: new Prisma.Decimal(monthlyAmount),
      });
    }
    return list;
  }

  private toGoalResponse(goal: {
    id: string;
    userId: string;
    title: string;
    targetAmount: Prisma.Decimal;
    monthlyAmount: Prisma.Decimal;
    totalMonths: number;
    startDate: Date;
    upiId: string;
    status: GoalStatus;
    createdAt: Date;
    installments: { id: string; dueDate: Date; amount: Prisma.Decimal; status: string; paidAt: Date | null }[];
  }) {
    const paidCount = goal.installments.filter((i) => i.status === 'PAID').length;
    const totalPaid = goal.installments
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    return {
      id: goal.id,
      userId: goal.userId,
      title: goal.title,
      targetAmount: Number(goal.targetAmount),
      monthlyAmount: Number(goal.monthlyAmount),
      totalMonths: goal.totalMonths,
      startDate: goal.startDate.toISOString().slice(0, 10),
      upiId: goal.upiId,
      status: goal.status,
      createdAt: goal.createdAt.toISOString(),
      currentAmount: totalPaid,
      installments: goal.installments.map((i) => ({
        id: i.id,
        dueDate: i.dueDate.toISOString().slice(0, 10),
        amount: Number(i.amount),
        status: i.status,
        paidAt: i.paidAt?.toISOString() ?? null,
      })),
      progress: {
        paidInstallments: paidCount,
        totalInstallments: goal.totalMonths,
        totalPaid,
        percentComplete: goal.totalMonths > 0
          ? Math.round((paidCount / goal.totalMonths) * 100)
          : 0,
      },
    };
  }

  async getGoalProgress(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        installments: true,
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException();
    }

    const paidInstallments = goal.installments.filter(
      (i) => i.status === 'PAID',
    );

    const currentAmount = paidInstallments.reduce(
      (sum, i) => sum + Number(i.amount),
      0,
    );

    const monthsCompleted = paidInstallments.length;
    const targetAmount = Number(goal.targetAmount);
    const totalMonths = goal.totalMonths;

    const percentage =
      targetAmount > 0
        ? Math.round((currentAmount / targetAmount) * 100)
        : 0;

    return {
      currentAmount,
      targetAmount,
      percentage,
      monthsCompleted,
      totalMonths,
      remainingAmount: Math.max(targetAmount - currentAmount, 0),
    };
  }
}
