import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { CATEGORIES } from '../utils/mockData';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, addDays } from 'date-fns';
import { createGoal } from '../src/services/api';
import DateTimePicker from '@react-native-community/datetimepicker';


type Frequency = 'daily' | 'weekly' | 'monthly';

const FREQUENCY_OPTIONS: { id: Frequency; label: string; icon: string }[] = [
  { id: 'daily', label: 'Daily', icon: 'today-outline' },
  { id: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
  { id: 'monthly', label: 'Monthly', icon: 'calendar-number-outline' },
];

export default function CreateGoal() {
  const router = useRouter();
  const [goalName, setGoalName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(addDays(new Date(), 30)); // Default 30 days from now
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Calculate installment amount based on frequency
  const calculation = useMemo(() => {
    if (!targetAmount || isNaN(Number(targetAmount))) {
      return { installmentAmount: 0, totalInstallments: 0 };
    }

    const amount = Number(targetAmount);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(0, 0, 0, 0);

    let totalInstallments = 0;
    let installmentAmount = 0;

    switch (frequency) {
      case 'daily':
        totalInstallments = Math.max(1, differenceInDays(end, now));
        installmentAmount = amount / totalInstallments;
        break;
      case 'weekly':
        totalInstallments = Math.max(1, differenceInWeeks(end, now));
        installmentAmount = amount / totalInstallments;
        break;
      case 'monthly':
        totalInstallments = Math.max(1, differenceInMonths(end, now));
        installmentAmount = amount / totalInstallments;
        break;
    }

    return {
      installmentAmount: Math.round(installmentAmount * 100) / 100,
      totalInstallments: Math.round(totalInstallments),
    };
  }, [targetAmount, targetDate, frequency]);

  const handleCreateGoal = async () => {
    if (!goalName.trim() || !targetAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!upiId.trim()) {
      Alert.alert('Error', 'Please enter your UPI ID');
      return;
    }

    if (calculation.totalInstallments < 1) {
      Alert.alert('Error', 'Target date must be in the future');
      return;
    }

    try {
      setLoading(true);

      await createGoal({
        title: goalName.trim(),
        targetAmount: Number(targetAmount),
        totalMonths: calculation.totalInstallments,
        upiId: upiId.trim(),
      });

      Alert.alert(
        'Success!',
        'Your goal has been created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Create goal failed:', error);
      Alert.alert(
        'Something went wrong',
        error?.message || 'Unable to create goal. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="back-button">
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Create New Goal</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Goal Name */}
          <View style={styles.section}>
            <Text style={styles.label}>Goal Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., New iPhone, Vacation, Emergency Fund"
              placeholderTextColor="#999"
              value={goalName}
              onChangeText={setGoalName}
              autoFocus
              data-testid="goal-name-input"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory.id === category.id && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  data-testid={`category-${category.id}`}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[
                    styles.categoryText,
                    selectedCategory.id === category.id && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Target Amount */}
          <View style={styles.section}>
            <Text style={styles.label}>Target Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#999"
                value={targetAmount}
                onChangeText={(text) => setTargetAmount(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                data-testid="target-amount-input"
              />
            </View>
          </View>

          {/* Frequency Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Saving Frequency</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.frequencyOption,
                    frequency === option.id && styles.frequencyOptionActive
                  ]}
                  onPress={() => setFrequency(option.id)}
                  data-testid={`frequency-${option.id}`}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={frequency === option.id ? '#5B5FD8' : '#666'} 
                  />
                  <Text style={[
                    styles.frequencyText,
                    frequency === option.id && styles.frequencyTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Target Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Target Date</Text>
            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              data-testid="target-date-button"
            >
              <Ionicons name="calendar-outline" size={20} color="#5B5FD8" />
              <Text style={styles.dateText}>
                {format(targetDate, 'MMMM dd, yyyy')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);

                if (event.type === 'set' && selectedDate) {
                  setTargetDate(selectedDate);
                }
              }}
            />
          )}
          {/* UPI ID */}
          <View style={styles.section}>
            <Text style={styles.label}>Your UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., yourname@paytm"
              placeholderTextColor="#999"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
              keyboardType="email-address"
              data-testid="upi-id-input"
            />
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Goal:</Text>
              <Text style={styles.summaryValue}>{goalName || '—'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category:</Text>
              <Text style={styles.summaryValue}>{selectedCategory.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Target Amount:</Text>
              <Text style={styles.summaryValue}>
                {targetAmount ? `₹${parseInt(targetAmount).toLocaleString('en-IN')}` : '—'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Frequency:</Text>
              <Text style={styles.summaryValue}>
                {FREQUENCY_OPTIONS.find(f => f.id === frequency)?.label}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Target Date:</Text>
              <Text style={styles.summaryValue}>
                {format(targetDate, 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelHighlight}>
                {frequency === 'daily' ? 'Daily' : frequency === 'weekly' ? 'Weekly' : 'Monthly'} Saving:
              </Text>
              <Text style={styles.summaryValueHighlight}>
                {calculation.installmentAmount > 0 
                  ? `₹${calculation.installmentAmount.toLocaleString('en-IN')}`
                  : '—'
                }
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Installments:</Text>
              <Text style={styles.summaryValue}>
                {calculation.totalInstallments > 0 ? calculation.totalInstallments : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <Button
            title={loading ? "Creating..." : "Create Goal"}
            onPress={handleCreateGoal}
            variant="primary"
            disabled={!goalName.trim() || !targetAmount || !upiId.trim() || loading}
            data-testid="create-goal-button"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryScroll: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    borderColor: '#5B5FD8',
    backgroundColor: 'rgba(91, 95, 216, 0.05)',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#5B5FD8',
    fontWeight: '600',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5B5FD8',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  frequencyOptionActive: {
    borderColor: '#5B5FD8',
    backgroundColor: 'rgba(91, 95, 216, 0.05)',
  },
  frequencyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  frequencyTextActive: {
    color: '#5B5FD8',
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: 'rgba(91, 95, 216, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(91, 95, 216, 0.2)',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B5FD8',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(91, 95, 216, 0.2)',
    marginVertical: 12,
  },
  summaryLabelHighlight: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5B5FD8',
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5B5FD8',
  },
  bottomPadding: {
    height: 16,
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});
