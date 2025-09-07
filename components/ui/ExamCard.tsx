import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface ExamCardProps {
  title: string;
  code: string;
  createdAt: string;
  questionCount: number;
  onPress?: () => void;
}

export function ExamCard({ title, code, createdAt, questionCount, onPress }: ExamCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="mb-4 rounded-2xl p-4"
      style={{ backgroundColor: COLORS.green }}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-lg font-extrabold text-white">{title} - {code}</Text>
          <Text className="mt-1 text-xs text-white/90">Ngày tạo: {createdAt}</Text>
        </View>
        <View className="items-center justify-center rounded-xl bg-white px-3 py-2">
          <Text className="text-[10px] font-semibold" style={{ color: COLORS.darkBlue }}>SỐ CÂU</Text>
          <Text className="text-lg font-extrabold" style={{ color: COLORS.darkBlue }}>{questionCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
