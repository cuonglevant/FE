
import React, { useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import CaptureExamCodeScreen from './CameraScreen/CaptureExamCodeScreen';
import CaptureAnswersScreen from './CameraScreen/CaptureAnswersScreen';
import { API_CONFIG } from '../../config/apiConfig';
const API_BASE = API_CONFIG.API_BASE;

// Define your stack param list
export type RootStackParamList = {
  AutoGradingFlowScreen: undefined;
  ResultsScreen: { graded: any };
  CaptureExamCodeScreen: { onCaptured?: (uri: string) => void };
  CaptureAnswersScreen: { onCaptured?: (uri: string) => void };
  // ...add other screens as needed
};

export default function AutoGradingFlowScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(0); // 0: exam_code, 1: student_id, 2: p1, 3: p2, 4: p3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Không cần tạo session nữa

  // Upload handler cho từng API riêng lẻ
  const handleUpload = async (type: 'exam_code' | 'student_id' | 'p1' | 'p2' | 'p3', photoUri: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        name: `${type}.jpg`,
        type: 'image/jpeg',
      } as any);
      // Map type to new API endpoint
          let endpoint = '';
          switch (type) {
            case 'exam_code':
              endpoint = '/api/grading/upload/exam-code';
              break;
            case 'student_id':
              endpoint = '/api/grading/upload/student-id';
              break;
            case 'p1':
              endpoint = '/api/grading/upload/p1';
              break;
            case 'p2':
              endpoint = '/api/grading/upload/p2';
              break;
            case 'p3':
              endpoint = '/api/grading/upload/p3';
              break;
            default:
              endpoint = `/api/grading/upload/${type}`;
          }
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        setError(`Lỗi mạng: ${res.status} - ${text}`);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError('Không thể parse JSON từ server');
        return;
      }
      if (!data.success) {
        setError(data.error || 'Lỗi upload');
        return;
      }
      // Nếu đã grading xong, chuyển sang màn hình kết quả
      if (data.result) {
        navigation.navigate('ResultsScreen', { graded: data.result });
        return;
      }
      // Chuyển bước tiếp theo
      setStep((prev) => prev + 1);
    } catch (e: any) {
      setError(`Lỗi mạng khi upload: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  // Render từng bước
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#88c273" />
        <Text className="mt-4 text-lg">Đang xử lý...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600 text-lg mb-4">{error}</Text>
        <Text onPress={() => { setError(null); setStep(0); }} className="text-blue-600 underline">Thử lại</Text>
      </View>
    );
  }
  if (step === 0) {
    return <CaptureExamCodeScreen onCaptured={(uri) => handleUpload('exam_code', uri)} />;
  }
  if (step === 1) {
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('student_id', uri)} />;
  }
  if (step === 2) {
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p1', uri)} />;
  }
  if (step === 3) {
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p2', uri)} />;
  }
  if (step === 4) {
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p3', uri)} />;
  }
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg">Đã hoàn thành!</Text>
    </View>
  );
}
