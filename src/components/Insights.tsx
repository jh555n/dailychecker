import { StyleSheet, Text, View } from 'react-native';
import { bestStreak, calendarDays, Data, parseDate, streak } from '../domain';
import { palette, ui } from '../theme';
export function Insights({ data, today }: { data: Data; today: string }) {
  const days = calendarDays(today, 'week');
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={ui.title}>
        나의 꾸준함을 돌아봐요
      </Text>
      <Text style={ui.muted}>숫자는 평가가 아닌 발자국이에요. 쉬어간 날도 나의 기록입니다.</Text>
      {data.routines.length === 0 && (
        <Text style={ui.text}>루틴을 추가하면 이곳에 나의 흐름이 나타나요.</Text>
      )}
      {data.routines.map((r) => (
        <View key={r.id} style={ui.card}>
          <View style={ui.between}>
            <Text style={ui.title}>
              {r.symbol} {r.name}
            </Text>
            <Text style={ui.muted}>이번 주</Text>
          </View>
          <View style={styles.week}>
            {days.map((day) => {
              const value = data.records[day]?.[r.id];
              return (
                <View key={day} style={styles.day}>
                  <Text style={styles.dayLabel}>
                    {['일', '월', '화', '수', '목', '금', '토'][parseDate(day).getDay()]}
                  </Text>
                  <View
                    accessibilityLabel={`${day}, ${day > today ? '미래' : value === true ? 'YES' : value === false ? 'NO' : '미기록'}`}
                    style={[styles.circle, value === true && { backgroundColor: r.color }]}
                  >
                    <Text style={[styles.mark, value === true && styles.white]}>
                      {day > today ? '·' : value === true ? '✓' : value === false ? '−' : '·'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.counts}>
            <Text style={ui.muted}>
              현재 <Text style={styles.strong}>{streak(data.records, r.id, today)}일</Text> 연속
            </Text>
            <Text style={ui.muted}>
              최장 <Text style={styles.strong}>{bestStreak(data.records, r.id, today)}일</Text> 연속
            </Text>
            <Text style={ui.muted}>
              총{' '}
              <Text style={styles.strong}>
                {
                  Object.keys(data.records).filter(
                    (d) => d <= today && data.records[d]?.[r.id] === true,
                  ).length
                }
                일
              </Text>{' '}
              YES
            </Text>
          </View>
        </View>
      ))}
      <Text style={ui.muted}>
        YES는 연속일을 1일 늘리고, NO나 지나간 미기록일은 연속을 끊어요. 오늘을 아직 기록하지
        않았다면 어제까지의 연속일을 보여드려요.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { gap: 16 },
  week: { flexDirection: 'row', marginVertical: 24 },
  day: { flex: 1, alignItems: 'center', gap: 8 },
  dayLabel: { fontSize: 11, color: palette.muted },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: palette.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mark: { fontSize: 15, color: palette.muted },
  white: { color: '#FFF' },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  strong: { color: palette.ink, fontWeight: '700' },
});
