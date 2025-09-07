
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CaptureExamCodeScreen from './CameraScreen/CaptureExamCodeScreen';
import CaptureAnswersScreen from './CameraScreen/CaptureAnswersScreen';
import { API_BASE } from '../../config/apiConfig';
import { COLORS } from '../constants/colors';
import ProgressIndicator from '../ui/ProgressIndicator';

// Define your stack param list
export type RootStackParamList = {
  AutoGradingFlowScreen: undefined;
  ResultsScreen: { result: any };
  CaptureExamCodeScreen: { onCaptured?: (uri: string) => void };
  CaptureAnswersScreen: { onCaptured?: (uri: string) => void };
  // ...add other screens as needed
};

interface ProgressData {
  exam_code?: string;
  student_id?: string;
  score_p1?: number;
  score_p2?: number;
  score_p3?: number;
}

const STEPS = [
  { key: 'id_code', label: 'SBD + Mã đề', icon: 'document-text' },
  { key: 'p1', label: 'Phần 1', icon: 'checkbox' },
  { key: 'p2', label: 'Phần 2', icon: 'checkbox' },
  { key: 'p3', label: 'Phần 3', icon: 'checkbox' },
];

export default function AutoGradingFlowScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [step, setStep] = useState(0); // 0: id+code, 1: p1, 2: p2, 3: p3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData>({});
  const [retryCount, setRetryCount] = useState(0);
  const [correctAnswersId, setCorrectAnswersId] = useState<string | null>(null);
  const [subPhase, setSubPhase] = useState<'exam_code' | 'student_id'>('exam_code');

  // Khởi tạo session BE
  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    let cancelled = false;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/exam/start`, { 
        method: 'POST', 
        headers: { Accept: 'application/json' } 
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} ${text}`.trim());
      }
      const data = await res.json();
      if (!cancelled) {
        setSessionId(String(data?.session_id || ''));
        setRetryCount(0);
      }
    } catch (e: any) {
      if (!cancelled) {
        setError(e?.message || 'Không khởi tạo được phiên chấm');
        setRetryCount(prev => prev + 1);
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      initializeSession();
    } else {
      Alert.alert(
        'Lỗi kết nối',
        'Đã thử kết nối 3 lần. Vui lòng kiểm tra mạng và thử lại.',
        [
          { text: 'Thử lại', onPress: () => { setRetryCount(0); initializeSession(); } },
          { text: 'Quay lại', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  // Upload handler cho từng API riêng lẻ theo session
  const handleUpload = async (type: 'exam_code' | 'student_id' | 'p1' | 'p2' | 'p3', photoUri: string) => {
    if (!sessionId) {
      setError('Session chưa sẵn sàng');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('image', {
        uri: photoUri,
        name: `${type}.jpg`,
        type: 'image/jpeg',
      } as any);
      
      // Map type -> BE session endpoints
      let endpoint = '';
      switch (type) {
        case 'exam_code':
          endpoint = '/exam/exam_code';
          break;
        case 'student_id':
          endpoint = '/exam/student_id';
          break;
        case 'p1':
          endpoint = '/exam/p1';
          break;
        case 'p2':
          endpoint = '/exam/p2';
          break;
        case 'p3':
          endpoint = '/exam/p3';
          break;
        default:
          endpoint = `/exam/${type}`;
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
        throw new Error(`HTTP ${res.status} - ${text}`);
      }
      
      const data = await res.json();

      // Xác thực phản hồi theo từng endpoint và chuyển bước
      if (type === 'exam_code') {
        if (!('exam_code' in data)) throw new Error(data?.error || 'Thiếu exam_code');
        const code = String(data.exam_code);
        setProgress((p) => ({ ...p, exam_code: code }));

        // Tìm correct answers theo exam_code
        try {
          const searchRes = await fetch(`${API_BASE}/correctans/search?exam_code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (!searchRes.ok) {
            const txt = await searchRes.text().catch(() => '');
            throw new Error(`Không tìm thấy đáp án đúng cho mã đề ${code}. ${txt}`.trim());
          }
          const searchData = await searchRes.json();
          if (!searchData?.correct_ans_id) throw new Error('Thiếu correct_ans_id');
          setCorrectAnswersId(String(searchData.correct_ans_id));
        } catch (e: any) {
          setError(e?.message || `Không tìm thấy đáp án đúng cho mã đề ${code}. Hãy tạo đáp án trước.`);
          return; // dừng flow để người dùng xử lý
        }

        // Sau mã đề, yêu cầu SBD trong cùng step 0
        setSubPhase('student_id');
      } else if (type === 'student_id') {
        if (!('student_id' in data)) throw new Error(data?.error || 'Thiếu student_id');
        setProgress((p) => ({ ...p, student_id: String(data.student_id) }));
        // Hoàn tất nhóm 1: sang p1
        setStep(1);
      } else if (type === 'p1') {
        if (!('score_p1' in data)) throw new Error(data?.error || 'Thiếu score_p1');
        setProgress((p) => ({ ...p, score_p1: Number(data.score_p1) }));
        // Hoàn tất p1: chuyển sang p2
        setStep(2);
      } else if (type === 'p2') {
        if (!('score_p2' in data)) throw new Error(data?.error || 'Thiếu score_p2');
        setProgress((p) => ({ ...p, score_p2: Number(data.score_p2) }));
        // Sau p2 chuyển sang p3
        setStep(3);
      } else if (type === 'p3') {
        if (!('score_p3' in data)) throw new Error(data?.error || 'Thiếu score_p3');
        setProgress((p) => ({ ...p, score_p3: Number(data.score_p3) }));
        
        // Finish
        setLoading(true);
        const finishForm = new FormData();
        finishForm.append('session_id', sessionId);
        if (correctAnswersId) finishForm.append('correct_ans_id', correctAnswersId);
        const finishRes = await fetch(`${API_BASE}/exam/finish`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: finishForm,
        });
        
        if (!finishRes.ok) {
          const t = await finishRes.text().catch(() => '');
          throw new Error(`Finish lỗi: HTTP ${finishRes.status} ${t}`.trim());
        }
        
        const finishData = await finishRes.json();
        navigation.navigate('ResultsScreen', { result: finishData });
      }
    } catch (e: any) {
      setError(`Lỗi mạng khi upload: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => {
    const stepsWithStatus = STEPS.map((stepInfo, index) => ({
      ...stepInfo,
      status: index < step ? 'completed' : index === step ? 'active' : 'pending'
    }));
    
    return <ProgressIndicator steps={stepsWithStatus} currentStep={step} />;
  };

  const renderProgressInfo = () => (
    <View className="px-4 py-2 bg-blue-50 border-l-4 border-blue-400 mx-4 mb-4">
      <Text className="text-sm font-medium text-blue-800 mb-1">Thông tin đã quét:</Text>
      {progress.exam_code && (
        <Text className="text-xs text-blue-700">Mã đề: {progress.exam_code}</Text>
      )}
      {progress.student_id && (
        <Text className="text-xs text-blue-700">SBD: {progress.student_id}</Text>
      )}
      {progress.score_p1 !== undefined && (
        <Text className="text-xs text-blue-700">Phần 1: {progress.score_p1} điểm</Text>
      )}
      {progress.score_p2 !== undefined && (
        <Text className="text-xs text-blue-700">Phần 2: {progress.score_p2} điểm</Text>
      )}
      {progress.score_p3 !== undefined && (
        <Text className="text-xs text-blue-700">Phần 3: {progress.score_p3} điểm</Text>
      )}
    </View>
  );

  // Render từng bước
  if (loading || !sessionId) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={COLORS.green} />
        <Text className="mt-4 text-lg text-gray-700">
          {sessionId ? 'Đang xử lý...' : 'Đang khởi tạo phiên chấm...'}
        </Text>
        {!sessionId && retryCount > 0 && (
          <Text className="mt-2 text-sm text-gray-500">
            Lần thử {retryCount}/3
          </Text>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-red-600 text-lg mb-4 text-center">{error}</Text>
        <TouchableOpacity 
          onPress={handleRetry}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CreateCorrectAnswersScreen' as any)}
          className="mt-3 px-6 py-2"
        >
          <Text className="text-green-700">Tạo đáp án đúng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-3 px-6 py-2"
        >
          <Text className="text-gray-600">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {renderProgressBar()}
      {Object.keys(progress).length > 0 && renderProgressInfo()}
      
      {/* Step 0: SBD + Mã đề */}
      {step === 0 && (
        subPhase === 'exam_code' ? (
          <CaptureExamCodeScreen onCaptured={(uri) => handleUpload('exam_code', uri)} />
        ) : (
          <CaptureAnswersScreen onCaptured={(uri) => handleUpload('student_id', uri)} />
        )
      )}

      {/* Step 1: Phần 1 */}
      {step === 1 && (
        <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p1', uri)} />
      )}

      {/* Step 2: Phần 2 */}
      {step === 2 && (
        <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p2', uri)} />
      )}

      {/* Step 3: Phần 3 */}
      {step === 3 && (
        <CaptureAnswersScreen onCaptured={(uri) => handleUpload('p3', uri)} />
      )}
    </View>
  );
}
