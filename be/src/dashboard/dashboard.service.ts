import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        installments: { orderBy: { dueDate: 'asc' } },
      },
    });

    let totalSaved = 0;
    const goalsProgress = goals.map((g) => {
      const paid = g.installments.filter((i) => i.status === 'PAID');
      const paidSum = paid.reduce((s, i) => s + Number(i.amount), 0);
      totalSaved += paidSum;
      const percent =
        g.totalMonths > 0
          ? Math.round((paid.length / g.totalMonths) * 100)
          : 0;
      return {
        goalId: g.id,
        title: g.title,
        targetAmount: Number(g.targetAmount),
        totalPaid: paidSum,
        paidInstallments: paid.length,
        totalInstallments: g.totalMonths,
        percentComplete: percent,
        status: g.status,
      };
    });

    const activeGoalsCount = goals.filter((g) => g.status === 'ACTIVE').length;

    return {
      totalSaved,
      activeGoalsCount,
      totalGoalsCount: goals.length,
      goalsProgress,
    };
  }

  async getTimeline(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    let totalSaved = 0;
    let totalTarget = 0;
    let monthlyCommitment = 0;

    const completionDates: Date[] = [];

    const goalsTimeline = goals.map((goal) => {
      const paidInstallments = goal.installments.filter(
        (i) => i.status === 'PAID',
      );

      const currentAmount = paidInstallments.reduce(
        (sum, i) => sum + Number(i.amount),
        0,
      );

      totalSaved += currentAmount;
      totalTarget += Number(goal.targetAmount);
      monthlyCommitment += Number(goal.monthlyAmount);

      // Calculate goal completion date
      const startDate = new Date(goal.startDate);
      const completionDate = new Date(startDate);
      completionDate.setMonth(
        completionDate.getMonth() + goal.totalMonths,
      );
      completionDates.push(completionDate);

      return {
        id: goal.id,
        title: goal.title,
        targetAmount: Number(goal.targetAmount),
        monthlyAmount: Number(goal.monthlyAmount),
        totalMonths: goal.totalMonths,
        startDate: goal.startDate,
        status: goal.status,
        currentAmount,
        progressPercentage:
          Number(goal.targetAmount) > 0
            ? Math.round((currentAmount / Number(goal.targetAmount)) * 100)
            : 0,
        installments: goal.installments.map((i) => ({
          id: i.id,
          dueDate: i.dueDate,
          amount: Number(i.amount),
          status: i.status,
          paidAt: i.paidAt,
        })),
      };
    });

    const estimatedCompletion =
      completionDates.length > 0
        ? new Date(
            Math.max(...completionDates.map((d) => d.getTime())),
          ).toISOString()
        : null;

    return {
      overallProgress: {
        totalSaved,
        totalTarget,
        percentage:
          totalTarget > 0
            ? Math.round((totalSaved / totalTarget) * 100)
            : 0,
      },
      monthlyCommitment,
      estimatedCompletion,
      goals: goalsTimeline,
    };
  }
}
