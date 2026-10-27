import { useState } from 'react';
import { toggleAccessibility } from '../accessibility';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Data, parseDate } from '../domain';
import { palette, ui } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

export function RecordSheet({
  day,
  data,
  busy,
  error,
  onClose,
  onSave,
}: {
  day: string;
  data: Data;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (values: Record<string, boolean>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, boolean>>({ ...data.records[day] });
  const date = parseDate(day);
  return (
    <Sheet
      title={`${date.getMonth() + 1}월 ${date.getDate()}일의 기록`}
      subtitle="해냈다면 YES, 쉬어갔다면 NO. 선택하지 않은 루틴은 미기록으로 남아요."
      onClose={onClose}
      busy={busy}
    >
      {data.routines.map((r) => (
        <View key={r.id} style={styles.item}>
          <View style={ui.between}>
            <Text style={[ui.text, styles.name]}>
              {r.symbol} {r.name}
            </Text>
            <Button
              label="선택 해제"
              kind="plain"
              onPress={() =>
                setValues((old) => {
                  const next = { ...old };
                  delete next[r.id];
                  return next;
                })
              }
              disabled={busy || values[r.id] === undefined}
            />
          </View>
          <View style={styles.choices}>
            {([true, false] as const).map((value) => (
              <Pressable
                key={String(value)}
                accessibilityRole="button"
                accessibilityLabel={`${r.name} ${value ? 'YES' : 'NO'}`}
                {...toggleAccessibility(values[r.id] === value, busy)}
                disabled={busy}
                onPress={() => setValues((old) => ({ ...old, [r.id]: value }))}
                style={[styles.choice, values[r.id] === value && (value ? styles.yes : styles.no)]}
              >
                <Text style={[styles.choiceText, values[r.id] === value && value && styles.white]}>
                  {value ? '✓  YES' : '−  NO'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      {error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      ) : null}
      <Text style={ui.muted}>
        NO는 연속일을 0으로 바꿔요. 지난 기록을 수정하면 연속일도 다시 계산돼요.
      </Text>
      <Button
        label={busy ? '저장 중…' : '기록 저장하기'}
        disabled={busy}
        onPress={() => void onSave(values)}
      />
    </Sheet>
  );
}
const styles = StyleSheet.create({
  item: { borderBottomWidth: 1, borderBottomColor: palette.line, paddingBottom: 20, gap: 8 },
  name: { fontWeight: '600', flex: 1 },
  choices: { flexDirection: 'row', gap: 12 },
  choice: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.line,
    backgroundColor: palette.surface,
    borderRadius: 12,
  },
  yes: { backgroundColor: palette.green, borderColor: palette.green },
  no: { backgroundColor: palette.sand, borderColor: palette.muted },
  choiceText: { color: palette.ink, fontWeight: '600', fontSize: 15 },
  white: { color: '#FFF' },
});
