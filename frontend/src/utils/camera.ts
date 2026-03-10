import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera';

/**
 * 카메라로 사진 촬영
 * @returns 촬영된 사진의 base64 데이터 또는 webPath
 */
export async function takePhoto(): Promise<Photo> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Camera,
    quality: 90,
  });
  return photo;
}

/**
 * 갤러리에서 사진 선택
 * @returns 선택된 사진의 base64 데이터 또는 webPath
 */
export async function pickFromGallery(): Promise<Photo> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Uri,
    source: CameraSource.Photos,
    quality: 90,
  });
  return photo;
}

/**
 * 카메라로 사진 촬영 (Base64 반환)
 * @returns base64 인코딩된 이미지 문자열
 */
export async function takePhotoAsBase64(): Promise<string> {
  const photo = await Camera.getPhoto({
    resultType: CameraResultType.Base64,
    source: CameraSource.Camera,
    quality: 90,
  });
  return photo.base64String ?? '';
}

/**
 * 카메라 권한 확인
 */
export async function checkCameraPermissions() {
  const status = await Camera.checkPermissions();
  return status;
}

/**
 * 카메라 권한 요청
 */
export async function requestCameraPermissions() {
  const status = await Camera.requestPermissions();
  return status;
}
