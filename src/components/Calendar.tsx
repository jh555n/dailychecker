import { Pressable, StyleSheet, Text, View } from 'react-native';
import { calendarDays, Data, dateKey, parseDate, shiftDay } from '../domain';
import { palette, ui } from '../theme';
import { Button } from './Button';
import { toggleAccessibility } from '../accessibility';

type Props = {
  anchor: string;
  selected: string;
  today: string;
  mode: 'month' | 'week';
  data: Data;
  onAnchor: (day: string) => void;
  onSelect: (day: string) => void;
  onMode: (mode: 'month' | 'week') => void;
};
export function Calendar({
  anchor,
  selected,
  today,
  mode,
  data,
  onAnchor,
  onSelect,
  onMode,
}: Props) {
  const date = parseDate(anchor);
  function move(offset: number) {
    if (mode === 'week') onAnchor(shiftDay(anchor, offset * 7));
    else onAnchor(dateKey(new Date(date.getFullYear(), date.getMonth() + offset, 1, 12)));
  }
  const days = calendarDays(anchor, mode);
  return (
    <View style={[ui.card, styles.card]}>
      <View style={ui.between}>
        <Text style={ui.eyebrow}>MY CALENDAR</Text>
        <View style={styles.toggle}>
          {(['month', 'week'] as const).map((value) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityLabel={value === 'month' ? '월 보기' : '주 보기'}
              {...toggleAccessibility(mode === value)}
              onPress={() => onMode(value)}
              style={[styles.tab, mode === value && styles.activeTab]}
            >
              <Text style={[styles.tabText, mode === value && styles.activeTabText]}>
                {value === 'month' ? '월' : '주'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={[ui.between, styles.month]}>
        <Text accessibilityRole="header" style={styles.monthTitle}>
          {date.getFullYear()}년 {date.getMonth() + 1}월
        </Text>
        <View style={styles.navigation}>
          <Button
            kind="plain"
            label="‹"
            accessibilityLabel={mode === 'month' ? '이전 달' : '이전 주'}
            onPress={() => move(-1)}
          />
          <Button
            kind="soft"
            label="오늘"
            onPress={() => {
              onAnchor(today);
              onSelect(today);
            }}
          />
          <Button
            kind="plain"
            label="›"
            accessibilityLabel={mode === 'month' ? '다음 달' : '다음 주'}
            onPress={() => move(1)}
          />
        </View>
      </View>
      <View style={styles.grid}>
        {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
          <Text key={day} style={styles.weekday}>
            {day}
          </Text>
        ))}
        {days.map((day) => {
          const entries = data.records[day] ?? {};
          const yes = data.routines.filter((r) => entries[r.id] === true);
          const no = data.routines.filter((r) => entries[r.id] === false);
          const future = day > today;
          const isSelected = day === selected;
          const adjacent = parseDate(day).getMonth() !== date.getMonth();
          return (
            <View key={day} style={styles.cell}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${day}${day === today ? ', 오늘' : ''}, YES ${yes.length}개, NO ${no.length}개${future ? ', 미래 날짜' : ''}`}
                {...toggleAccessibility(isSelected, future)}
                disabled={future}
                onPress={() => onSelect(day)}
                style={({ pressed }) => [
                  styles.day,
                  isSelected && styles.selected,
                  day === today && !isSelected && styles.today,
                  future && styles.faded,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.number,
                    adjacent && styles.adjacent,
                    day === today && styles.todayText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {parseDate(day).getDate()}
                </Text>
                <View style={styles.dots}>
                  {yes.slice(0, 3).map((r) => (
                    <View
                      key={r.id}
                      style={[styles.dot, { backgroundColor: isSelected ? '#FFFFFF' : r.color }]}
                    />
                  ))}
                  {yes.length > 3 && (
                    <Text style={[styles.extra, isSelected && styles.selectedText]}>+</Text>
                  )}
                  {yes.length === 0 && no.length > 0 && (
                    <Text style={[styles.extra, isSelected && styles.selectedText]}>−</Text>
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        {data.routines.map((r) => (
          <View key={r.id} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: r.color }]} />
            <Text style={ui.muted}>{r.name}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>● YES 기록 − NO만 기록 · 날짜를 눌러 지난 기록도 남겨보세요.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { padding: 20 },
  toggle: { flexDirection: 'row', backgroundColor: palette.bg, borderRadius: 10, padding: 3 },
  tab: {
    minWidth: 44,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeTab: { backgroundColor: palette.green },
  tabText: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#FFF' },
  month: { marginVertical: 20, flexWrap: 'wrap' },
  monthTitle: { color: palette.ink, fontWeight: '700', fontSize: 23, letterSpacing: -1 },
  navigation: { flexDirection: 'row', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: '14.285714%',
    textAlign: 'center',
    color: palette.muted,
    fontSize: 12,
    paddingBottom: 12,
  },
  cell: { width: '14.285714%', alignItems: 'center', paddingVertical: 3 },
  day: {
    width: '96%',
    maxWidth: 68,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selected: { backgroundColor: palette.green },
  today: { borderColor: palette.green, backgroundColor: palette.light },
  number: { color: palette.ink, fontSize: 15, fontWeight: '500' },
  todayText: { color: palette.green, fontWeight: '700' },
  selectedText: { color: '#FFF' },
  faded: { opacity: 0.35 },
  adjacent: { color: palette.muted },
  pressed: { opacity: 0.6 },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 12, marginTop: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  extra: { fontSize: 11, color: palette.muted },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: palette.line,
    marginTop: 16,
    paddingTop: 16,
  },
  legendItem: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  hint: { fontSize: 11, lineHeight: 18, color: palette.muted, marginTop: 12 },
});
