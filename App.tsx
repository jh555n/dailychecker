import { useEffect, useRef, useState } from 'react';
import { AppState, ScrollView, StatusBar, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { dateKey, removeRoutine, Routine, setRecords } from './src/domain';
import { useJournal } from './src/useJournal';
import { ui } from './src/theme';
import { appStyles as styles } from './src/appStyles';
import { JournalHeader, JournalHero, JournalFooter } from './src/components/JournalFrame';
import { JournalNavigation, Tab } from './src/components/JournalNavigation';
import { RoutineManager } from './src/components/RoutineManager';
import { Button } from './src/components/Button';
import { Calendar } from './src/components/Calendar';
import { RecordSheet } from './src/components/RecordSheet';
import { RoutineSheet } from './src/components/RoutineSheet';
import { RoutineList } from './src/components/RoutineList';
import { Overview } from './src/components/Overview';
import { Insights } from './src/components/Insights';
import { PrivacySheet } from './src/components/PrivacySheet';

type Dialog =
  | { type: 'record'; day: string }
  | { type: 'routine'; routine?: Routine }
  | { type: 'privacy' }
  | null;
function Journal() {
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const stacked = width < 960;
  const { data, ready, busy, error, save, reload } = useJournal();
  const [today, setToday] = useState(() => dateKey(new Date()));
  const todayRef = useRef(today);
  const [selected, setSelected] = useState(today);
  const [anchor, setAnchor] = useState(today);
  const [mode, setMode] = useState<'month' | 'week'>('month');
  const [tab, setTab] = useState<Tab>('calendar');
  const [dialog, setDialog] = useState<Dialog>(null);
  useEffect(() => {
    function refresh() {
      const next = dateKey(new Date());
      const previous = todayRef.current;
      if (previous !== next) {
        todayRef.current = next;
        setToday(next);
        setSelected((day) => (day === previous || day > next ? next : day));
        setAnchor((day) => (day === previous ? next : day));
      }
    }
    const timer = setInterval(refresh, 15000);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, []);
  const add = () => setDialog({ type: 'routine' });
  const record = () =>
    data.routines.length ? setDialog({ type: 'record', day: selected }) : add();
  async function saveRoutine(routine: Routine) {
    if (
      await save((previous) => ({
        ...previous,
        routines: previous.routines.some((r) => r.id === routine.id)
          ? previous.routines.map((r) => (r.id === routine.id ? routine : r))
          : [...previous.routines, routine],
      }))
    )
      setDialog(null);
  }
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.page, compact && styles.mobile]}>
          <JournalHeader today={today} compact={compact} />
          <JournalHero compact={compact} />
          {!ready ? (
            <View style={ui.card}>
              {error ? (
                <>
                  <Text accessibilityRole="alert" style={ui.error}>
                    {error}
                  </Text>
                  <Button label="다시 불러오기" onPress={() => void reload()} />
                </>
              ) : (
                <Text style={ui.text}>하루의 기록을 불러오고 있어요…</Text>
              )}
            </View>
          ) : (
            <>
              <Overview data={data} today={today} compact={compact} />
              <JournalNavigation tab={tab} compact={compact} onTab={setTab} onAdd={add} />
              {error && !dialog ? (
                <Text accessibilityRole="alert" style={ui.error}>
                  {error}
                </Text>
              ) : null}
              {tab === 'calendar' && (
                <View style={[styles.columns, stacked && styles.stacked]}>
                  <View style={stacked ? styles.mobileCalendar : styles.calendarColumn}>
                    <Calendar
                      data={data}
                      anchor={anchor}
                      selected={selected}
                      today={today}
                      mode={mode}
                      onAnchor={setAnchor}
                      onSelect={(day) => {
                        setSelected(day);
                        if (day.slice(0, 7) !== anchor.slice(0, 7)) setAnchor(day);
                      }}
                      onMode={(next) => {
                        setMode(next);
                        setAnchor(selected);
                      }}
                    />
                  </View>
                  <View style={[styles.sideColumn, stacked && styles.mobileSide]}>
                    <RoutineList
                      data={data}
                      day={selected}
                      today={today}
                      onRecord={record}
                      onAdd={add}
                    />
                    <View style={styles.reminder}>
                      <Text style={styles.spark}>✦</Text>
                      <View style={styles.reminderText}>
                        <Text style={styles.reminderTitle}>하루를 쉬어가도 괜찮아요</Text>
                        <Text style={ui.muted}>다시 시작하는 오늘도, 충분히 의미 있으니까요.</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
              {tab === 'routines' && (
                <RoutineManager
                  routines={data.routines}
                  onAdd={add}
                  onEdit={(routine) => setDialog({ type: 'routine', routine })}
                />
              )}
              {tab === 'insights' && <Insights data={data} today={today} />}
              {compact && tab === 'calendar' && (
                <Button
                  label="＋  새 루틴 만들기"
                  kind="plain"
                  onPress={add}
                  style={styles.mobileAdd}
                />
              )}
            </>
          )}
          <JournalFooter onPrivacy={() => setDialog({ type: 'privacy' })} />
        </View>
      </ScrollView>
      {dialog?.type === 'record' && (
        <RecordSheet
          key={dialog.day}
          day={dialog.day}
          data={data}
          busy={busy}
          error={error}
          onClose={() => setDialog(null)}
          onSave={async (values) => {
            if (
              await save((previous) =>
                setRecords(previous, dialog.day, values, dateKey(new Date())),
              )
            )
              setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'routine' && (
        <RoutineSheet
          routine={dialog.routine}
          names={data.routines.filter((r) => r.id !== dialog.routine?.id).map((r) => r.name)}
          busy={busy}
          error={error}
          onClose={() => setDialog(null)}
          onSave={saveRoutine}
          onDelete={async (id) => {
            if (await save((previous) => removeRoutine(previous, id))) setDialog(null);
          }}
        />
      )}
      {dialog?.type === 'privacy' && <PrivacySheet onClose={() => setDialog(null)} />}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <Journal />
    </SafeAreaProvider>
  );
}
