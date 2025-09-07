import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useState } from 'react';
import { View, Text } from 'react-native';
import { SideMenu } from '../ui/SideMenu';
import { AppHeader } from '../ui/AppHeader';
import { BottomNav } from '../ui/BottomNav';
import { useResponsiveHeader } from '../ui/useResponsiveHeader';

type RootStackParamList = {
  Home: undefined;
  SettingScreen: undefined;
  CameraScreen: undefined;
};

// Full-screen settings screen mirroring Home layout
export default function SettingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menuOpen, setMenuOpen] = useState(false);
  const { headerHeight } = useResponsiveHeader();

  return (
    <View className="flex-1 bg-white">
      <AppHeader onMenu={() => setMenuOpen(true)} height={headerHeight} centerIcon={{ name: 'settings' }} />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-xl font-semibold text-gray-700">Cài đặt</Text>
        <Text className="mt-2 text-sm text-gray-500">Sẽ sớm cập nhật...</Text>
      </View>
      <BottomNav active="settings" onHome={() => navigation.navigate('Home')} onSettings={() => {}} />

      {/* Side menu */}
      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} items={[
        { icon: 'home-outline', label: 'Trang chủ', onPress: () => { setMenuOpen(false); navigation.navigate('Home'); } },
        { icon: 'settings-outline', label: 'Cài đặt', onPress: () => { setMenuOpen(false); } },
      ]} />
    </View>
  );
}
