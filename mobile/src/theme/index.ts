import { Easing } from 'react-native-reanimated';

/**
 * PlantPals design tokens.
 * Motion note: every duration/easing here is timing-based (no springs) so
 * transitions glide instead of bouncing or overshooting.
 */
export const colors = {
  background: '#F7F8F9',
  card: '#EDEEF0',
  cardElevated: '#FFFFFF',
  surface: '#FFFFFF',

  water: '#4FA8E0',
  waterDark: '#3B87BC',
  waterSoft: '#E4F1FB',

  green: '#5B8C5A',
  greenSoft: '#E6EFE5',

  text: '#2E2E2E',
  textMuted: '#7A7F87',
  textFaint: '#A4A9B0',
  textOnAccent: '#FFFFFF',

  border: '#E2E4E8',
  divider: '#ECEDF0',

  danger: '#D9584B',
  dangerSoft: '#FBE9E7',
  warning: '#E0913B',

  overlay: 'rgba(30,34,40,0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 30, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.3 },
  section: { fontSize: 18, fontWeight: '700' as const },
  cardTitle: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
  meta: { fontSize: 13, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
} as const;

export const shadow = {
  card: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  soft: {
    shadowColor: '#1F2937',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;

/** Timing presets — deliberately no spring config anywhere. */
export const motion = {
  fast: { duration: 180, easing: Easing.out(Easing.cubic) },
  base: { duration: 260, easing: Easing.out(Easing.cubic) },
  gentle: { duration: 360, easing: Easing.inOut(Easing.ease) },
  emphasized: { duration: 460, easing: Easing.out(Easing.cubic) },
} as const;

export const theme = { colors, spacing, radius, typography, shadow, motion };
export type Theme = typeof theme;
