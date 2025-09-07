import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '../ui/Header';
import { COLORS } from '../constants/colors';
import { UPLOAD_URL } from '../../config/apiConfig';

// Params accepted by this screen
type RootStackParamList = {
  ResultsScreen: { result?: any; photoUri?: string; autoUpload?: boolean } | undefined;
  Home: undefined;
  CameraScreen: undefined;
};

type BlackSquare = { rect: [number, number, number, number]; mean_gray?: number };
type GradingResult = {
  total?: number;
  filled?: number;
  total_black_squares?: number;
  black_squares?: BlackSquare[];
  [key: string]: unknown;
};

// New type for BE session results
type SessionResult = {
  student_id: string;
  exam_code: string;
  score_p1: number;
  score_p2: number;
  score_p3: number;
  total_score: number;
  scanned_ans?: Array<[number, string]>;
  correct_ans_id?: string;
};

export default function ResultsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ResultsScreen'>>();
  const navigation = useNavigation<any>();

  const [result, setResult] = useState<GradingResult | SessionResult | null>(route.params?.result ?? null);
  const photoUri = route.params?.photoUri;
  const autoUpload = route.params?.autoUpload;
  const [blackBoxes, setBlackBoxes] = useState<Array<{ rect: [number, number, number, number]; mean_gray?: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('screen').height;

  // Check if result is from BE session or legacy upload
  const isSessionResult = (result: any): result is SessionResult => {
    return result && 'student_id' in result && 'exam_code' in result && 'total_score' in result;
  };

  useEffect(() => {
    if (result && Array.isArray((result as GradingResult).black_squares)) {
      setBlackBoxes((result as GradingResult).black_squares || []);
    }
  }, [result]);

  const uploadForScoring = async () => {
    if (!photoUri) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      // Flask /scan/* expects the field name 'image'
      formData.append('image', {
        uri: photoUri,
        name: 'p1.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
      const ct = response.headers.get('content-type') || '';
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }
      const data = ct.includes('application/json') ? await response.json() : await response.text();
      if (typeof data === 'string') {
        throw new Error(`Unexpected non-JSON response from Flask: ${data.slice(0, 200)}`);
      }
      setResult(data);
      if (data.black_squares && Array.isArray(data.black_squares)) {
        setBlackBoxes(data.black_squares);
      }
      Alert.alert(
        'Kết quả',
        `Có ${data.filled} đáp án đã tô trên tổng ${data.total} ô.\nCó ${data.total_black_squares ?? (data.black_squares ? data.black_squares.length : 0)} ô vuông màu đen.`,
      );
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể upload hoặc xử lý ảnh trên server');
      console.error('Lỗi upload:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-upload when navigated from Preview with flag
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (autoUpload && photoUri && !result && !submitting && !cancelled) {
        await uploadForScoring();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [autoUpload, photoUri]);

  const renderSessionResult = (sessionResult: SessionResult) => (
    <View className="space-y-4">
      {/* Header Info */}
      <View className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
        <Text className="text-lg font-bold text-blue-800 mb-2">Thông tin bài thi</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Số báo danh:</Text>
            <Text className="font-semibold text-blue-800">{sessionResult.student_id}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-blue-700">Mã đề:</Text>
            <Text className="font-semibold text-blue-800">{sessionResult.exam_code}</Text>
          </View>
        </View>
      </View>

      {/* Scores */}
      <View className="bg-green-50 rounded-xl p-4 border-l-4 border-green-400">
        <Text className="text-lg font-bold text-green-800 mb-3">Điểm số</Text>
        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="checkbox" size={20} color={COLORS.green} />
              <Text className="ml-2 text-green-700">Phần 1</Text>
            </View>
            <Text className="text-2xl font-bold text-green-800">{sessionResult.score_p1}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="checkbox" size={20} color={COLORS.green} />
              <Text className="ml-2 text-green-700">Phần 2</Text>
            </View>
            <Text className="text-2xl font-bold text-green-800">{sessionResult.score_p2}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Ionicons name="checkbox" size={20} color={COLORS.green} />
              <Text className="ml-2 text-green-700">Phần 3</Text>
            </View>
            <Text className="text-2xl font-bold text-green-800">{sessionResult.score_p3}</Text>
          </View>
          <View className="border-t border-green-200 pt-3 mt-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold text-green-800">Tổng điểm</Text>
              <Text className="text-3xl font-bold text-green-800">{sessionResult.total_score}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scanned Answers */}
      {sessionResult.scanned_ans && sessionResult.scanned_ans.length > 0 && (
        <View className="bg-purple-50 rounded-xl p-4 border-l-4 border-purple-400">
          <Text className="text-lg font-bold text-purple-800 mb-3">Đáp án đã quét</Text>
          <Text className="text-purple-700 text-sm mb-2">
            Tổng cộng: {sessionResult.scanned_ans.length} câu
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
              {sessionResult.scanned_ans.map(([question, answer], index) => (
                <View key={index} className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-purple-200">
                  <Text className="text-xs text-purple-600">Câu {question}</Text>
                  <Text className="text-sm font-semibold text-purple-800">{answer}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Correct Answers ID */}
      {sessionResult.correct_ans_id && (
        <View className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400">
          <Text className="text-lg font-bold text-orange-800 mb-2">Tham chiếu đáp án</Text>
          <Text className="text-orange-700">ID: {sessionResult.correct_ans_id}</Text>
        </View>
      )}
    </View>
  );

  const renderLegacyResult = (legacyResult: GradingResult) => (
    <View className="space-y-4">
      <View className="bg-gray-50 rounded-xl p-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">Kết quả quét</Text>
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Tổng số ô:</Text>
            <Text className="font-semibold">{legacyResult.total}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Số ô đã tô:</Text>
            <Text className="font-semibold">{legacyResult.filled}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-700">Ô vuông màu đen:</Text>
            <Text className="font-semibold">{blackBoxes.length}</Text>
          </View>
        </View>
      </View>

      {blackBoxes.length > 0 && (
        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">Chi tiết ô đen</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap">
              {blackBoxes.map((b, idx) => (
                <View key={`${b.rect.join('-')}-${idx}`} className="bg-white rounded-lg px-3 py-2 mr-2 mb-2 border border-gray-200">
                  <Text className="text-xs text-gray-600">Ô {idx + 1}</Text>
                  <Text className="text-sm font-semibold text-gray-800">
                    ({b.rect[0]}, {b.rect[1]}) {b.rect[2]}x{b.rect[3]}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ minHeight: screenHeight }}>
      <Header title="Kết quả chấm" />

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {photoUri && (
          <View className="mb-4 items-center">
            <Image
              source={{ uri: photoUri }}
              style={{ width: '100%', height: undefined, aspectRatio: 3/4, borderRadius: 12, backgroundColor: '#111' }}
              resizeMode="contain"
            />
          </View>
        )}

        {result ? (
          isSessionResult(result) ? renderSessionResult(result) : renderLegacyResult(result)
        ) : (
          <View className="mb-4 rounded-xl p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <Text className="text-base text-yellow-800">
              Chưa có kết quả. {photoUri ? 'Nhấn Gửi chấm để xử lý ảnh.' : 'Quay lại chụp ảnh để chấm.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center justify-between px-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="flex-1 flex-row items-center justify-center rounded-xl py-3 mr-2"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <Ionicons name="home" size={20} color={COLORS.darkBlue} />
          <Text className="ml-2 text-base font-semibold" style={{ color: COLORS.darkBlue }}>
            Trang chủ
          </Text>
        </TouchableOpacity>

        {result ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('CameraScreen')}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3 ml-2"
            style={{ backgroundColor: COLORS.green }}
          >
            <Ionicons name="camera" size={20} color="#fff" />
            <Text className="ml-2 text-base font-semibold text-white">Chụp lại</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={!photoUri || submitting}
            onPress={uploadForScoring}
            className="flex-1 flex-row items-center justify-center rounded-xl py-3 ml-2"
            style={{ backgroundColor: !photoUri || submitting ? '#a7f3d0' : COLORS.green, opacity: submitting ? 0.7 : 1 }}
          >
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text className="ml-2 text-base font-semibold text-white">
              {submitting ? 'Đang gửi…' : 'Gửi chấm'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
