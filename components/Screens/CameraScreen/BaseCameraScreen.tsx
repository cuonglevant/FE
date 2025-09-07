import { useEffect, useState, useRef, ReactNode } from 'react';
import { View, Alert, Text, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, useCameraDevices, useCameraDevice } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../ui/Header';

interface BaseCameraScreenProps {
  title: string;                 // Header title
  filePrefix: string;            // Prefix for saved file names
  onCapturedNavigate?: string;   // (legacy) Screen to navigate after capture
  extraButtons?: ReactNode;      // Optional extra buttons below capture
  onCaptured?: (uri: string) => void;
}

export function BaseCameraScreen({ title, filePrefix, onCapturedNavigate = 'PreviewScreen', extraButtons, onCaptured }: BaseCameraScreenProps) {
  const navigation = useNavigation<any>();
  const devices = useCameraDevices();
  const device = useCameraDevice('back');
  const insets = useSafeAreaInsets();
  const [permission, setPermission] = useState<'authorized' | 'denied' | 'not-determined'>('not-determined');
  const [cameraReady, setCameraReady] = useState(false);
  const isFocused = useIsFocused();
  const screenHeight = Dimensions.get('screen').height;

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
        if (permissionStatus === 'authorized') {
          setTimeout(() => { if (!cancelled) setCameraReady(true); }, 80);
        }
      } catch (e) {
        console.warn('Camera permission request failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const cameraRef = useRef<any>(null);
  const takePicture = async () => {
    if (!cameraRef.current) {
      Alert.alert('Camera chưa sẵn sàng');
      return;
    }
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off', photo: true });
      const fileName = `${filePrefix}_${Date.now()}.jpg`;
      const newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(photo.path, newPath);
      await new Promise((res) => setTimeout(res, 150));
      const exists = await RNFS.exists(newPath);
      if (!exists) {
        Alert.alert('Ảnh không tồn tại trong bộ nhớ!');
        return;
      }
      const newUri = 'file://' + newPath;
      if (onCaptured) {
        onCaptured(newUri);
      } else {
        navigation.navigate(onCapturedNavigate, { photoUri: newUri, kind: filePrefix });
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
      console.error('Capture error:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black" style={{ minHeight: screenHeight }}>
      <Header title={title} />
      {permission === 'authorized' && cameraReady && isFocused && device ? (
        <Camera ref={cameraRef} style={{ flex: 1 }} device={device} isActive={isFocused} photo />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {permission === 'denied' ? (
            <Text style={{ color: 'white', paddingHorizontal: 16, textAlign: 'center' }}>Quyền camera bị từ chối. Vào cài đặt để cấp quyền.</Text>
          ) : (
            <Text style={{ color: 'white' }}>Đang khởi tạo camera...</Text>
          )}
        </View>
      )}
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
      {extraButtons}
    </SafeAreaView>
  );
}
