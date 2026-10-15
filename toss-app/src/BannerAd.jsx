import React from 'react';
import { TossAds } from '@apps-in-toss/web-framework';

// 광고 그룹 ID는 콘솔에서 발급받아 빌드 시 환경 변수로 주입합니다.
// 값이 비어 있으면 광고 SDK도 실행하지 않고 기존 계산 기능만 보여줍니다.
const adGroupId = (import.meta.env.VITE_TOSS_BANNER_AD_GROUP_ID || '').trim();

export default function BannerAd() {
  const targetRef = React.useRef(null);
  const [unavailable, setUnavailable] = React.useState(false);

  React.useEffect(() => {
    if (!adGroupId) return;
    if (!TossAds.initialize.isSupported() || !TossAds.attachBanner.isSupported()) {
      setUnavailable(true);
      return;
    }

    let cancelled = false;
    let instance = null;
    try {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => {
            if (cancelled || !targetRef.current) return;
            try {
              instance = TossAds.attachBanner(adGroupId, targetRef.current, {
                theme: 'auto',
                tone: 'blackAndWhite',
                variant: 'expanded',
                callbacks: {
                  onNoFill: () => { if (!cancelled) setUnavailable(true); },
                  onAdFailedToRender: (error) => {
                    console.warn('NOVIQ 광고 렌더링 실패:', error);
                    if (!cancelled) setUnavailable(true);
                  },
                },
              });
            } catch (error) {
              console.warn('NOVIQ 광고 부착 실패:', error);
              if (!cancelled) setUnavailable(true);
            }
          },
          onInitializationFailed: (error) => {
            console.warn('NOVIQ 광고 초기화 실패:', error);
            if (!cancelled) setUnavailable(true);
          },
        },
      });
    } catch (error) {
      console.warn('NOVIQ 광고 SDK 실행 실패:', error);
      setUnavailable(true);
    }

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, []);

  if (!adGroupId || unavailable) return null;
  return <aside className="noviq-ad-area" aria-label="광고"><div ref={targetRef} className="noviq-ad-slot" /></aside>;
}
