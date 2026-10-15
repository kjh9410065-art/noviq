# NOVIQ for Apps in Toss

앱인토스 appName은 반드시 noviq 입니다. 기존 NOVIQ 웹사이트(public/)에는 변경을 가하지 않습니다.

설치: `npm install`, 테스트: `npm test`, 번들: `npm run build:ait`.

첫 출시 범위: 10개 생활 계산기. TDS Provider + Button 적용, 외부 광고 및 트래킹 코드 없음. 토스 앱 샌드박스 테스트와 심사, 콘솔 앱 아이콘 등록은 별도로 필요합니다.


## 토스 인앱 배너 광고

- 콘솔에서 NOVIQ 미니앱의 광고 그룹을 **배너** 유형으로 만들고 광고 그룹 ID를 발급받아요.
- GitHub 저장소의 Settings → Secrets and variables → Actions → Variables에서 `NOVIQ_TOSS_BANNER_AD_GROUP_ID` 변수를 생성해 발급된 ID를 입력해요.
- 새 커밋 또는 수동 Actions 빌드 후 산출된 `.ait` 번들을 테스트해야 실제 광고가 적용돼요.
- 그룹 ID가 없으면 광고 영역이 아예 렌더링되지 않으며 계산기는 정상 동작해요.
- 개발 테스트 시에는 공식 테스트용 ID인 `ait-ad-test-banner-id`를 사용하고, 이 값으로 만든 번들은 절대 운영 배포하지 마세요.
- 토스 공식 가이드에 따라 사업자 정보·정산 정보·광고 그룹 설정을 마친 뒤 운영 ID를 등록해요.
