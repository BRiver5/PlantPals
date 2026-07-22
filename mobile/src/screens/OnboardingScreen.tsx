import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { Screen } from '@/components/Screen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, motion, radius, spacing, typography } from '@/theme';
import { useApp } from '@/state/AppContext';
import { requestPermission } from '@/lib/notifications';

const ENTER = FadeIn.duration(motion.gentle.duration);
const EXIT = FadeOut.duration(motion.fast.duration);

export function OnboardingScreen() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState<'welcome' | 'notify'>('welcome');
  const [working, setWorking] = useState(false);

  const enableReminders = async () => {
    setWorking(true);
    try {
      await requestPermission();
    } finally {
      setWorking(false);
      await completeOnboarding();
    }
  };

  return (
    <Screen padded edges={['top', 'bottom']}>
      <View style={styles.container}>
        {step === 'welcome' ? (
          <Animated.View key="welcome" entering={ENTER} exiting={EXIT} style={styles.panel}>
            <View style={styles.hero}>
              <View style={styles.logo}>
                <Ionicons name="leaf" size={56} color={colors.green} />
              </View>
              <Text style={styles.title}>PlantPals</Text>
              <Text style={styles.tagline}>Keep your green friends happy.</Text>
              <Text style={styles.body}>
                A calm, simple way to remember when to water every plant — and to look back on how
                well you have kept up.
              </Text>
            </View>
            <View style={styles.actions}>
              <PrimaryButton label="Get Started" icon="arrow-forward" onPress={() => setStep('notify')} />
            </View>
          </Animated.View>
        ) : (
          <Animated.View key="notify" entering={ENTER} exiting={EXIT} style={styles.panel}>
            <View style={styles.hero}>
              <View style={[styles.logo, { backgroundColor: colors.waterSoft }]}>
                <Ionicons name="notifications" size={52} color={colors.water} />
              </View>
              <Text style={styles.title}>Watering reminders</Text>
              <Text style={styles.body}>
                PlantPals can send you a gentle local notification when a plant is due for watering,
                based on the schedule you set for it. Notifications stay on your device and you can
                turn them off any time in Settings.
              </Text>
            </View>
            <View style={styles.actions}>
              <PrimaryButton
                label="Enable reminders"
                icon="notifications-outline"
                onPress={enableReminders}
                loading={working}
              />
              <PrimaryButton
                label="Not now"
                variant="ghost"
                onPress={completeOnboarding}
                style={styles.secondaryAction}
              />
            </View>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  panel: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing.xxl },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: {
    width: 112,
    height: 112,
    borderRadius: radius.pill,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...typography.hero, color: colors.text, textAlign: 'center' },
  tagline: {
    ...typography.section,
    color: colors.green,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  actions: {},
  secondaryAction: { marginTop: spacing.md },
});
