import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { palette, ui } from '../theme';
export function Sheet({
  title,
  subtitle,
  onClose,
  children,
  busy,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
  busy?: boolean;
}) {
  return (
    <Modal
      visible
      transparent
      accessibilityLabel={title}
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <SafeAreaView style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.wrapper}
        >
          <View style={styles.sheet} accessibilityViewIsModal>
            <View style={[ui.between, styles.heading]}>
              <Text accessibilityRole="header" style={ui.title}>
                {title}
              </Text>
              <Button label="닫기" kind="plain" onPress={onClose} disabled={busy} />
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <Text style={ui.muted}>{subtitle}</Text>
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22,40,30,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  wrapper: { width: '100%', maxWidth: 520, maxHeight: '95%' },
  sheet: { backgroundColor: palette.bg, borderRadius: 24, flexShrink: 1, overflow: 'hidden' },
  heading: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  content: { padding: 24, paddingTop: 0, gap: 20 },
});
