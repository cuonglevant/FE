import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

interface BottomNavProps {
  active: 'home' | 'settings';
  onHome: () => void;
  onSettings: () => void;
}

export function BottomNav({ active, onHome, onSettings }: BottomNavProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute left-0 right-0 flex-row items-center justify-center" style={{ bottom: Math.max(8, insets.bottom) }}>
      <View className="flex-row items-center justify-center rounded-full bg-white px-10 py-3 shadow">
        {([
          { icon: 'home' as const, onPress: onHome },
          { icon: 'person-circle-outline' as const, onPress: onSettings },
        ]).map(({ icon, onPress }) => {
          const isActive = (icon === 'home' && active === 'home') || (icon === 'person-circle-outline' && active === 'settings');
          return (
            <TouchableOpacity key={icon} className="mx-5" onPress={onPress}>
              <Ionicons name={icon} size={24} color={isActive ? COLORS.green : COLORS.darkBlue} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
