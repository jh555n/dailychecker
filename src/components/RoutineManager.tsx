import { Text, View } from 'react-native';
import { Routine } from '../domain';
import { ui } from '../theme';
import { appStyles as styles } from '../appStyles';
import { Button } from './Button';
export function RoutineManager({
  routines,
  onAdd,
  onEdit,
}: {
  routines: Routine[];
  onAdd: () => void;
  onEdit: (routine: Routine) => void;
}) {
  return (
    <View style={styles.management}>
      <View style={ui.between}>
        <Text accessibilityRole="header" style={ui.title}>
          나와의 작은 약속 {routines.length}
        </Text>
        <Button label="＋ 추가" onPress={onAdd} />
      </View>
      <Text style={ui.muted}>이름과 색을 바꿔 나에게 맞는 루틴을 만들어보세요.</Text>
      {routines.length === 0 && (
        <Text style={ui.text}>아직 루틴이 없어요. 첫 약속을 추가해보세요.</Text>
      )}
      {routines.map((r) => (
        <View key={r.id} style={[ui.card, ui.between]}>
          <View style={[ui.row, styles.growRow]}>
            <Text style={[styles.routineSymbol, { color: r.color }]}>{r.symbol}</Text>
            <Text style={[ui.text, styles.routineName]}>{r.name}</Text>
          </View>
          <Button
            label="수정"
            accessibilityLabel={`${r.name} 수정`}
            kind="soft"
            onPress={() => onEdit(r)}
          />
        </View>
      ))}
    </View>
  );
}
