import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { Header } from '../ui/Header';
import { ScreenWrapper } from '../ui/ScreenWrapper';
import CaptureAnswersScreen from './CameraScreen/CaptureAnswersScreen';
import { API_BASE } from '../../config/apiConfig';

// This screen now guides the user to capture p1, p2, p3 images
// and uploads each to the corresponding backend endpoints in main.py:
//  - POST /scan/p1 -> { score_p1 }
//  - POST /scan/p2 -> { score_p2 }
//  - POST /scan/p3 -> { score_p3 }
// The server expects multipart/form-data with the field name 'image'.

export default function CreateExamScreen() {
  const navigation = useNavigation<any>();

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0=p1, 1=p2, 2=p3, 3=done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreP1, setScoreP1] = useState<number | null>(null);
  const [scoreP2, setScoreP2] = useState<number | null>(null);
  const [scoreP3, setScoreP3] = useState<number | null>(null);

  const handleUpload = async (part: 'p1' | 'p2' | 'p3', photoUri: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: photoUri,
        name: `${part}.jpg`,
        type: 'image/jpeg',
      } as any);

      const endpoint = `/scan/${part}`; // matches Flask endpoints in main.py
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text}`.trim());
      }

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error('Phản hồi không phải JSON');
      }

      if (part === 'p1') {
        if (typeof data?.score_p1 !== 'number') throw new Error('Thiếu trường score_p1');
        setScoreP1(data.score_p1);
        setStep(1);
      } else if (part === 'p2') {
        if (typeof data?.score_p2 !== 'number') throw new Error('Thiếu trường score_p2');
        setScoreP2(data.score_p2);
        setStep(2);
      } else if (part === 'p3') {
        if (typeof data?.score_p3 !== 'number') throw new Error('Thiếu trường score_p3');
        setScoreP3(data.score_p3);
        setStep(3);
      }
    } catch (e: any) {
      setError(e?.message || 'Lỗi upload');
    } finally {
      setLoading(false);
    }
  };

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
        <Text onPress={() => setError(null)} className="text-blue-600 underline">Thử lại</Text>
      </View>
    );
  }

  if (step === 0) {
    // Capture p1
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p1', uri)} />;
  }
  if (step === 1) {
    // Capture p2
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p2', uri)} />;
  }
  if (step === 2) {
    // Capture p3
    return <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p3', uri)} />;
  }

  // Summary screen after all uploads complete
  return (
    <ScreenWrapper scroll keyboardAvoid centerContent>
      <Header title="Quét đề - Hoàn tất" />
      <View className="w-full max-w-md rounded-2xl bg-white p-5 shadow mt-6">
        <Text className="mb-2 text-lg font-semibold text-green-800">Kết quả quét</Text>
        <View className="mb-2">
          <Text className="text-base text-green-900">Điểm phần 1 (p1): <Text className="font-semibold">{scoreP1 ?? '-'}</Text></Text>
        </View>
        <View className="mb-2">
          <Text className="text-base text-green-900">Điểm phần 2 (p2): <Text className="font-semibold">{scoreP2 ?? '-'}</Text></Text>
        </View>
        <View className="mb-4">
          <Text className="text-base text-green-900">Điểm phần 3 (p3): <Text className="font-semibold">{scoreP3 ?? '-'}</Text></Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-lg bg-green-800 py-3"
        >
          <Text className="text-center text-base font-semibold text-white">Xong</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
