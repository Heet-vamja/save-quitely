import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getTimeline } from '../../src/services/api';
import { TimelineData, Goal } from '../../src/types';
import { format, differenceInMonths } from 'date-fns';

export default function Timeline() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    try {
      const data = await getTimeline();
      setTimeline(data);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (goal: Goal): string => {
    const now = new Date();
    const endDate = new Date(goal.startDate);
    endDate.setMonth(endDate.getMonth() + goal.totalMonths);
    
    const monthsLeft = differenceInMonths(endDate, now);
    if (monthsLeft <= 0) return 'Completed';
    if (monthsLeft === 1) return '1 month left';
    return `${monthsLeft} months left`;
  };

  const getTargetDate = (goal: Goal): string => {
    const endDate = new Date(goal.startDate);
    endDate.setMonth(endDate.getMonth() + goal.totalMonths);
    return format(endDate, 'MMM yyyy');
  };

  const getProgressPercentage = (goal: Goal): number => {
    return Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B5FD8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#5B5FD8', '#7B83EB']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Your Timeline</Text>
            <Text style={styles.headerSubtitle}>Track and achieve your financial goals</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Progress Card */}
        <View style={styles.overallProgressCard}>
          <Text style={styles.cardTitle}>Overall Progress</Text>
          
          <View style={styles.progressAmounts}>
            <Text style={styles.progressSaved}>
              ₹{((timeline?.overallProgress.totalSaved || 0) / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.progressTarget}>
              of ₹{((timeline?.overallProgress.totalTarget || 0) / 1000).toFixed(1)}k
            </Text>
          </View>

          <View style={styles.progressBarContainer}>
            <LinearGradient
              colors={['#5B5FD8', '#7B83EB', '#4CAF50']}
              style={[
                styles.progressBar, 
                { width: `${timeline?.overallProgress.percentage || 0}%` }
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>

          <Text style={styles.progressPercentage}>
            {timeline?.overallProgress.percentage.toFixed(0)}% Complete
          </Text>
        </View>

        {/* Summary Cards Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="wallet" size={20} color="#5B5FD8" />
            </View>
            <Text style={styles.summaryLabel}>Monthly Commitment</Text>
            <Text style={styles.summaryValue}>
              ₹{(timeline?.monthlyCommitment || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconContainer}>
              <Ionicons name="calendar" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.summaryLabel}>Completion Timeline</Text>
            <Text style={styles.summaryValue}>
              {timeline?.estimatedCompletion 
                ? format(new Date(timeline.estimatedCompletion), 'MMM yyyy')
                : 'N/A'
              }
            </Text>
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          
          {timeline?.goals.map((goal) => {
            const progress = getProgressPercentage(goal);
            
            return (
              <TouchableOpacity
                key={goal.id}
                style={styles.goalItem}
                onPress={() => router.push(`/goal/${goal.id}`)}
                data-testid={`timeline-goal-${goal.id}`}
              >
                <View style={styles.goalIconCircle}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                </View>

                <View style={styles.goalContent}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </View>

                  <View style={styles.goalMeta}>
                    <View style={styles.goalMetaItem}>
                      <Ionicons name="time-outline" size={14} color="#666" />
                      <Text style={styles.goalMetaText}>{getTimeLeft(goal)}</Text>
                    </View>
                    <View style={styles.goalMetaItem}>
                      <Ionicons name="calendar-outline" size={14} color="#666" />
                      <Text style={styles.goalMetaText}>{getTargetDate(goal)}</Text>
                    </View>
                  </View>

                  <View style={styles.goalProgressBar}>
                    <LinearGradient
                      colors={['#5B5FD8', '#7B83EB']}
                      style={[styles.goalProgressFill, { width: `${progress}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>

                  <View style={styles.goalAmounts}>
                    <Text style={styles.goalAmountSaved}>
                      ₹{(goal.currentAmount || 0).toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.goalAmountTarget}>
                      / ₹{goal.targetAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  overallProgressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  progressAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  progressSaved: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 8,
  },
  progressTarget: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B5FD8',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  goalsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  goalItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  goalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalEmoji: {
    fontSize: 28,
  },
  goalContent: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  goalMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  goalMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalMetaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  goalAmountSaved: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 4,
  },
  goalAmountTarget: {
    fontSize: 12,
    color: '#999',
  },
  bottomPadding: {
    height: 16,
  },
});
