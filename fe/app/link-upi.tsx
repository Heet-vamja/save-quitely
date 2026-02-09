import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function LinkUPI() {
  const router = useRouter();
  const { updateUser, user } = useAuth();
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!upiId.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      await updateUser({ upiId });
      Alert.alert(
        'Success!',
        'UPI ID linked successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to link UPI ID. Please try again.');
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.title}>Link UPI</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.icon}>
              <Ionicons name="card" size={48} color="#5B5FD8" />
            </View>
          </View>

          {/* Info */}
          <Text style={styles.infoTitle}>Link Your UPI ID</Text>
          <Text style={styles.infoText}>
            Enter your UPI ID to make quick and secure payments towards your savings goals.
          </Text>

          {/* Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>UPI ID</Text>
            <TextInput
              style={styles.input}
              placeholder="yourname@upi"
              placeholderTextColor="#999"
              value={upiId}
              onChangeText={setUpiId}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your UPI details are encrypted and stored securely
            </Text>
          </View>

          {/* Common UPI Providers */}
          <View style={styles.providersSection}>
            <Text style={styles.providersTitle}>Common UPI Apps</Text>
            <View style={styles.providersList}>
              <View style={styles.providerChip}>
                <Text style={styles.providerText}>@paytm</Text>
              </View>
              <View style={styles.providerChip}>
                <Text style={styles.providerText}>@phonepe</Text>
              </View>
              <View style={styles.providerChip}>
                <Text style={styles.providerText}>@googlepay</Text>
              </View>
              <View style={styles.providerChip}>
                <Text style={styles.providerText}>@ybl</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verify Button */}
        <View style={styles.footer}>
          <Button
            title="Verify & Link"
            onPress={handleVerify}
            variant="primary"
            loading={loading}
            disabled={!upiId.includes('@')}
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
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  icon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(91, 95, 216, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
  },
  providersSection: {
    marginTop: 8,
  },
  providersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  providersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  providerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});