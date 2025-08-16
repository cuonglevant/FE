import { useMemo } from 'react';
import { Dimensions } from 'react-native';

export function useResponsiveHeader() {
  const { height, width } = Dimensions.get('window');
  const headerHeight = useMemo(() => Math.round(Math.max(120, Math.min(180, height * 0.22))), [height]);
  return { headerHeight, screenHeight: height, screenWidth: width };
}
