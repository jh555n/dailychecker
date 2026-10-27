# App Privacy / 심사 응답의 기술적 근거

최종 법적 응답은 소유자 확인 전입니다. 아래는 현재 저장소 및 설치된 의존성의 사실 근거이며, 서명된 최종 IPA와 공개 지원 웹사이트를 확인한 결과는 아닙니다.

| 항목             | 확인한 근거                                                                                                                 | 제출 전 처리                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 루틴·기록        | `src/useJournal.ts`가 AsyncStorage로 로컬 저장                                                                              | 앱에는 서버 전송 코드 없음. 최종 번들 재확인                                                 |
| 로그인·계정      | 로그인 UI, 백엔드, 인증 SDK 없음                                                                                            | 심사 데모 계정 불필요                                                                        |
| 광고·추적        | 광고/분석 SDK 의존성 및 앱 네트워크 호출 없음                                                                               | App Privacy의 ‘Data Not Collected’ 응답 후보. 소유자 확인 필요                               |
| 필수 사유 API    | AsyncStorage 2.2.0의 `ios/PrivacyInfo.xcprivacy`는 파일 타임스탬프 `C617.1` 선언                                            | 앱 manifest 및 최종 아카이브 합성 결과 확인                                                  |
| React Native API | RN 0.88 `React/Resources/PrivacyInfo.xcprivacy`는 파일 타임스탬프 `C617.1`, UserDefaults `CA92.1`, 수집 없음·추적 없음 선언 | 같은 항목을 Expo 앱 manifest에 반영. 실제 바이너리 검증은 빌드 후                            |
| iOS 권한         | 앱 코드에 카메라/위치/연락처/사진/HealthKit 사용 없음                                                                       | 생성한 Info.plist 및 최종 IPA 권한 확인                                                      |
| 암호화           | 앱 자체 암호화 구현 및 네트워크 프로토콜 없음. 공개 지원/정책 URL은 OS 브라우저의 HTTPS 사용                                | 비면제 암호화 사용 여부를 소유자가 확인하기 전 `ITSAppUsesNonExemptEncryption` 확정하지 않음 |
| 저장 위치        | 앱 로컬 저장. OS 백업에 포함될 가능성 있음                                                                                  | ‘어떤 클라우드에도 절대 전송되지 않는다’는 문구 사용 금지                                    |
| 외부 지원 사이트 | URL·운영자가 미정                                                                                                           | 웹 호스팅 로그, 문의 수집, 분석 여부를 정책에 반영                                           |
| 연령 등급        | 일반 루틴 기록 앱. 기본 루틴 이름에 금주·금연 텍스트 있음. 의료 조언, 사용자 간 콘텐츠 공유 없음                            | Apple 최신 설문의 각 질문과 콘텐츠를 대조해 소유자가 확인. 등급 임의 지정 금지               |
| 콘텐츠 권리      | 저장소에서 만든 코드·자체 d. 심볼, 시스템 폰트. 패키지는 각 라이선스 적용                                                   | 앱 이름·상표·배포 권리 및 저작권 표기를 소유자가 확인                                        |

검토할 공식 문서:

- https://docs.expo.dev/submit/ios/
- https://docs.expo.dev/guides/apple-privacy/
- https://developer.apple.com/help/app-store-connect/manage-app-information/overview-of-app-privacy-details/
- https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/

이 환경에서는 공식 문서 요청이 프록시 `403 Forbidden`으로 차단되었습니다. 허용 도메인 초안은 저장했지만 적용·문서 최신 내용 확인은 아직 완료되지 않았습니다. SDK 패키지에 포함된 manifest와 CLI 도움말은 로컬에서 직접 확인했습니다.
