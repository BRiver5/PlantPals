import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, radius, spacing, typography } from '@/theme';

interface Props {
  title: string;
  right?: React.ReactNode;
}

/** Simple back-header used by stack screens. */
export function NavHeader({ title, right }: Props) {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.iconButton}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.section, color: colors.text, flex: 1, marginLeft: spacing.md },
  right: { minWidth: 40, alignItems: 'flex-end' },
});
