import { StyleSheet, Text, View } from 'react-native';
import { Data, streak } from '../domain';
import { palette, ui } from '../theme';
import { Button } from './Button';
export function RoutineList({
  data,
  day,
  today,
  onRecord,
  onAdd,
}: {
  data: Data;
  day: string;
  today: string;
  onRecord: () => void;
  onAdd: () => void;
}) {
  const completed = data.routines.filter((r) => data.records[day]?.[r.id] === true).length;
  const recorded = data.routines.filter((r) => data.records[day]?.[r.id] !== undefined).length;
  return (
    <View style={[ui.card, styles.card]}>
      <View style={ui.between}>
        <Text accessibilityRole="header" style={ui.title}>
          {day === today
            ? '오늘의 루틴'
            : `${Number(day.slice(5, 7))}월 ${Number(day.slice(8))}일의 루틴`}
        </Text>
        <Text style={ui.muted}>
          {recorded}/{data.routines.length} 기록
        </Text>
      </View>
      <Text style={[ui.muted, styles.description]}>
        {recorded === data.routines.length && recorded > 0
          ? '오늘의 솔직한 기록, 잘 남겼어요.'
          : '완벽한 하루보다, 꾸준한 하루.'}
      </Text>
      <View style={styles.progress}>
        <View
          style={[
            styles.progressFill,
            { width: `${data.routines.length ? (completed / data.routines.length) * 100 : 0}%` },
          ]}
        />
      </View>
      {data.routines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptySymbol}>✦</Text>
          <Text style={ui.text}>어떤 하루를 만들고 싶나요?</Text>
          <Text style={ui.muted}>첫 루틴을 추가하고 작은 변화를 시작해보세요.</Text>
          <Button label="첫 루틴 만들기" kind="soft" onPress={onAdd} />
        </View>
      ) : (
        data.routines.map((r) => {
          const value = data.records[day]?.[r.id];
          return (
            <View key={r.id} style={styles.routine}>
              <View style={[styles.icon, { backgroundColor: `${r.color}12` }]}>
                <Text style={[styles.symbol, { color: r.color }]}>{r.symbol}</Text>
              </View>
              <View style={styles.detail}>
                <Text style={styles.name}>{r.name}</Text>
                <Text style={ui.muted}>현재 {streak(data.records, r.id, today)}일 연속</Text>
              </View>
              <View style={[styles.status, value === true && styles.statusYes]}>
                <Text style={[styles.statusText, value === true && styles.yesText]}>
                  {value === true ? '✓ YES' : value === false ? '− NO' : '미기록'}
                </Text>
              </View>
            </View>
          );
        })
      )}
      {data.routines.length > 0 && (
        <Button label="＋  기록 남기기" onPress={onRecord} style={styles.record} />
      )}
      <Text style={styles.note}>오늘 미기록은 어제까지의 연속일을 유지해요.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { padding: 24 },
  description: { marginTop: 8 },
  progress: {
    height: 4,
    backgroundColor: palette.light,
    borderRadius: 4,
    marginTop: 20,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: palette.green, height: 4 },
  routine: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: palette.line,
  },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  symbol: { fontSize: 25 },
  detail: { flex: 1, gap: 4 },
  name: { fontSize: 15, color: palette.ink, fontWeight: '600' },
  status: { borderRadius: 8, backgroundColor: palette.bg, padding: 8 },
  statusYes: { backgroundColor: palette.light },
  statusText: { fontSize: 11, fontWeight: '600', color: palette.muted },
  yesText: { color: palette.green },
  record: { marginTop: 24 },
  note: { color: palette.muted, fontSize: 11, lineHeight: 18, marginTop: 12, textAlign: 'center' },
  empty: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  emptySymbol: { color: palette.green, fontSize: 32 },
});
