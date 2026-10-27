import { Text, View } from 'react-native';
import { ui } from '../theme';
import { appStyles as styles } from '../appStyles';
import { Button } from './Button';

export function JournalHeader({ today, compact }: { today: string; compact: boolean }) {
  return (
    <View style={styles.header}>
      <View style={ui.row}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>d.</Text>
        </View>
        <View>
          <Text style={styles.brand}>daily checker</Text>
          <Text style={styles.brandSub}>하루를 쌓는 작은 습관</Text>
        </View>
      </View>
      {!compact && <Text style={ui.muted}>ONE DAY, ONE SMALL STEP.</Text>}
      <View style={styles.dateBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.dateText}>
          {Number(today.slice(5, 7))}.{Number(today.slice(8))} 오늘
        </Text>
      </View>
    </View>
  );
}
export function JournalHero({ compact }: { compact: boolean }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroCopy}>
        <Text style={ui.eyebrow}>A LITTLE BETTER, EVERY DAY</Text>
        <Text accessibilityRole="header" style={[styles.heroTitle, compact && styles.mobileTitle]}>
          작은 기록이,{'\n'}나를 만듭니다<Text style={styles.period}>.</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          어제보다 완벽하지 않아도 괜찮아요.{'\n'}오늘의 작은 약속을 하나씩 쌓아보세요.
        </Text>
      </View>
      {!compact && (
        <View accessible={false} style={styles.illustration}>
          <View style={styles.orbit} />
          <View style={styles.stem} />
          <View style={[styles.leaf, styles.leafOne]} />
          <View style={[styles.leaf, styles.leafTwo]} />
          <View style={[styles.leaf, styles.leafThree]} />
          <View style={styles.seed} />
          <Text style={styles.grow}>GROW AT YOUR OWN PACE</Text>
        </View>
      )}
    </View>
  );
}
export function JournalFooter({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerBrand}>daily checker</Text>
      <Text style={styles.footerText}>나만의 속도로, 매일 조금씩.</Text>
      <Text style={styles.storageNote}>기록은 이 기기에 저장돼요 · 기기 간 동기화 없음</Text>
      <Button label="개인정보 안내" kind="plain" onPress={onPrivacy} />
    </View>
  );
}
