import { Goal, Installment, User, GoalStatus, InstallmentStatus } from '../types';

// Mock user data
export const mockUser: User = {
  id: 'user-001',
  name: 'Rahul',
  phone: '+919876543210',
  createdAt: new Date('2025-01-01').toISOString(),
};

// Helper to calculate current amount from installments
const calculateCurrentAmount = (installments: Installment[]): number => {
  return installments
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.amount, 0);
};

// Helper to generate installments for a goal
const generateInstallments = (
  goalId: string,
  monthlyAmount: number,
  totalMonths: number,
  startDate: Date,
  paidMonths: number
): Installment[] => {
  const installments: Installment[] = [];
  
  for (let i = 0; i < totalMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const isPaid = i < paidMonths;
    
    installments.push({
      id: `installment-${goalId}-${i + 1}`,
      goalId,
      dueDate: dueDate.toISOString(),
      amount: monthlyAmount,
      status: isPaid ? 'PAID' : 'PENDING',
      paidAt: isPaid ? new Date(dueDate.getTime() + 24 * 60 * 60 * 1000).toISOString() : null,
      monthNumber: i + 1,
    });
  }
  
  return installments;
};

// Mock Goals Data (matching screenshots)
const europeTripInstallments = generateInstallments(
  '1',
  31250, // ₹2,50,000 / 8 months
  8,
  new Date('2025-12-01'),
  3 // 3 months paid
);

const emergencyFundInstallments = generateInstallments(
  '2',
  12500, // ₹1,50,000 / 12 months
  12,
  new Date('2025-10-01'),
  5 // 5 months paid
);

const laptopInstallments = generateInstallments(
  '3',
  21250, // ₹85,000 / 4 months
  4,
  new Date('2026-01-01'),
  2 // 2 months paid
);

export const mockGoals: Goal[] = [
  {
    id: '1',
    userId: mockUser.id,
    title: 'Europe Trip',
    targetAmount: 250000,
    monthlyAmount: 31250,
    totalMonths: 8,
    startDate: new Date('2025-12-01').toISOString(),
    upiId: 'savings@paytm',
    status: 'ACTIVE' as GoalStatus,
    createdAt: new Date('2025-12-01').toISOString(),
    emoji: '✈️',
    category: 'TRIP',
    installments: europeTripInstallments,
    currentAmount: calculateCurrentAmount(europeTripInstallments),
  },
  {
    id: '2',
    userId: mockUser.id,
    title: 'Emergency Fund',
    targetAmount: 150000,
    monthlyAmount: 12500,
    totalMonths: 12,
    startDate: new Date('2025-10-01').toISOString(),
    upiId: 'savings@paytm',
    status: 'ACTIVE' as GoalStatus,
    createdAt: new Date('2025-10-01').toISOString(),
    emoji: '🛡️',
    category: 'EMERGENCY',
    installments: emergencyFundInstallments,
    currentAmount: calculateCurrentAmount(emergencyFundInstallments),
  },
  {
    id: '3',
    userId: mockUser.id,
    title: 'New Laptop',
    targetAmount: 85000,
    monthlyAmount: 21250,
    totalMonths: 4,
    startDate: new Date('2026-01-01').toISOString(),
    upiId: 'savings@paytm',
    status: 'ACTIVE' as GoalStatus,
    createdAt: new Date('2026-01-01').toISOString(),
    emoji: '💻',
    category: 'CUSTOM',
    installments: laptopInstallments,
    currentAmount: calculateCurrentAmount(laptopInstallments),
  },
];

// Helper function to get all installments across all goals
export const getAllInstallments = (): Installment[] => {
  return mockGoals.flatMap(goal => goal.installments || []);
};

// Helper to get next pending installment for a goal
export const getNextPendingInstallment = (goalId: string): Installment | null => {
  const goal = mockGoals.find(g => g.id === goalId);
  if (!goal || !goal.installments) return null;
  
  const pending = goal.installments
    .filter(i => i.status === 'PENDING')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return pending[0] || null;
};

// Helper to get paid installments count
export const getPaidInstallmentsCount = (goalId: string): number => {
  const goal = mockGoals.find(g => g.id === goalId);
  if (!goal || !goal.installments) return 0;
  
  return goal.installments.filter(i => i.status === 'PAID').length;
};
