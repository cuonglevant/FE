import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Header } from '../ui/Header';
import { COLORS } from '../constants/colors';

type RootStackParamList = {
  PreviewScreen: { photoUri?: string } | undefined;
  ResultsScreen: { result?: any; photoUri?: string } | undefined;
};

export default function PreviewScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'PreviewScreen'>>();
  const navigation = useNavigation<any>();
  const photoUri = route.params?.photoUri;
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('screen').height;

  return (
  <SafeAreaView className="flex-1 bg-white" style={{ minHeight: screenHeight }}>
      <Header title="Xem trước" />

      <View className="flex-1 items-center justify-center p-4">
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: '100%', height: undefined, aspectRatio: 3/4, borderRadius: 12, backgroundColor: '#111' }}
            resizeMode="contain"
          />
        ) : (
          <View className="h-96 w-full items-center justify-center rounded-xl bg-neutral-100">
            <Ionicons name="image" size={48} color={COLORS.darkBlue} />
            <Text className="mt-2 text-base" style={{ color: COLORS.darkBlue }}>
              Chưa có ảnh. Hãy chụp ảnh từ màn hình Chấm bài.
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-between px-4" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="flex-1 flex-row items-center justify-center rounded-xl py-3 mr-2"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.darkBlue} />
          <Text className="ml-2 text-base font-semibold" style={{ color: COLORS.darkBlue }}>
            Chụp lại
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!photoUri}
          onPress={() => navigation.navigate('ResultsScreen', { photoUri, autoUpload: true })}
          className="flex-1 flex-row items-center justify-center rounded-xl py-3 ml-2"
          style={{ backgroundColor: photoUri ? COLORS.green : '#a7f3d0', opacity: photoUri ? 1 : 0.7 }}
        >
          <Ionicons name="cloud-upload" size={20} color="#fff" />
          <Text className="ml-2 text-base font-semibold text-white">Gửi chấm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
