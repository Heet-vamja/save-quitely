import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../components/GradientBackground';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { verifyOtp } from '../src/services/api'; // 👈 IMPORTANT

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setSession } = useAuth(); // 👈 use correct auth setter

  const name = params.name as string;
  const phone = params.phone as string;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 4) {
      Alert.alert('Error', 'Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      // 🔥 REAL API CALL
      const result = await verifyOtp({
        phone,
        otp: otpString,
      });

      if (!result?.access_token) {
        throw new Error('Invalid OTP');
      }

      // store token + user in auth context
      setSession({
        token: result.access_token,
        user: result.user,
      });

      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert(
        'Verification failed',
        err?.message || 'Invalid OTP. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.back();
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
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
                <Text style={styles.cardTitle}>Verify OTP</Text>
                <Text style={styles.cardSubtitle}>
                  Sent to +91 {phone}
                </Text>

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      style={[
                        styles.otpInput,
                        digit && styles.otpInputFilled,
                      ]}
                      value={digit}
                      onChangeText={(value) =>
                        handleOtpChange(value, index)
                      }
                      onKeyPress={(e) =>
                        handleKeyPress(e, index)
                      }
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                    />
                  ))}
                </View>

                <Button
                  title="Verify & Continue"
                  onPress={handleVerify}
                  loading={loading}
                  disabled={otp.join('').length !== 4 || loading}
                  variant="primary"
                  style={styles.verifyButton}
                />

                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.editButton}
                >
                  <Text style={styles.editText}>
                    Edit name or phone number
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>
                  Terms & Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
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
  content: {
    flex: 1,
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
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A1A1A',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpInputFilled: {
    borderColor: '#5B5FD8',
    backgroundColor: 'rgba(91, 95, 216, 0.05)',
  },
  verifyButton: {
    marginBottom: 16,
  },
  editButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  editText: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'underline',
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