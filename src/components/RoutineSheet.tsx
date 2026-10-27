import { useState } from 'react';
import { toggleAccessibility } from '../accessibility';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, Routine } from '../domain';
import { palette, ui } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';
const SYMBOLS = ['◈', '◇', '↗', '✦', '○'];
const COLOR_NAMES = ['초록', '주황', '파랑', '갈색', '보라'];
export function RoutineSheet({
  routine,
  names,
  busy,
  error,
  onClose,
  onSave,
  onDelete,
}: {
  routine?: Routine;
  names: string[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (routine: Routine) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [name, setName] = useState(routine?.name ?? '');
  const [color, setColor] = useState(routine?.color ?? COLORS[0]);
  const [symbol, setSymbol] = useState(routine?.symbol ?? SYMBOLS[0]!);
  const [deleting, setDeleting] = useState(false);
  const duplicate = names.some(
    (n) => n.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
  );
  return (
    <Sheet
      title={routine ? '루틴 다듬기' : '새로운 루틴'}
      subtitle="나에게 의미 있는 작은 약속을 정해보세요. 매일 YES 또는 NO로 기록할 수 있어요."
      onClose={onClose}
      busy={busy}
    >
      <View style={styles.field}>
        <Text style={styles.label}>루틴 이름</Text>
        <TextInput
          accessibilityLabel="루틴 이름"
          autoFocus
          value={name}
          onChangeText={setName}
          editable={!busy && !deleting}
          maxLength={30}
          placeholder="예: 책 10쪽 읽기"
          placeholderTextColor={palette.muted}
          style={styles.input}
          returnKeyType="done"
        />
        <Text style={ui.muted}>
          {duplicate ? '이미 같은 이름의 루틴이 있어요.' : `${name.length}/30자`}
        </Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>나만의 색</Text>
        <View style={styles.options}>
          {COLORS.map((c, i) => (
            <Pressable
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`${COLOR_NAMES[i]} 색상`}
              {...toggleAccessibility(c === color, busy || deleting)}
              disabled={busy || deleting}
              onPress={() => setColor(c)}
              style={[styles.color, { backgroundColor: c }]}
            >
              <Text style={styles.check}>{c === color ? '✓' : ''}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>심볼</Text>
        <View style={styles.options}>
          {SYMBOLS.map((s, i) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              accessibilityLabel={`심볼 ${i + 1}`}
              {...toggleAccessibility(symbol === s, busy || deleting)}
              disabled={busy || deleting}
              onPress={() => setSymbol(s)}
              style={[styles.symbol, symbol === s && styles.selected]}
            >
              <Text style={styles.symbolText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      ) : null}
      {deleting && routine ? (
        <View style={styles.confirm}>
          <Text style={ui.text}>
            ‘{routine.name}’과 모든 날짜의 기록을 삭제할까요? 삭제 후에는 되돌릴 수 없어요.
          </Text>
          <Button
            label="루틴과 기록 삭제"
            kind="danger"
            disabled={busy}
            onPress={() => void onDelete(routine.id)}
          />
          <Button label="취소" kind="soft" disabled={busy} onPress={() => setDeleting(false)} />
        </View>
      ) : (
        <>
          <Button
            label={busy ? '저장 중…' : routine ? '변경 저장하기' : '루틴 추가하기'}
            disabled={busy || !name.trim() || duplicate}
            onPress={() =>
              void onSave({
                id:
                  routine?.id ?? `routine-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                name: name.trim(),
                color,
                symbol,
              })
            }
          />
          {routine && (
            <Button
              label="이 루틴 삭제"
              kind="danger"
              disabled={busy}
              onPress={() => setDeleting(true)}
            />
          )}
        </>
      )}
    </Sheet>
  );
}
const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: palette.ink, fontWeight: '600', fontSize: 14 },
  input: {
    backgroundColor: palette.surface,
    borderColor: palette.line,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: palette.ink,
    minHeight: 52,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  color: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: { color: '#FFF', fontSize: 20 },
  symbol: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolText: { fontSize: 22, color: palette.green },
  selected: { backgroundColor: palette.light, borderColor: palette.green },
  confirm: { gap: 12 },
});
