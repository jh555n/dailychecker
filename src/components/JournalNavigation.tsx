import { Pressable, Text, View } from 'react-native';
import { appStyles as styles } from '../appStyles';
import { Button } from './Button';
export type Tab = 'calendar' | 'routines' | 'insights';
export function JournalNavigation({
  tab,
  compact,
  onTab,
  onAdd,
}: {
  tab: Tab;
  compact: boolean;
  onTab: (tab: Tab) => void;
  onAdd: () => void;
}) {
  return (
    <View style={styles.toolbar}>
      <View accessibilityRole="tablist" accessibilityLabel="기록 메뉴" style={styles.tabs}>
        {(
          [
            { id: 'calendar', label: '나의 기록' },
            { id: 'routines', label: '루틴 관리' },
            { id: 'insights', label: '돌아보기' },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.id }}
            aria-selected={tab === item.id}
            onPress={() => onTab(item.id)}
            style={[styles.tab, tab === item.id && styles.activeTab]}
          >
            <Text style={[styles.tabLabel, tab === item.id && styles.activeLabel]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {!compact && <Button label="＋  루틴 추가" kind="plain" onPress={onAdd} />}
    </View>
  );
}
