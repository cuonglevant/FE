import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text } from 'react-native';

import { COLORS } from '../constants/colors';

interface HomeButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  bgColor?: string;
}

export function HomeButton({ icon, label, onPress, bgColor }: HomeButtonProps) {
  return (
    <TouchableOpacity
      className="mb-4 flex-row items-center rounded-xl p-4 shadow"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
      activeOpacity={0.8}
      onPress={onPress}>
      <View
        className="mr-4 h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: COLORS.green }}>
        <Ionicons name={icon} size={32} color="#fff" />
      </View>
      <Text className=" flex-1 text-xl font-medium" style={{ color: COLORS.darkBlue }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
    </TouchableOpacity>
  );
}
