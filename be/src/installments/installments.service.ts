import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InstallmentStatus } from '@prisma/client';

@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getInstallments(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        installments: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException();
    }

    return goal.installments.map((i) => ({
      id: i.id,
      goalId: i.goalId,
      dueDate: i.dueDate.toISOString().slice(0, 10),
      amount: Number(i.amount),
      status: i.status,
      paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    }));
  }

  async markPaid(userId: string, installmentId: string) {
    const installment = await this.prisma.installment.findUnique({
      where: { id: installmentId },
      include: { goal: true },
    });

    if (!installment) {
      throw new NotFoundException('Installment not found');
    }

    if (installment.goal.userId !== userId) {
      throw new ForbiddenException();
    }

    if (installment.status === InstallmentStatus.PAID) {
      throw new BadRequestException(
        'Installment is already marked as paid',
      );
    }

    const updated = await this.prisma.installment.update({
      where: { id: installmentId },
      data: {
        status: InstallmentStatus.PAID,
        paidAt: new Date(),
      },
    });

    return {
      id: updated.id,
      goalId: updated.goalId,
      dueDate: updated.dueDate.toISOString().slice(0, 10),
      amount: Number(updated.amount),
      status: updated.status,
      paidAt: updated.paidAt?.toISOString() ?? null,
    };
  }
}
