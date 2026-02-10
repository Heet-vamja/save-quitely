import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { sendOtp } from '../src/services/api'; // 👈 adjust path if needed

export default function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleContinue = async () => {
    if (!name.trim() || phone.length !== 10) {
      Alert.alert('Error', 'Enter valid name and phone number');
      return;
    }

    setLoading(true);
    try {
      // 🔥 THIS IS THE MISSING PART
      await sendOtp({
        name: name.trim(),
        phone,
      });

      // navigate ONLY after OTP is sent
      router.push({
        pathname: '/verify-otp',
        params: { name, phone },
      });
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.message || 'Failed to send OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Text style={styles.logoEmoji}>✨</Text>
                </View>
              </View>
              <Text style={styles.appName}>SaveQuietly</Text>
              <Text style={styles.tagline}>
                Simple, private money planning
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Get started</Text>
                <Text style={styles.cardSubtitle}>
                  Enter your details to continue securely.
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Your Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={(text) =>
                        setPhone(text.replace(/[^0-9]/g, ''))
                      }
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                <Button
                  title="Continue"
                  onPress={handleContinue}
                  loading={loading}
                  variant="primary"
                  disabled={!name.trim() || phone.length !== 10 || loading}
                  style={styles.continueButton}
                />

                <View style={styles.securityNote}>
                  <Ionicons
                    name="shield-checkmark"
                    size={20}
                    color="#4CAF50"
                  />
                  <Text style={styles.securityText}>
                    Your data is encrypted & never shared
                  </Text>
                </View>
              </View>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>
                  Terms & Privacy Policy
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 32,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  phoneInput: {
    flex: 1,
  },
  continueButton: {
    marginTop: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  securityText: {
    fontSize: 13,
    color: '#666',
  },
  termsText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingVertical: 16,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});