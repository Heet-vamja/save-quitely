/**
 * Real API Interface Layer
 *
 * This file talks to the real backend APIs.
 * UI components MUST only call functions from this file.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Goal,
  Installment,
  User,
  DashboardSummary,
  TimelineData,
  CreateGoalDto,
  SendOtpDto,
  VerifyOtpDto,
  UpiIntentDto,
  PaymentIntent,
} from '../types';

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.6:3000';
const API_PREFIX = '/api';

// --------------------------------------------------
// Auth token helper
// --------------------------------------------------

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const token = await AsyncStorage.getItem('auth_token');

  const res = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || 'API Error');
  }

  return res.json() as Promise<T>;
}

// ========================================
// Auth APIs
// ========================================

export const sendOtp = (data: SendOtpDto) =>
  apiFetch<{ success: boolean; message: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const verifyOtp = async (data: VerifyOtpDto) => {
  const result = await apiFetch<{
    access_token: string;
    user: User;
  }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (result.access_token) {
    await AsyncStorage.setItem('auth_token', result.access_token);
  }

  return result;
};

// ========================================
// Dashboard APIs
// ========================================

export const getDashboardSummary = () =>
  apiFetch<DashboardSummary>('/dashboard');

export const getTimeline = () =>
  apiFetch<TimelineData>('/dashboard/timeline');

// ========================================
// Goals APIs
// ========================================

export const getGoals = () =>
  apiFetch<Goal[]>('/goals');

export const getGoalById = (goalId: string) =>
  apiFetch<Goal>(`/goals/${goalId}`);

export const createGoal = (data: CreateGoalDto) =>
  apiFetch<Goal>('/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getGoalProgress = (goalId: string) =>
  apiFetch<{
    currentAmount: number;
    targetAmount: number;
    percentage: number;
    monthsCompleted: number;
    totalMonths: number;
    remainingAmount: number;
  }>(`/goals/${goalId}/progress`);

// ========================================
// Installments APIs
// ========================================

export const getInstallments = (goalId: string) =>
  apiFetch<Installment[]>(`/installments/${goalId}`);

export const markInstallmentPaid = async (installmentId: string) => {
  const installment = await apiFetch<Installment>(
    `/installments/${installmentId}/mark-paid`,
    { method: 'POST' },
  );

  return {
    success: true,
    installment,
  };
};

// ========================================
// Payment APIs
// ========================================

export const createUpiIntent = (data: UpiIntentDto) =>
  apiFetch<PaymentIntent>('/payments/upi-intent', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getPaymentHistory = (goalId: string) =>
  apiFetch<Installment[]>(`/payments/history/${goalId}`);
