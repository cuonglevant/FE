import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '../ui/Header';
import { COLORS } from '../constants/colors';
import { UPLOAD_URL } from '../../config/api';

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

export default function ResultsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ResultsScreen'>>();
  const navigation = useNavigation<any>();

  const [result, setResult] = useState<GradingResult | null>(route.params?.result ?? null);
  const photoUri = route.params?.photoUri;
  const autoUpload = route.params?.autoUpload;
  const [blackBoxes, setBlackBoxes] = useState<Array<{ rect: [number, number, number, number]; mean_gray?: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('screen').height;

  useEffect(() => {
    if (result && Array.isArray(result.black_squares)) {
      setBlackBoxes(result.black_squares);
    }
  }, [result]);

  const uploadForScoring = async () => {
    if (!photoUri) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      // Flask expects multipart keys like exam_code / student_id / p1 / p2 / p3
      formData.append('p1', {
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
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: '#f3f4f6' }}>
            <Text className="mb-1 text-base" style={{ color: COLORS.darkBlue }}>
              Tổng số ô: <Text className="font-semibold">{result.total}</Text>
            </Text>
            <Text className="mb-1 text-base" style={{ color: COLORS.darkBlue }}>
              Số ô đã tô: <Text className="font-semibold">{result.filled}</Text>
            </Text>
            <Text className="mb-2 text-base" style={{ color: COLORS.darkBlue }}>
              Ô vuông màu đen: <Text className="font-semibold">{blackBoxes.length}</Text>
            </Text>

            {blackBoxes.length > 0 && (
              <View className="mt-2">
                {blackBoxes.map((b, idx) => (
                  <Text key={`${b.rect.join('-')}-${idx}`} className="text-sm" style={{ color: COLORS.darkBlue }}>
                    - ({b.rect[0]}, {b.rect[1]}) {b.rect[2]}x{b.rect[3]}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View className="mb-4 rounded-xl p-4" style={{ backgroundColor: '#fef3c7' }}>
            <Text className="text-base" style={{ color: COLORS.darkBlue }}>
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
            <Text className="ml-2 text-base font-semibold text-white">{submitting ? 'Đang gửi…' : 'Gửi chấm'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
