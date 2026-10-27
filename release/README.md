# Apple App Store 배포 준비

**진행 보류:** 사용자가 로컬 테스트를 먼저 하기로 했습니다. 계정 연결, 원격 빌드, 업로드와 제출을 재개하지 않습니다. 먼저 [로컬 테스트 안내](../LOCAL_TEST.md)로 동작을 확인하고, 이후 사용자가 배포 재개를 요청하면 아래 절차를 이어갑니다.

현재 단계는 **배포 자료 및 로컬 검증 완료를 위한 준비 단계**입니다. Apple/Expo 계정 접근, 서명된 IPA, TestFlight 업로드, App Review 제출, 실제 공개는 아직 완료하지 않았습니다. Android/Google Play 배포는 이 작업에 포함하지 않습니다.

## 현재 확인한 사실

- EAS CLI 26.0.0 실행 가능. `eas whoami` 결과는 `Not logged in`입니다.
- `EXPO_NO_TELEMETRY=1 eas project:info`는 Expo 계정이 필요하다는 오류를 반환했습니다. 계정이 존재하지 않는다는 뜻은 아닙니다.
- 환경 설정에 Apple/Expo secret·계정 연결이 없고, 관련 환경 변수와 로컬 Expo 로그인 상태·App Store Connect 개인키 디렉터리도 없었습니다. 플랫폼 identity manifest에는 연결 항목이 없었습니다. 비밀값은 읽거나 출력하지 않았습니다.
- 이 Linux 환경에 Xcode는 없습니다. EAS 원격 iOS 빌드 또는 macOS/Xcode 빌드가 필요합니다.
- 공식 Expo/Apple 문서의 HTTPS 요청은 환경 프록시의 `403 Forbidden`으로 거절됐습니다. 필요한 도메인을 환경 설정 **초안**에 추가했으며 런타임 적용은 아직 확인하지 않았습니다.

## 준비한 파일

| 파일                                    | 용도                                                          |
| --------------------------------------- | ------------------------------------------------------------- |
| `../assets/icon.png` / `icon.svg`       | 기존 d. 브랜드 기반 1024px 불투명 아이콘 및 원본              |
| `../app.json`, `../app.config.ts`       | iOS 버전·아이콘·privacy manifest·검증된 계정별 값 주입        |
| `../eas.json`                           | iOS 스토어/시뮬레이터 빌드 프로필과 제출 프로필               |
| `metadata.ko-KR.json`                   | 한국어 이름·부제·설명·키워드·심사 메모. 미확정 값은 null      |
| `privacy-policy.ko.md`, `support.ko.md` | 운영자 확인 및 웹 게시가 필요한 초안                          |
| `PRIVACY-EVIDENCE.md`                   | App Privacy·필수 사유 API·암호화·연령 등급 응답 근거          |
| `screenshots/`                          | 캡처 계획과 **웹 렌더링 시안**. 네이티브 제출용 캡처는 미완료 |
| `../scripts/check-release.mjs`          | 로컬 자료 검사 및 미완료 제출 조건 표시                       |

앱 하단의 ‘개인정보 안내’에서도 저장 위치·추적 여부·삭제·기기 백업 범위를 확인할 수 있습니다. 검증된 공개 URL이 설정된 빌드에서는 정책 및 지원 페이지 버튼이 표시됩니다.

## 소유자 및 계정 확인이 필요한 항목

1. 기존 Expo 계정/조직과 프로젝트, Apple Developer 팀, 기존 App Store Connect 앱이 있는지 확인합니다. 기존 앱이라면 Bundle ID·ASC App ID·최신 버전/빌드 번호와 EAS 프로젝트 소유자를 대조합니다. 새 앱이라면 소유자가 확정한 식별자를 등록합니다. **이 작업에서는 임의 Bundle ID를 등록하거나 기존 앱을 수정하지 않았습니다.**
2. 기존 Expo 로그인 또는 기존 토큰을 안전한 환경 설정으로 연결합니다. 비밀번호, `.p8`, 토큰을 채팅·저장소·로그에 넣지 않습니다. 새 토큰/API 키/인증서 생성 또는 지속 접근 설정은 별도 명시적 승인 후 진행합니다.
3. Apple Developer 유료 멤버십 상태, 필요한 계약, App Store Connect 권한, EAS 무료 빌드 잔여량을 확인합니다. 새 유료 가입·빌드 결제·약관 동의는 별도 승인 대상입니다.
4. 공개 앱 이름·판매자/저작권 표시·지원 URL·개인정보 URL·가격·배포 지역을 확정합니다. 웹사이트 게시 전에 공개할 연락처에 대한 소유자 승인이 필요합니다. 심사 연락처는 App Store Connect의 전용 필드에 안전하게 입력하고 저장소에 개인 정보를 커밋하지 않는 것이 좋습니다.
5. 실제 앱과 최종 IPA를 근거로 App Privacy, 연령 설문, 콘텐츠 권리, 수출 규정 응답을 확인합니다. ‘Data Not Collected’ 및 일반/면제 암호화 여부는 현재 코드에 따른 검토 후보이며 법적 응답을 대신 확정하지 않았습니다.

## 계정 확인 후의 정확한 진행 순서

### 공개 설정 주입

`.env.example`에 설명한 비밀이 아닌 값을 로컬 및 EAS production 환경에 동일하게 설정합니다. EAS projectId는 실제 프로젝트의 UUID이고, Bundle ID는 해당 Apple 팀에서 확인한 앱 식별자여야 합니다. `IOS_USES_NON_EXEMPT_ENCRYPTION`은 소유자가 확인한 `true` 또는 `false` 값입니다. true인 경우 추가 수출 문서 필요 여부도 확인합니다.

`metadata.ko-KR.json`의 앱 식별 정보와 공개 메타데이터를 일치시키고, `eas.json`의 `submit.production.ios.ascAppId`에 **정확한 기존/신규 App Store Connect 숫자 ID**를 설정합니다. 임의 ID나 다른 앱의 ID를 넣지 않습니다. 심사 연락처는 제출 시스템에 입력합니다.

```bash
cd /workspace/dailychecker
EXPO_NO_TELEMETRY=1 npx --yes eas-cli@26.0.0 whoami
EXPO_NO_TELEMETRY=1 npx --yes eas-cli@26.0.0 project:info
npm run release:assets
npm run release:check
```

`release:assets`는 로컬 아이콘/메타데이터 구조만 검사합니다. `release:check`는 누락된 정보가 있으면 실패하도록 되어 있습니다. 두 명령 모두 Apple 계정 접근, 실제 URL 응답, 서명 또는 제출 성공을 보증하지 않습니다.

### 서명과 빌드

EAS에 이미 등록된 이 앱 전용 인증서·프로비저닝 프로필이 유효하고 Bundle ID/팀과 일치하는지 확인합니다. 다른 앱의 인증서를 취소하거나 교체하지 않습니다. 새 서명 자료가 필요하면 생성 전에 승인을 요청합니다. 원격 빌드 무료 사용량/비용도 먼저 확인합니다.

```bash
EAS_NO_VCS=1 EXPO_NO_TELEMETRY=1 npx --yes eas-cli@26.0.0 build \
  --platform ios --profile production --non-interactive --freeze-credentials
```

`--freeze-credentials`는 비대화형 빌드에서 자격증명 변경을 막습니다. 자격증명이 없으면 이를 제거해서 자동 생성을 시도하지 말고 필요한 승인을 받습니다. 빌드 완료 후 IPA의 앱 ID, 팀, 버전/빌드 번호, 아이콘, privacy manifest, 권한, 지원/개인정보 링크와 지원 기기의 실제 동작을 검증합니다. 최신 Apple SDK/Xcode 요구사항은 네트워크와 계정 접근 복구 후 공식 문서 및 EAS 빌드 로그에서 확인합니다.

현재 저장소는 첫 커밋이 없는 상태이므로 위 명령은 EAS가 자동으로 Git 커밋을 요구하지 않도록 `EAS_NO_VCS=1`을 사용합니다. 작업 파일을 업로드하며 `.easignore`에서 자격증명 파일·로컬 환경 파일·캐시·심사 자료를 제외합니다. 공개 설정은 EAS 환경에 별도로 주입합니다. 정상적인 로컬 커밋이 준비된 뒤에는 기본 VCS 방식으로 바꿀 수 있으며, 원격 push가 필수인 것은 아닙니다.

### TestFlight 업로드와 심사 제출

검증한 **해당 iOS 빌드 ID**를 지정해 업로드합니다. `--latest`로 다른 빌드를 잘못 선택하지 않습니다.

```bash
EXPO_NO_TELEMETRY=1 npx --yes eas-cli@26.0.0 submit \
  --platform ios --profile production --id "$VERIFIED_IOS_BUILD_ID" --non-interactive
```

이 명령은 업로드 경로이며 App Review 제출·심사 통과·공개와 동일하지 않습니다. 인증 API 키가 없으면 새로 만들지 말고 기존 키 사용 여부 또는 발급 승인을 확인합니다.

App Store Connect 처리 완료 → 실제 기기/TestFlight 확인 → 네이티브 스크린샷 등록 → 메타데이터·정책 URL·연락처·가격·지역·법적 응답 완성 → 해당 빌드 선택 → App Review 제출 → Apple 심사 결과 확인 → 확정한 공개 방식으로 출시 순서로 진행합니다. 출시 상태가 실제 공개를 나타내기 전에는 ‘출시 완료’로 보고하지 않습니다.

## 로컬 검증 범위

앱의 실제 식별자 등록 없이, `/tmp`의 별도 복사본에서 `com.example.dailychecker.releasecheck`라는 **검사 전용 가상 ID**로 `expo prebuild --platform ios --no-install`을 실행했습니다. Xcode 프로젝트, 버전 1.0.0/빌드 1, 한국어 개발 언어, 아이콘, 필수 사유 manifest 생성이 확인됐고 사진/위치/연락처/건강 데이터 권한은 생성되지 않았습니다. 가상 ID는 앱 설정에 저장하거나 Apple에 등록하지 않았습니다.

이 검사는 CocoaPods 설치, Xcode 컴파일, 코드 서명, IPA 생성, Apple 서버 검증이나 실제 기기 테스트가 아닙니다. 소유자 설정이 확정되면 실제 식별자로 다시 생성·빌드해야 합니다.
