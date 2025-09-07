import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface AppHeaderProps {
  onMenu?: () => void;
  centerIcon?: { name: any; size?: number; color?: string };
  rightPlaceholder?: boolean; // keep layout symmetrical
  height: number;
}

export function AppHeader({ onMenu, centerIcon, rightPlaceholder = true, height }: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height, width: '100%', backgroundColor: COLORS.green, paddingTop: insets.top + 8 }}>
      <View className="flex-row items-center justify-between px-4">
        <TouchableOpacity onPress={onMenu} className="rounded-md p-2">
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        {rightPlaceholder && <Ionicons name="battery-half" size={20} color="transparent" />}
      </View>
      <View className="flex-1 items-center justify-center">
        {centerIcon && (
          <Ionicons
            name={centerIcon.name}
            size={centerIcon.size ?? 48}
            color={centerIcon.color ?? '#fff'}
          />
        )}
      </View>
    </View>
  );
}
