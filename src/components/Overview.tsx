import { StyleSheet, Text, View } from 'react-native';
import { calendarDays, Data, streak } from '../domain';
import { palette, ui } from '../theme';
export function Overview({
  data,
  today,
  compact,
}: {
  data: Data;
  today: string;
  compact: boolean;
}) {
  const days = calendarDays(today, 'week').filter((day) => day <= today);
  const yes = days.reduce(
    (sum, day) => sum + data.routines.filter((r) => data.records[day]?.[r.id] === true).length,
    0,
  );
  const best = Math.max(0, ...data.routines.map((r) => streak(data.records, r.id, today)));
  const done = data.routines.filter((r) => data.records[today]?.[r.id] !== undefined).length;
  return (
    <View style={[styles.overview, compact && styles.compact]}>
      {[
        {
          title: compact ? '현재 최장 연속' : '가장 긴 현재 연속일',
          number: best,
          unit: '일',
          symbol: '↗',
        },
        { title: '이번 주의 YES', number: yes, unit: '번', symbol: '✦' },
        { title: '오늘 남긴 기록', number: done, unit: `/ ${data.routines.length}`, symbol: '✓' },
      ].map((item, i) => (
        <View
          key={item.title}
          style={[styles.stat, i !== 2 && styles.divider, compact && styles.smallStat]}
        >
          <View style={ui.between}>
            <Text style={[ui.muted, compact && styles.smallLabel]}>{item.title}</Text>
            {!compact && <Text style={styles.icon}>{item.symbol}</Text>}
          </View>
          <Text style={styles.number}>
            {item.number}
            <Text style={styles.unit}> {item.unit}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  overview: {
    backgroundColor: palette.light,
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 28,
  },
  compact: { padding: 16 },
  stat: { flex: 1, paddingHorizontal: 24, gap: 12 },
  smallStat: { paddingHorizontal: 6, gap: 8 },
  divider: { borderRightWidth: 1, borderRightColor: '#CDD8CA' },
  smallLabel: { fontSize: 10, lineHeight: 16 },
  number: { fontSize: 30, fontWeight: '600', color: palette.ink, letterSpacing: -1 },
  unit: { fontSize: 13, color: palette.muted, fontWeight: '400' },
  icon: { fontSize: 20, color: palette.green },
});
