import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: '#88c273',
      }}
      className="h-25 rounded-t-xl"
    >
      <Text className="mt-2 text-2xl font-bold text-white">{title}</Text>
    </View>
  );
}
