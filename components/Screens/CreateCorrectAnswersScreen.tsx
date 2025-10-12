import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../ui/Header';
import { ScreenWrapper } from '../ui/ScreenWrapper';
import CaptureExamCodeScreen from './CameraScreen/CaptureExamCodeScreen';
import CaptureAnswersScreen from './CameraScreen/CaptureAnswersScreen';
import { API_BASE } from '../../config/apiConfig';
import { COLORS } from '../constants/colors';

export default function CreateCorrectAnswersScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [examCode, setExamCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [p1ImageUri, setP1ImageUri] = useState<string | null>(null);
  const [p2ImageUri, setP2ImageUri] = useState<string | null>(null);
  const [p3ImageUri, setP3ImageUri] = useState<string | null>(null);
  const [manualAnswers, setManualAnswers] = useState<string>(''); // e.g. "1:A\n2:B\n3:C"

  const handleExamCodeCaptured = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri, name: 'exam_code.jpg', type: 'image/jpeg' } as any);
      const res = await fetch(`${API_BASE}/scan/exam_code`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const code = String(data?.exam_code || '');
      if (!code) throw new Error('Không nhận được mã đề');
      setExamCode(code);
      setStep(1);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể quét mã đề');
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = (part: 'p1' | 'p2' | 'p3') => async (uri: string) => {
    if (part === 'p1') setP1ImageUri(uri);
    if (part === 'p2') setP2ImageUri(uri);
    if (part === 'p3') setP3ImageUri(uri);
    setStep(part === 'p1' ? 2 : part === 'p2' ? 3 : 4);
  };

  const parseManualAnswers = (text: string): Array<[number, string]> => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const out: Array<[number, string]> = [];
    for (const line of lines) {
      const m = line.match(/^(\d+)\s*[:\-]\s*([A-D])$/i);
      if (m) out.push([parseInt(m[1], 10), m[2].toUpperCase()]);
    }
    return out;
  };

  // Note: Backend API does not support manual entry, only image scanning
  // This function is kept for future enhancement
  const saveManual = async () => {
    Alert.alert('Chức năng chưa hỗ trợ', 'Backend hiện tại chỉ hỗ trợ tạo đáp án bằng cách quét ảnh. Vui lòng sử dụng camera để quét.');
    return;
    
    /* Original implementation - requires backend support
    if (!examCode) return Alert.alert('Thiếu mã đề');
    const parsed = parseManualAnswers(manualAnswers);
    if (!parsed.length) return Alert.alert('Chưa có đáp án hợp lệ');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/correctans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ exam_code: examCode, answers: parsed }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      Alert.alert('Thành công', `Đã lưu đáp án đúng cho mã đề ${data.exam_code}`, {
        text: 'OK',
        onPress: () => navigation.goBack(),
      } as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể lưu đáp án');
    } finally {
      setLoading(false);
    }
    */
  };

  const saveByScanning = async () => {
    if (!examCode || !p1ImageUri || !p2ImageUri || !p3ImageUri) {
      Alert.alert('Thiếu dữ liệu', 'Cần mã đề và đủ 3 ảnh');
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append('exam_code', examCode);
      form.append('p1_img', { uri: p1ImageUri, name: 'p1.jpg', type: 'image/jpeg' } as any);
      form.append('p2_img', { uri: p2ImageUri, name: 'p2.jpg', type: 'image/jpeg' } as any);
      form.append('p3_img', { uri: p3ImageUri, name: 'p3.jpg', type: 'image/jpeg' } as any);
      const res = await fetch(`${API_BASE}/correctans`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      Alert.alert('Thành công', `Đã lưu đáp án đúng cho mã đề ${examCode}`, {
        text: 'OK',
        onPress: () => navigation.goBack(),
      } as any);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message || 'Không thể tạo đáp án');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text className="mt-4 text-lg text-gray-700">Đang xử lý...</Text>
      </View>
    );
  }

  return (
    <ScreenWrapper>
      <Header title="Tạo đáp án đúng" />

      <ScrollView className="flex-1 px-4 py-6">
        {/* Step indicator */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Tiến độ: {step}/4</Text>
          <View className="flex-row space-x-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} className={`flex-1 h-2 rounded ${i <= step ? 'bg-green-500' : 'bg-gray-200'}`} />
            ))}
          </View>
        </View>

        {/* Step 0: scan exam code or enter manually */}
        {step === 0 && (
          <View>
            <Text className="text-base font-semibold mb-2">Mã đề</Text>
            <TextInput
              value={examCode}
              onChangeText={setExamCode}
              placeholder="Nhập mã đề (4 chữ số) hoặc quét"
              keyboardType="number-pad"
              className="mb-4 rounded-lg border border-gray-300 px-3 py-2 text-black"
              maxLength={4}
            />
            <CaptureExamCodeScreen onCaptured={handleExamCodeCaptured} />
            {!!examCode && (
              <TouchableOpacity onPress={() => setStep(1)} className="mt-4 rounded-lg bg-green-600 py-3">
                <Text className="text-center font-semibold text-white">Tiếp tục</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Step 1: capture p1 */}
        {step === 1 && (
          <View>
            <Text className="text-base font-semibold mb-2">Quét đáp án phần 1</Text>
            <Text className="text-sm text-gray-600 mb-4">Mã đề: {examCode}</Text>
            <CaptureAnswersScreen onCaptured={handleCapture('p1')} />
          </View>
        )}

        {/* Step 2: capture p2 */}
        {step === 2 && (
          <View>
            <Text className="text-base font-semibold mb-2">Quét đáp án phần 2</Text>
            <Text className="text-sm text-gray-600 mb-4">Mã đề: {examCode}</Text>
            <CaptureAnswersScreen onCaptured={handleCapture('p2')} />
          </View>
        )}

        {/* Step 3: capture p3 */}
        {step === 3 && (
          <View>
            <Text className="text-base font-semibold mb-2">Quét đáp án phần 3</Text>
            <Text className="text-sm text-gray-600 mb-4">Mã đề: {examCode}</Text>
            <CaptureAnswersScreen onCaptured={handleCapture('p3')} />
          </View>
        )}

        {/* Step 4: summary and save */}
        {step === 4 && (
          <View>
            <Text className="text-base font-semibold mb-3">Lưu đáp án đúng</Text>
            <View className="mb-4 rounded-lg bg-gray-50 p-4">
              <Text className="text-sm text-gray-700 mb-1">Mã đề: {examCode}</Text>
              <Text className="text-xs text-gray-500">Ảnh đã chụp: {Number(!!p1ImageUri) + Number(!!p2ImageUri) + Number(!!p3ImageUri)}/3</Text>
            </View>

            <TouchableOpacity onPress={saveByScanning} className="rounded-lg bg-green-600 py-3 mb-4">
              <Text className="text-center font-semibold text-white">Lưu từ ảnh đã quét</Text>
            </TouchableOpacity>

            <Text className="text-base font-semibold mb-2">Hoặc nhập tay (mỗi dòng "số_câu:Đáp_án")</Text>
            <TextInput
              value={manualAnswers}
              onChangeText={setManualAnswers}
              placeholder={'1:A\n2:C\n3:B'}
              className="h-40 rounded-lg border border-gray-300 px-3 py-2 text-black"
              multiline
            />
            <TouchableOpacity onPress={saveManual} className="mt-3 rounded-lg bg-blue-600 py-3">
              <Text className="text-center font-semibold text-white">Lưu nhập tay</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}


