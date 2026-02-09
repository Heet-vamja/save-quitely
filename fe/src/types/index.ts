// Backend-aligned types from Swagger + Prisma schema

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED';
export type InstallmentStatus = 'PENDING' | 'PAID' | 'MISSED';
export type PaymentIntentStatus = 'CREATED' | 'OPENED' | 'COMPLETED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  monthlyAmount: number;
  totalMonths: number;
  startDate: string; // ISO date string
  upiId: string;
  status: GoalStatus;
  createdAt: string;
  // UI helpers (not from backend)
  emoji?: string;
  category?: string;
  currentAmount?: number;
  installments?: Installment[];
}

export interface Installment {
  id: string;
  goalId: string;
  dueDate: string; // ISO date string
  amount: number;
  status: InstallmentStatus;
  paidAt?: string | null;
  monthNumber?: number; // Helper for UI
}

export interface PaymentIntent {
  id: string;
  userId: string;
  installmentId: string;
  amount: number;
  upiLink: string;
  status: PaymentIntentStatus;
  createdAt: string;
}

// API Request/Response DTOs (from Swagger)

export interface SendOtpDto {
  phone: string;
  name: string;
}

export interface VerifyOtpDto {
  phone: string;
  otp: string;
}

export interface CreateGoalDto {
  title: string;
  targetAmount: number;
  totalMonths: number;
  upiId: string;
}

export interface UpiIntentDto {
  installmentId: string;
}

export interface DashboardSummary {
  totalSaved: number;
  totalTarget: number;
  monthlyTarget: number;
  savedThisMonth: number;
  growthPercentage: number;
  activeGoalsCount: number;
}

export interface TimelineData {
  overallProgress: {
    totalSaved: number;
    totalTarget: number;
    percentage: number;
  };
  monthlyCommitment: number;
  estimatedCompletion: string; // ISO date
  goals: Goal[];
}

// Legacy types for backward compatibility (will migrate away)
export interface Payment {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export const CATEGORIES = [
  { id: 'trip', name: 'Trip', emoji: '✈️', color: '#E1BEE7' },
  { id: 'emergency', name: 'Emergency', emoji: '🛡️', color: '#FFCCBC' },
  { id: 'custom', name: 'Custom', emoji: '🎯', color: '#C5CAE9' },
  { id: 'gadget', name: 'Gadget', emoji: '📱', color: '#B2DFDB' },
  { id: 'education', name: 'Education', emoji: '📚', color: '#F0F4C3' },
  { id: 'health', name: 'Health', emoji: '💪', color: '#FFCCBC' },
  { id: 'home', name: 'Home', emoji: '🏠', color: '#D7CCC8' },
  { id: 'car', name: 'Vehicle', emoji: '🚗', color: '#CFD8DC' },
  { id: 'investment', name: 'Investment', emoji: '💰', color: '#C5E1A5' },
  { id: 'wedding', name: 'Wedding', emoji: '💍', color: '#F8BBD0' },
];
