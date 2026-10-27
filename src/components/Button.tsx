import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { palette } from '../theme';
export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft' | 'plain' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        kind === 'primary' && styles.primary,
        kind === 'soft' && styles.soft,
        style,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Text
        style={[
          styles.label,
          kind === 'primary' && styles.white,
          kind === 'danger' && styles.danger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: palette.green },
  soft: { backgroundColor: palette.light },
  label: { fontSize: 14, fontWeight: '600', color: palette.green },
  white: { color: '#FFF' },
  danger: { color: palette.danger },
  dim: { opacity: 0.5 },
});
