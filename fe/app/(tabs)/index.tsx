import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import {
  getDashboardSummary,
  getGoals,
  getInstallments,
} from '../../src/services/api';
import { Goal, DashboardSummary, Installment } from '../../src/types';
import { format } from 'date-fns';

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [nextInstallments, setNextInstallments] = useState<
    Record<string, Installment | null>
  >({});
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, goalsData] = await Promise.all([
        getDashboardSummary(),
        getGoals(),
      ]);

      setSummary(summaryData);
      setGoals(goalsData);

      const installments: Record<string, Installment | null> = {};
      for (const goal of goalsData) {
        const nextInst = await getInstallments(goal.id);
        installments[goal.id] = nextInst[0] || null; // Assuming the first installment is the next one due
      }
      setNextInstallments(installments);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getProgressPercentage = (current: number, target: number) =>
    Math.min((current / target) * 100, 100);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      TRIP: '#F1E5FF',
      EMERGENCY: '#FEE9D8',
      CUSTOM: '#E4E7FF',
    };
    return colors[category] || '#E4E7FF';
  };

  const getMonthProgress = (goal: Goal): string => {
    const paidCount = goal.installments?.filter(i => i.status === 'PAID').length || 0;
    return `Month ${paidCount + 1} of ${goal.totalMonths}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER + STATIC TOP SECTION (not scrollable) */}
      <LinearGradient
        colors={['#5D5FEF', '#6F7CFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View style={styles.brandingSection}>
              <View style={styles.brandRow}>
                <Text style={styles.sparkle}>✨</Text>
                <Text style={styles.brandName}>SaveQuietly</Text>
              </View>
              <Text style={styles.greeting}>Good morning! 👋</Text>
            </View>

            <View style={styles.avatarOuter}>
              <View style={styles.avatarShadow} />
              <TouchableOpacity style={styles.avatarButton}>
                <Ionicons name="person" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* TOTAL SAVINGS ON PURPLE, LIKE YOUR SCREENSHOT */}
          <View style={styles.savingsContainer}>
            <Text style={styles.savingsLabel}>TOTAL SAVINGS</Text>
            <View style={styles.savingsRow}>
              <Text style={styles.savingsAmount}>
                ₹{((summary?.totalSaved || 0) / 1000).toFixed(1)}k
              </Text>
              <View style={styles.growthBadge}>
                <Ionicons name="arrow-up" size={14} color="#FFFFFF" />
                <Text style={styles.growthText}>
                  {summary?.growthPercentage || 15}%
                </Text>
              </View>
            </View>
            <Text style={styles.savingsSub}>Keep up the great work!</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* WHITE AREA WITH CARDS (still static, matches screenshot) */}
      <View style={styles.topCardsWrapper}>
        {/* New Goal & Timeline */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.newGoalButton}
            onPress={() => router.push('/create-goal')}
            data-testid="new-goal-button"
          >
            <View style={styles.newGoalCircle}>
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.newGoalLabel}>New Goal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.timelineButton}
            onPress={() => router.push('/(tabs)/goals')}
            data-testid="timeline-button"
          >
            <Ionicons name="time-outline" size={18} color="#FFFFFF" />
            <Text style={styles.timelineLabel}>Timeline</Text>
          </TouchableOpacity>
        </View>

        {/* Monthly Target / Saved This Month */}
        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>MONTHLY TARGET</Text>
            <Text style={styles.statValue}>
              ₹{(summary?.monthlyTarget || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <LinearGradient
            colors={['#00C853', '#00E676']}
            style={styles.statGreenCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabelLight}>SAVED THIS MONTH</Text>
            <Text style={styles.statValueLight}>
              ₹{(summary?.savedThisMonth || 0).toLocaleString('en-IN')}
            </Text>
          </LinearGradient>
        </View>

        {/* UPI banner */}
        <View style={styles.upiCard}>
          <View style={styles.upiIconWrap}>
            <Ionicons name="shield-checkmark" size={18} color="#6C63FF" />
          </View>
          <View style={styles.upiTextWrap}>
            <Text style={styles.upiTitle}>Link your UPI to auto-track</Text>
            <Text style={styles.upiSub}>Savings. We never initiate payments.</Text>
          </View>
          <View style={styles.upiButtons}>
            <TouchableOpacity style={styles.upiPrimary}>
              <Text style={styles.upiPrimaryText}>Link UPI</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.upiSecondaryText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Goals heading – this is where scroll should start */}
        <View style={styles.goalsHeader}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <Text style={styles.sectionSubtitle}>{goals.length} in progress</Text>
        </View>
      </View>

      {/* SCROLL ONLY FOR GOAL CARDS */}
      <ScrollView
        style={styles.goalsScroll}
        contentContainerStyle={styles.goalsScrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {goals.map(goal => {
          const progress = getProgressPercentage(
            goal.currentAmount || 0,
            goal.targetAmount,
          );
          const nextInstallment = nextInstallments[goal.id];

          return (
            <TouchableOpacity
              key={goal.id}
              style={styles.goalCard}
              onPress={() => router.push(`/goal/${goal.id}`)}
              data-testid={`goal-card-${goal.id}`}
            >
              <View style={styles.goalHeader}>
                <View style={styles.goalTitleRow}>
                  <Text style={styles.goalName}>{goal.title}</Text>
                  <View
                    style={[
                      styles.categoryPill,
                      { backgroundColor: getCategoryColor(goal.category || 'CUSTOM') },
                    ]}
                  >
                    <Text style={styles.categoryText}>{goal.category}</Text>
                  </View>
                </View>
                <Text style={styles.monthProgress}>{getMonthProgress(goal)}</Text>
              </View>

              <View style={styles.goalAmountRow}>
                <Text style={styles.goalAmount}>
                  ₹{(goal.currentAmount || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.goalPercentage}>{progress.toFixed(0)}%</Text>
              </View>
              <Text style={styles.goalTarget}>
                of ₹{goal.targetAmount.toLocaleString('en-IN')}
              </Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {nextInstallment && (
                <View style={styles.nextPaymentRow}>
                  <View style={styles.calendarIcon}>
                    <Ionicons name="calendar-clear" size={18} color="#FFB74D" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nextPaymentLabel}>NEXT PAYMENT</Text>
                    <Text style={styles.nextPaymentValue}>
                      ₹{nextInstallment.amount.toLocaleString('en-IN')} ·{' '}
                      {format(
                        new Date(nextInstallment.dueDate),
                        'MMM dd, yyyy',
                      )}
                    </Text>
                  </View>
                </View>
              )}

              <Ionicons
                name="chevron-forward"
                size={18}
                color="#D0D2E0"
                style={styles.chevron}
              />
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
  },
  android: {
    elevation: 6,
  },
});

const LIGHT_CARD_SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
  },
  android: {
    elevation: 3,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6FB',
  },

  /* HEADER + SAVINGS */
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandingSection: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sparkle: {
    fontSize: 20,
    marginRight: 6,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greeting: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    marginTop: 2,
  },
  avatarOuter: {
    width: 52,
    height: 52,
  },
  avatarShadow: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(61, 217, 130, 0.45)',
  },
  avatarButton: {
    position: 'absolute',
    right: 5,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#31D987',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  savingsContainer: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 10,
  },
  savingsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 10,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  savingsAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 10,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#24C26A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  growthText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  savingsSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 4,
  },

  /* STATIC WHITE TOP CARDS AREA */
  topCardsWrapper: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#F4F6FB',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  newGoalButton: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    alignItems: 'center',
    ...LIGHT_CARD_SHADOW,
  },
  newGoalCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#5C5FEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  newGoalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C5FEF',
  },

  timelineButton: {
    flex: 1,
    borderRadius: 20,
    marginLeft: 12,
    backgroundColor: '#B3B7FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  timelineLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },

  statCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...LIGHT_CARD_SHADOW,
  },
  statGreenCard: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    ...CARD_SHADOW,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A3B5',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2430',
  },
  statLabelLight: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  statValueLight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  upiCard: {
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    ...LIGHT_CARD_SHADOW,
  },
  upiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upiTextWrap: {
    flex: 1,
  },
  upiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#252836',
  },
  upiSub: {
    fontSize: 12,
    color: '#9092A3',
    marginTop: 2,
  },
  upiButtons: {
    marginLeft: 8,
    alignItems: 'flex-end',
  },
  upiPrimary: {
    borderRadius: 16,
    backgroundColor: '#5C5FEF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 4,
  },
  upiPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  upiSecondaryText: {
    fontSize: 12,
    color: '#7C819A',
    fontWeight: '500',
  },

  goalsHeader: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2430',
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: '#8E94A7',
  },

  /* SCROLLABLE GOAL LIST */
  goalsScroll: {
    flex: 1,
  },
  goalsScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },

  goalCard: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    ...CARD_SHADOW,
    position: 'relative',
  },
  goalHeader: {
    marginBottom: 10,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2430',
    flex: 1,
    marginRight: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C82FF',
  },
  monthProgress: {
    marginTop: 4,
    fontSize: 13,
    color: '#9092A3',
  },

  goalAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  goalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2430',
  },
  goalPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00C853',
  },
  goalTarget: {
    marginTop: 2,
    fontSize: 13,
    color: '#A0A3B5',
  },

  progressTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E7E8F2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#5C5FEF',
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#F0F1FA',
    marginTop: 18,
    marginBottom: 14,
  },

  nextPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBC5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nextPaymentLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F57C00',
    marginBottom: 2,
  },
  nextPaymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2430',
  },

  chevron: {
    position: 'absolute',
    right: 18,
    top: 22,
  },
});
