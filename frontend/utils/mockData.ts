export interface Goal {
  id: string;
  name: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt: string;
  emoji: string;
}

export interface Payment {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const mockGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    category: 'Security',
    targetAmount: 100000,
    currentAmount: 45000,
    targetDate: '2025-12-31',
    createdAt: '2025-01-01',
    emoji: '🛡️'
  },
  {
    id: '2',
    name: 'Bali Trip',
    category: 'Travel',
    targetAmount: 80000,
    currentAmount: 32000,
    targetDate: '2025-08-15',
    createdAt: '2025-01-15',
    emoji: '✈️'
  },
  {
    id: '3',
    name: 'New iPhone',
    category: 'Gadget',
    targetAmount: 120000,
    currentAmount: 72000,
    targetDate: '2025-06-30',
    createdAt: '2025-02-01',
    emoji: '📱'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    goalId: '1',
    amount: 5000,
    date: '2025-02-01',
    status: 'completed'
  },
  {
    id: '2',
    goalId: '1',
    amount: 10000,
    date: '2025-02-05',
    status: 'completed'
  },
  {
    id: '3',
    goalId: '2',
    amount: 8000,
    date: '2025-02-03',
    status: 'completed'
  }
];

export const CATEGORIES = [
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'gadget', name: 'Gadget', emoji: '📱' },
  { id: 'security', name: 'Emergency Fund', emoji: '🛡️' },
  { id: 'education', name: 'Education', emoji: '📚' },
  { id: 'health', name: 'Health', emoji: '💪' },
  { id: 'home', name: 'Home', emoji: '🏠' },
  { id: 'car', name: 'Vehicle', emoji: '🚗' },
  { id: 'investment', name: 'Investment', emoji: '💰' },
  { id: 'wedding', name: 'Wedding', emoji: '💍' },
  { id: 'other', name: 'Other', emoji: '🎯' }
];