import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import RNFS from 'react-native-fs';
import { COLORS } from '../constants/colors';
import APIService from '../../services/APIService';

type ScanPart = 'exam_code' | 'p1' | 'p2' | 'p3';

interface CapturedImage {
  uri: string;
  fileName: string;
}

interface ScanState {
  exam_code?: CapturedImage;
  p1?: CapturedImage;
  p2?: CapturedImage;
  p3?: CapturedImage;
}

interface ScanResults {
  exam_code?: string;
  p1?: any;
  p2?: any;
  p3?: any;
}

export default function MultiPartScanScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { examCode } = route.params as { examCode: string };

  const [currentPart, setCurrentPart] = useState<ScanPart>('exam_code');
  const [capturedImages, setCapturedImages] = useState<ScanState>({});
  const [scanResults, setScanResults] = useState<ScanResults>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = React.useRef<Camera>(null);

  React.useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const partLabels: Record<ScanPart, string> = {
    exam_code: 'Mã đề thi',
    p1: 'Phần 1',
    p2: 'Phần 2',
    p3: 'Phần 3',
  };

  const scanOrder: ScanPart[] = ['exam_code', 'p1', 'p2', 'p3'];

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      const fileName = `${currentPart}_${Date.now()}.jpg`;
      const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      await RNFS.copyFile(photo.path, destPath);

      setCapturedImages((prev) => ({
        ...prev,
        [currentPart]: { uri: `file://${destPath}`, fileName },
      }));

      setIsCameraActive(false);

      // Auto-process after capture
      await processPart(currentPart, { uri: `file://${destPath}`, fileName });
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const processPart = async (part: ScanPart, image: CapturedImage) => {
    setIsProcessing(true);
    try {
      // Prepare file object for API
      const file = {
        uri: image.uri,
        type: 'image/jpeg',
        name: image.fileName,
      };

      if (part === 'exam_code') {
        // Scan exam code
        const result = await APIService.scanExamCode(file);
        setScanResults((prev) => ({ ...prev, exam_code: result.exam_code }));
        Alert.alert('✅ Thành công', `Mã đề: ${result.exam_code}`);
      } else {
        // For answer parts, we'll collect all and send together at the end
        Alert.alert('✅ Đã chụp', `${partLabels[part]} đã được lưu`);
      }

      // Move to next part
      const currentIndex = scanOrder.indexOf(part);
      if (currentIndex < scanOrder.length - 1) {
        setCurrentPart(scanOrder[currentIndex + 1]);
      }
    } catch (error: any) {
      console.error(`Error processing ${part}:`, error);
      Alert.alert('Lỗi', error.message || 'Không thể xử lý ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = async () => {
    // Check if all parts are captured
    if (!capturedImages.exam_code || !capturedImages.p1 || !capturedImages.p2 || !capturedImages.p3) {
      Alert.alert('Chưa đầy đủ', 'Vui lòng chụp tất cả các phần');
      return;
    }

    // Navigate to review screen
    (navigation as any).navigate('ReviewScanScreen', {
      examCode,
      scannedExamCode: scanResults.exam_code,
      images: capturedImages,
    });
  };

  const handleRetake = (part: ScanPart) => {
    setCurrentPart(part);
    setIsCameraActive(true);
  };

  const renderPartCard = (part: ScanPart) => {
    const image = capturedImages[part];
    const isCurrentPart = currentPart === part;
    const isCompleted = !!image;

    return (
      <View
        key={part}
        className="mb-4 rounded-2xl p-4"
        style={{
          backgroundColor: isCurrentPart ? COLORS.blue : COLORS.lightGray,
          borderWidth: 2,
          borderColor: isCompleted ? COLORS.green : 'transparent',
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className="text-lg font-bold"
              style={{ color: isCurrentPart ? 'white' : COLORS.darkBlue }}
            >
              {partLabels[part]}
            </Text>
            {isCompleted && (
              <Text className="mt-1 text-xs" style={{ color: COLORS.green }}>
                ✓ Đã chụp
              </Text>
            )}
          </View>

          {image && (
            <Image
              source={{ uri: image.uri }}
              style={{ width: 60, height: 60, borderRadius: 8 }}
            />
          )}
        </View>

        {isCompleted && (
          <TouchableOpacity
            onPress={() => handleRetake(part)}
            className="mt-3 rounded-xl py-2"
            style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
          >
            <Text className="text-center font-semibold" style={{ color: 'white' }}>
              Chụp lại
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="mb-4 text-center text-lg">Cần quyền truy cập camera</Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="rounded-xl px-6 py-3"
          style={{ backgroundColor: COLORS.blue }}
        >
          <Text className="font-bold text-white">Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Không tìm thấy camera</Text>
      </View>
    );
  }

  if (isCameraActive) {
    return (
      <View className="flex-1 bg-black">
        <Camera
          ref={cameraRef}
          device={device}
          isActive={true}
          photo={true}
          style={{ flex: 1 }}
        />

        {/* Camera Controls */}
        <View className="absolute bottom-0 left-0 right-0 p-6">
          <View className="mb-4 rounded-2xl p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Text className="text-center text-lg font-bold text-white">
              Đang chụp: {partLabels[currentPart]}
            </Text>
          </View>

          <View className="flex-row items-center justify-around">
            <TouchableOpacity
              onPress={() => setIsCameraActive(false)}
              className="rounded-full px-6 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            >
              <Text className="font-bold text-white">Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              className="h-16 w-16 items-center justify-center rounded-full border-4 border-white"
              style={{ backgroundColor: COLORS.green }}
            >
              <View className="h-12 w-12 rounded-full bg-white" />
            </TouchableOpacity>

            <View style={{ width: 80 }} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6" style={{ backgroundColor: COLORS.darkBlue }}>
        <Text className="text-2xl font-bold text-white">Chấm điểm từng phần</Text>
        <Text className="mt-2 text-white/80">Đề: {examCode}</Text>
      </View>

      {/* Progress */}
      <View className="mx-6 mt-6 rounded-2xl p-4" style={{ backgroundColor: COLORS.lightGray }}>
        <Text className="mb-2 font-semibold" style={{ color: COLORS.darkBlue }}>
          Tiến độ: {Object.keys(capturedImages).length}/4
        </Text>
        <View className="h-2 overflow-hidden rounded-full bg-gray-300">
          <View
            className="h-full rounded-full"
            style={{
              width: `${(Object.keys(capturedImages).length / 4) * 100}%`,
              backgroundColor: COLORS.green,
            }}
          />
        </View>
      </View>

      {/* Part Cards */}
      <View className="p-6">
        {scanOrder.map((part) => renderPartCard(part))}
      </View>

      {/* Actions */}
      <View className="p-6">
        {!capturedImages[currentPart] && (
          <TouchableOpacity
            onPress={() => setIsCameraActive(true)}
            className="mb-3 rounded-xl py-4"
            style={{ backgroundColor: COLORS.blue }}
            disabled={isProcessing}
          >
            <Text className="text-center text-lg font-bold text-white">
              📷 Chụp {partLabels[currentPart]}
            </Text>
          </TouchableOpacity>
        )}

        {Object.keys(capturedImages).length === 4 && (
          <TouchableOpacity
            onPress={handleFinalize}
            className="mb-3 rounded-xl py-4"
            style={{ backgroundColor: COLORS.green }}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-center text-lg font-bold text-white">
                ➡️ Tiếp tục xem lại
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-xl py-4"
          style={{ backgroundColor: COLORS.lightGray }}
        >
          <Text className="text-center font-semibold" style={{ color: COLORS.darkBlue }}>
            Hủy
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
