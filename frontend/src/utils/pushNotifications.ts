import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { userApi } from '../api';

/**
 * 푸시 알림 초기화 및 리스너 등록
 * 네이티브 환경(Android/iOS)에서만 동작
 */
export async function initPushNotifications() {
  if (!Capacitor.isNativePlatform()) {
    console.log('푸시 알림은 네이티브 환경에서만 지원됩니다.');
    return;
  }

  // 권한 요청
  const permStatus = await PushNotifications.requestPermissions();
  if (permStatus.receive !== 'granted') {
    console.warn('푸시 알림 권한이 거부되었습니다.');
    return;
  }

  // 푸시 알림 등록
  await PushNotifications.register();

  // FCM 토큰 수신 → 서버에 전송
  PushNotifications.addListener('registration', async (token) => {
    console.log('FCM 토큰:', token.value);
    try {
      await userApi.registerFcmToken(token.value);
      console.log('FCM 토큰 서버 등록 완료');
    } catch (error) {
      console.error('FCM 토큰 서버 등록 실패:', error);
    }
  });

  // 토큰 등록 실패
  PushNotifications.addListener('registrationError', (error) => {
    console.error('푸시 알림 등록 실패:', error);
  });

  // 앱이 포그라운드일 때 알림 수신
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('푸시 알림 수신:', notification);
  });

  // 사용자가 알림을 탭했을 때
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('푸시 알림 탭:', action);
    const data = action.notification.data;
    if (data?.route) {
      window.location.href = data.route;
    }
  });
}

/**
 * 푸시 알림 리스너 해제
 */
export async function removePushListeners() {
  await PushNotifications.removeAllListeners();
}
