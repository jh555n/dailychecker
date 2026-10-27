import { useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { ui } from '../theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

export function PrivacySheet({ onClose }: { onClose: () => void }) {
  const [error, setError] = useState('');
  const privacyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;
  const supportUrl = process.env.EXPO_PUBLIC_SUPPORT_URL;
  async function open(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      setError('페이지를 열지 못했어요. 네트워크 상태를 확인하고 다시 시도해 주세요.');
    }
  }
  return (
    <Sheet title="개인정보 안내" subtitle="나의 루틴과 기록은 어떻게 저장되나요?" onClose={onClose}>
      {[
        [
          '이 기기에 저장해요',
          '루틴 이름, 색상, 심볼, 날짜별 YES/NO 기록을 앱의 로컬 저장소에 보관해요. 로그인이나 개발자 서버로의 기록 전송은 없어요.',
        ],
        [
          '광고·추적 기능이 없어요',
          '광고, 광고 식별자, 사용자 분석 SDK를 사용하지 않아요. 연락처, 위치, 사진, 건강 데이터 접근 권한도 요청하지 않아요.',
        ],
        [
          '기록을 직접 삭제할 수 있어요',
          '기록창에서 선택을 해제하고 저장하면 해당 기록을 지울 수 있어요. 루틴 관리에서 루틴을 삭제하면 그 루틴의 모든 기록도 삭제돼요.',
        ],
        [
          '백업 범위를 확인해 주세요',
          '기기 간 동기화와 앱 자체 백업은 제공하지 않아요. 운영체제의 기기 백업은 사용자 설정과 해당 서비스 정책에 따라 앱 데이터를 포함할 수 있어요. 앱 삭제나 기기 데이터 초기화 시 기록이 사라질 수 있어요.',
        ],
      ].map(([title, body]) => (
        <View key={title} style={{ gap: 8 }}>
          <Text accessibilityRole="header" style={[ui.text, { fontWeight: '700' }]}>
            {title}
          </Text>
          <Text style={ui.muted}>{body}</Text>
        </View>
      ))}
      {privacyUrl && (
        <Button label="개인정보 처리방침 보기" kind="soft" onPress={() => void open(privacyUrl)} />
      )}
      {supportUrl && (
        <Button label="지원 페이지 열기" kind="plain" onPress={() => void open(supportUrl)} />
      )}
      {error ? (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      ) : null}
    </Sheet>
  );
}
