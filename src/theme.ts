import { StyleSheet } from 'react-native';
export const palette = {
  bg: '#F7F7F2',
  surface: '#FFFFFF',
  ink: '#243D32',
  muted: '#5C685E',
  green: '#2F654D',
  light: '#EAF0E7',
  line: '#E2E6DE',
  sand: '#F0EEE4',
  danger: '#A33C32',
};
export const ui = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { color: palette.ink, fontSize: 22, fontWeight: '700', letterSpacing: -0.7 },
  text: { color: palette.ink, fontSize: 15, lineHeight: 23 },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 21 },
  eyebrow: { color: palette.green, fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  card: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 20,
    padding: 24,
  },
  error: {
    backgroundColor: '#FFF0EC',
    borderRadius: 12,
    padding: 16,
    color: palette.danger,
    lineHeight: 22,
  },
});
