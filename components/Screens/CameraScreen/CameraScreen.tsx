import { useEffect, useState, useRef } from 'react';
import { View, Alert, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Ionicons } from '@expo/vector-icons';
import { UPLOAD_URL } from '../../../config/api';

import { Header } from '../../ui/Header';

export default function CameraScreen() {
  const navigation = useNavigation<any>();
  const devices = useCameraDevices();
  const device = Array.isArray(devices) ? devices.find((d) => d.position === 'back') : (devices as any)?.back || undefined;
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState<'authorized' | 'denied' | 'not-determined'>(
    'not-determined'
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false); // delay mount to avoid early native event
  const isFocused = useIsFocused();
  const screenHeight = Dimensions.get('screen').height;
  // Kết quả xử lý sẽ hiển thị ở màn hình Kết quả

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const status = await Camera.requestCameraPermission();
        if (cancelled) return;
        let permissionStatus: 'authorized' | 'denied' | 'not-determined';
        if (status === 'granted') permissionStatus = 'authorized';
        else if (status === 'denied') permissionStatus = 'denied';
        else permissionStatus = 'not-determined';
        setPermission(permissionStatus);
        // Give the React bridge a short time slice before subscribing to native events (workaround for early event crash)
        if (permissionStatus === 'authorized') {
          setTimeout(() => { if (!cancelled) setCameraReady(true); }, 80);
        }
      } catch (e) {
        console.warn('Camera permission request failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hàm chụp ảnh
  const cameraRef = useRef<any>(null);
  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera chưa sẵn sàng');
      return;
    }
    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        photo: true,
      });
      // Tạo tên file duy nhất theo timestamp
      const fileName = `answer_sheet_${Date.now()}.jpg`;
      const newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(photo.path, newPath);
      await new Promise((res) => setTimeout(res, 200));
      const exists = await RNFS.exists(newPath);
      console.log('Ảnh vừa chụp path:', newPath, 'Tồn tại:', exists);
      if (!exists) {
        Alert.alert('Ảnh không tồn tại trong bộ nhớ!');
        return;
      }
      const photoUri = 'file://' + newPath;
      setPhotoUri(photoUri);
      console.log('Set photoUri:', photoUri);
  // Điều hướng sang màn hình xem trước để người dùng xác nhận
  navigation.navigate('PreviewScreen', { photoUri });
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể upload hoặc xử lý ảnh trên server');
      console.error('Lỗi upload:', e, JSON.stringify(e));
    }
  };

  // Upload moved to ResultsScreen

  // Hàm test upload ảnh nhỏ lên server theo API Flask /api/process
  const uploadTextFileToServer = async () => {
    try {
      // Dùng ảnh vừa chụp nếu có; nếu chưa, tạo ảnh placeholder trống (PNG 1x1 từ base64)
      const testFilePath = photoUri ? photoUri.replace('file://', '') : RNFS.DocumentDirectoryPath + '/placeholder.png';
      if (!photoUri) {
        // 1x1 transparent PNG
        const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAOb+2KAAAAAASUVORK5CYII=';
        await RNFS.writeFile(testFilePath, transparentPngBase64, 'base64');
      }
      const exists = await RNFS.exists(testFilePath);
      if (!exists) {
        Alert.alert('Không có ảnh để upload!');
        return;
      }
      const formData = new FormData();
      // Gửi theo key 'p1' để khớp với Flask API
      formData.append('p1', {
        uri: 'file://' + testFilePath,
        name: testFilePath.endsWith('.png') ? 'p1.png' : 'p1.jpg',
        type: testFilePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
      } as any);
  console.log('Uploading test file to:', UPLOAD_URL);
      console.log('Test file path:', testFilePath);
  const response = await fetch(UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      console.log('Test file upload response status:', response.status);
      const ct = response.headers.get('content-type') || '';
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = ct.includes('application/json') ? await response.json() : await response.text();
      Alert.alert('Test upload thành công', typeof data === 'string' ? data.slice(0, 200) : JSON.stringify(data));
    } catch (e) {
      Alert.alert('Lỗi test upload', 'Không thể upload file test');
      console.error('Lỗi test upload:', e, JSON.stringify(e));
    }
  };

  // Black boxes will be shown on ResultsScreen

  return (
  <SafeAreaView className="flex-1 bg-black" style={{ minHeight: screenHeight }}>
      <Header title="Chấm bài" />
      {permission === 'authorized' && cameraReady && isFocused && device ? (
        <Camera
          ref={cameraRef}
          style={{ flex: 1 }}
          device={device}
          isActive={isFocused}
          photo
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {permission === 'denied' ? (
            <Text style={{ color: 'white', paddingHorizontal: 16, textAlign: 'center' }}>Quyền camera bị từ chối. Vào cài đặt để cấp quyền.</Text>
          ) : (
            <Text style={{ color: 'white' }}>Đang khởi tạo camera...</Text>
          )}
        </View>
      )}
      {/* Nút chụp ảnh hình tròn */}
      <View style={{ alignItems: 'center', marginVertical: 16, paddingBottom: Math.max(insets.bottom, 8) }}>
        <TouchableOpacity
          onPress={takePicture}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#88c273',
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        >
          <Ionicons name="camera" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      {photoUri && (
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
          <Text style={{ color: 'white', marginBottom: 8 }}>Ảnh vừa chụp:</Text>
          <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <Image
              source={{ uri: photoUri }}
              style={{ width: 240, height: 320, resizeMode: 'contain', backgroundColor: '#222' }}
            />
          </View>
        </View>
      )}
  {/* Kết quả sẽ hiển thị ở màn hình Kết quả */}
      {/* Nút test upload file text nhỏ */}
      <View style={{ alignItems: 'center', marginVertical: 8, paddingBottom: Math.max(insets.bottom, 4) }}>
        <TouchableOpacity
          onPress={uploadTextFileToServer}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#88c273',
            borderRadius: 24,
            paddingVertical: 10,
            paddingHorizontal: 20,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 1,
          }}
        >
          <Ionicons name="document-text-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Test upload file text nhỏ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
