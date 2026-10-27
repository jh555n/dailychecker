import { Platform } from 'react-native';

// Native uses accessibilityState; React Native Web exposes toggle state through ARIA.
export function toggleAccessibility(selected: boolean, disabled = false) {
  return {
    accessibilityState: { selected, disabled },
    ...(Platform.OS === 'web' ? { 'aria-pressed': selected } : {}),
  };
}
