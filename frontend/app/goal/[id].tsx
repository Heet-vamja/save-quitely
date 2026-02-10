// [id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getGoalById, getInstallments, createUpiIntent, markInstallmentPaid } from '../../src/services/api';
import { Goal, Installment } from '../../src/types';
import { format, differenceInMonths } from 'date-fns';
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Linking } from 'react-native';

export default function GoalDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) loadGoalDetails();
  }, [id]);

  const handleUpiPay = async () => {
  if (!nextInstallment?.id) {
    Alert.alert('Error', 'Invalid installment');
    return;
  }

  try {
    const res = await createUpiIntent({
      installmentId: nextInstallment.id,
    });

    const upiLink = res?.upiLink;

    if (!upiLink) {
      Alert.alert('Error', 'Failed to generate UPI link');
      return;
    }

    // 🚀 DO NOT use canOpenURL for UPI
    await Linking.openURL(upiLink);

    // ❌ DO NOT mark paid here
    await markInstallmentPaid(nextInstallment?.id || '')

  } catch (err: any) {
    Alert.alert(
      'Payment failed',
      err?.message || 'Unable to initiate UPI payment'
    );
  }
};


  const loadGoalDetails = async () => {
    try {
      setLoading(true);
      const goalData = await getGoalById(id as string);
      if (goalData) {
        setGoal(goalData);
        const installmentsData = await getInstallments(goalData.id);
        setInstallments(Array.isArray(installmentsData) ? installmentsData : []);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B5FD8" />
      </View>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Goal not found</Text>
      </SafeAreaView>
    );
  }

  const progress = Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - (goal.currentAmount || 0);

  const nextInstallment = installments.find(i => i.status === 'PENDING');
  const paidInstallments = installments
    .filter(i => i.status === 'PAID')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  const pendingInstallments = installments
    .filter(i => i.status === 'PENDING')
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const endDate = new Date(goal.startDate);
  endDate.setMonth(endDate.getMonth() + goal.totalMonths);
  const monthsLeft = Math.max(0, differenceInMonths(endDate, new Date()));

  const size = 200;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#5B5FD8', '#7B83EB']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{goal.title}</Text>
        <Text style={styles.headerSub}>Emergency Goal</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress Card */}
        <View style={styles.card}>
          <View style={styles.progressWrapper}>
            <Svg width={size} height={size}>
              <Defs>
                <SvgLinearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#5B5FD8" />
                  <Stop offset="100%" stopColor="#4CAF50" />
                </SvgLinearGradient>
              </Defs>
              <Circle cx={center} cy={center} r={radius} stroke="#EEF1F5" strokeWidth={strokeWidth} fill="none" />
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="url(#g)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${progressOffset}`}
                strokeLinecap="round"
                rotation="-90"
                origin={`${center}, ${center}`}
                fill="none"
              />
            </Svg>

            <View style={styles.centerText}>
              <Text style={styles.percent}>{progress.toFixed(0)}%</Text>
              <Text style={styles.amount}>
                ₹{(goal.currentAmount || 0).toLocaleString('en-IN')} of ₹{goal.targetAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>REMAINING</Text>
              <Text style={styles.statValue}>₹{remaining.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>TIME LEFT</Text>
              <Text style={styles.statValue}>{monthsLeft} months</Text>
            </View>
          </View>
        </View>

        {/* Next Payment */}
        {nextInstallment && (
          <View style={styles.nextCard}>
            <View style={styles.nextHeader}>
              <View style={styles.nextIconWrapper}>
                <Ionicons name="calendar-outline" size={20} color="#FF8A3C" />
              </View>
              <View>
                <Text style={styles.nextTitle}>Next Payment Due</Text>
                <Text style={styles.nextDate}>{format(new Date(nextInstallment.dueDate), 'MMM dd, yyyy')}</Text>
              </View>
            </View>

            <View style={styles.nextAmountRow}>
              <Text style={styles.nextLabel}>AMOUNT</Text>
              <Text style={styles.nextAmt}>₹{nextInstallment.amount.toLocaleString('en-IN')}</Text>
            </View>

            <TouchableOpacity style={styles.payBtn} onPress={handleUpiPay}>
              <LinearGradient colors={['#5B5FD8', '#7B83EB']} style={styles.payGrad}>
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.payText}>Pay Now via UPI</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Schedule */}
        <Text style={styles.sectionTitle}>Payment Schedule</Text>

        {pendingInstallments.map(i => (
          <View key={i.id} style={styles.pendingItem}>
            <View style={styles.pendingLeft}>
              <View style={styles.monthBadge}>
                <Text style={styles.monthBadgeText}>{i.monthNumber}</Text>
              </View>
              <View>
                <Text style={styles.pendingDate}>{format(new Date(i.dueDate), 'MMM dd, yyyy')}</Text>
                <Text style={styles.pendingSubtitle}>MONTH {i.monthNumber}</Text>
              </View>
            </View>
            <View style={styles.pendingRight}>
              <Text style={styles.pendingAmount}>₹{i.amount.toLocaleString('en-IN')}</Text>
              <Text style={styles.pendingStatus}>DUE</Text>
            </View>
          </View>
        ))}

        {paidInstallments.length > 0 && (
          <View style={styles.completedHeaderRow}>
            <View style={styles.completedDot} />
            <Text style={styles.completedLabel}>COMPLETED</Text>
          </View>
        )}

        {paidInstallments.map(i => (
          <View key={i.id} style={styles.paidItem}>
            <View style={styles.paidLeft}>
              <View style={styles.paidIconWrapper}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
              <View>
                <Text style={styles.paidDate}>{format(new Date(i.dueDate), 'MMM dd, yyyy')}</Text>
                <Text style={styles.paidSubtitle}>MONTH {i.monthNumber}</Text>
              </View>
            </View>
            <View style={styles.paidRight}>
              <Text style={styles.paidAmount}>₹{i.amount.toLocaleString('en-IN')}</Text>
              <Text style={styles.paidStatus}>PAID ✓</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { textAlign: 'center', marginTop: 40, color: '#666' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', marginTop: 4, fontSize: 13 },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  progressWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: { fontSize: 36, fontWeight: '700', color: '#252B33' },
  amount: { color: '#7A8190', marginTop: 4, fontSize: 13 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, color: '#A0A7B8', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#252B33' },

  nextCard: {
    backgroundColor: '#FFF6EB',
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#FFE0C2',
  },
  nextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE0C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  nextTitle: { fontWeight: '700', fontSize: 15, color: '#252B33' },
  nextDate: { color: '#A0A7B8', marginTop: 2, fontSize: 13 },
  nextAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  nextLabel: { fontSize: 11, color: '#A0A7B8', letterSpacing: 0.4 },
  nextAmt: { fontSize: 24, fontWeight: '700', color: '#FF8A3C' },

  payBtn: { borderRadius: 14, overflow: 'hidden' },
  payGrad: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  payText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#252B33',
    marginBottom: 10,
  },

  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD5B3',
    borderStyle: 'dashed',
    backgroundColor: '#FFF9F3',
    marginBottom: 10,
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center' },
  monthBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  monthBadgeText: { color: '#FF8A3C', fontWeight: '700', fontSize: 16 },
  pendingDate: { fontSize: 14, fontWeight: '600', color: '#252B33' },
  pendingSubtitle: { fontSize: 12, color: '#A0A7B8', marginTop: 2 },
  pendingRight: { alignItems: 'flex-end' },
  pendingAmount: { fontSize: 15, fontWeight: '700', color: '#252B33' },
  pendingStatus: { fontSize: 12, color: '#FF8A3C', marginTop: 2, fontWeight: '600' },

  completedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  completedDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedLabel: { fontSize: 12, color: '#4CAF50', fontWeight: '700', letterSpacing: 0.6 },

  paidItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#E7F8ED',
    marginBottom: 10,
  },
  paidLeft: { flexDirection: 'row', alignItems: 'center' },
  paidIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  paidDate: { fontSize: 14, fontWeight: '600', color: '#252B33' },
  paidSubtitle: { fontSize: 12, color: '#6D7A70', marginTop: 2 },
  paidRight: { alignItems: 'flex-end' },
  paidAmount: { fontSize: 15, fontWeight: '700', color: '#252B33' },
  paidStatus: { fontSize: 12, color: '#4CAF50', marginTop: 2, fontWeight: '600' },
});
