import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentIntentStatus, Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentHistory(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        installments: {
          where: { status: 'PAID' },
          orderBy: {
            paidAt: 'desc',
          },
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
      paidAt: i.paidAt?.toISOString() ?? null,
      amount: Number(i.amount),
      status: i.status,
    }));
  }

  /**
   * Build UPI deep link: upi://pay?pa=<upiId>&am=<amount>&cu=INR&tn=<note>
   */
  async createUpiIntent(userId: string, installmentId: string) {
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

    if (installment.status === 'PAID') {
      throw new BadRequestException('Installment is already paid');
    }

    const amount = Number(installment.amount);
    const pa = encodeURIComponent(installment.goal.upiId);
    const am = amount.toFixed(2);
    const cu = 'INR';
    const tn = encodeURIComponent(
      `SaveQuietly - ${installment.goal.title}`,
    );

    const upiLink = `upi://pay?pa=${pa}&am=${am}&cu=${cu}&tn=${tn}`;
    console.log('Generated UPI Link:', upiLink);
    const intent = await this.prisma.paymentIntent.create({
      data: {
        userId,
        installmentId,
        amount: new Prisma.Decimal(amount),
        upiLink,
        status: PaymentIntentStatus.CREATED,
      },
    });

    return {
      id: intent.id,
      installmentId: intent.installmentId,
      amount: Number(intent.amount),
      upiLink: intent.upiLink,
      status: intent.status,
      createdAt: intent.createdAt.toISOString(),
    };
  }
}
