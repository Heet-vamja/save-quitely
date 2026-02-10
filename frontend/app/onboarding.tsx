import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { GradientBackground } from '../components/GradientBackground';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ONBOARDING_SCREENS = [
  {
    title: 'Never worry about\nmoney again',
    description: 'Build savings habits that stick. Plan for what matters and watch your goals come to life.',
    image: require('../assets/images/app-image.png'),
    emoji: '🐷'
  },
  {
    title: 'Make every rupee\ncount',
    description: 'See exactly where your money goes and allocate it to goals that matter to you.',
    image: require('../assets/images/app-image.png'),
    emoji: '📊'
  },
  {
    title: 'Reach your dreams\nfaster',
    description: 'Track progress in real-time. Stay motivated with clear milestones and smart planning.',
    image: require('../assets/images/app-image.png'),
    emoji: '🎯'
  }
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();
  const { completeOnboarding } = useAuth();

  const handleContinue = () => {
    if (currentIndex < ONBOARDING_SCREENS.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  const isLastScreen = currentIndex === ONBOARDING_SCREENS.length - 1;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>✨</Text>
            </View>
            <Text style={styles.logoText}>SaveQuietly</Text>
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
        >
          {ONBOARDING_SCREENS.map((screen, index) => (
            <View key={index} style={[styles.slide, { width }]}>
              <View style={styles.illustrationContainer}>
                <View style={styles.illustration}>
                  <Text style={styles.illustrationEmoji}>{screen.emoji}</Text>
                </View>
              </View>

              <View style={styles.contentContainer}>
                <Text style={styles.title}>{screen.title}</Text>
                <Text style={styles.description}>{screen.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {ONBOARDING_SCREENS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot
                ]}
              />
            ))}
          </View>

          <Button
            title={isLastScreen ? 'Get Started' : 'Continue'}
            onPress={handleContinue}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  illustration: {
    width: 280,
    height: 280,
    borderRadius: 40,
    backgroundColor: 'rgba(123, 131, 235, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  illustrationEmoji: {
    fontSize: 120,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
  },
  button: {
    width: '100%',
  },
});