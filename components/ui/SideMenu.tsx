import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';

interface Item { readonly icon: keyof typeof Ionicons.glyphMap; readonly label: string; readonly onPress?: () => void; }

interface SideMenuProps {
  readonly visible: boolean;
  readonly items: ReadonlyArray<Item>;
  readonly onClose: () => void;
}

export function SideMenu({ visible, items, onClose }: SideMenuProps) {
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');
  const screenHeight = Dimensions.get('screen').height; // full physical screen height
  const menuWidth = Math.round(Math.min(Math.max(width / 3, 220), 360)); // giữ clamp hiện tại

  // Render state để vẫn giữ trong cây khi animate đóng
  const [rendered, setRendered] = useState(visible);
  const [interactive, setInteractive] = useState(visible); // điều khiển pointer events overlay
  const translateX = useRef(new Animated.Value(-menuWidth)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Cập nhật translate start khi đổi width trong trạng thái đóng
  useEffect(() => {
    if (!visible) {
      translateX.setValue(-menuWidth);
    }
  }, [menuWidth, visible, translateX]);

  useEffect(() => {
    if (visible) setRendered(true);
    if (visible) setInteractive(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: visible ? 0 : -menuWidth,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: visible ? 0.35 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && !visible) {
        setRendered(false);
        setInteractive(false);
      }
    });
  }, [visible, menuWidth, translateX, overlayOpacity]);

  if (!rendered) return null;

  return (
    <View className="absolute inset-0 z-50 flex-row" style={{ height: screenHeight }}>
      <Animated.View
        className="bg-gray-100"
        style={{ width: menuWidth, height: screenHeight, transform: [{ translateX }] }}
      >
        <View
          className="flex-1 px-4"
          style={{ paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <Text className="pt-8 mb-2 text-2xl font-bold" style={{ color: COLORS.darkBlue }}>
            MENU
          </Text>
          <View className="flex-1 justify-evenly">
            {items.map((it) => (
              <TouchableOpacity
                key={it.label}
                className="flex-row items-center rounded-lg px-2 py-2"
                onPress={() => {
                  it.onPress?.();
                  onClose();
                }}
              >
                <Ionicons name={it.icon} size={20} color={COLORS.darkBlue} />
                <Text className="ml-3 text-base" style={{ color: COLORS.darkBlue }}>
                  {it.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
      {/* Overlay chiếm toàn bộ phần ngoài menu */}
      <Animated.View
        style={{ flex: 1, backgroundColor: '#000', opacity: overlayOpacity }}
        pointerEvents={interactive ? 'auto' : 'none'}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={{ flex: 1 }}
          onPress={onClose}
        />
      </Animated.View>
    </View>
  );
}
