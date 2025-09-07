import React from 'react';
import { Platform, KeyboardAvoidingView, ScrollView, Dimensions, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;              // Wrap children in ScrollView
  keyboardAvoid?: boolean;       // Add KeyboardAvoidingView
  bgClassName?: string;          // Tailwind background classes
  contentContainerClassName?: string; // Tailwind classes for inner content container
  centerContent?: boolean;       // Center children vertically & horizontally (auth screens)
  disableTopInsetPadding?: boolean;   // If true, remove automatic top padding (e.g., custom header handles it)
  disableBottomInsetPadding?: boolean;// If true, remove automatic bottom padding
  extraStyle?: ViewStyle;        // Additional style overrides
}

export function ScreenWrapper({
  children,
  scroll,
  keyboardAvoid,
  bgClassName = 'bg-white',
  contentContainerClassName = '',
  centerContent,
  disableTopInsetPadding,
  disableBottomInsetPadding,
  extraStyle,
}: ScreenWrapperProps) {
  const screenHeight = Dimensions.get('screen').height;
  const insets = useSafeAreaInsets();

  const baseContentStyles: any = {
    flexGrow: 1,
    minHeight: screenHeight - (disableTopInsetPadding ? 0 : insets.top) - (disableBottomInsetPadding ? 0 : insets.bottom),
  };
  if (centerContent) {
    baseContentStyles.justifyContent = 'center';
    baseContentStyles.alignItems = 'center';
  }

  const inner = scroll ? (
    <ScrollView
      className={contentContainerClassName}
      contentContainerStyle={baseContentStyles}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  const maybeKeyboard = keyboardAvoid ? (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {inner}
    </KeyboardAvoidingView>
  ) : inner;

  return (
    <SafeAreaView
      className={`flex-1 ${bgClassName}`}
      style={{ minHeight: screenHeight, paddingTop: disableTopInsetPadding ? 0 : undefined, paddingBottom: disableBottomInsetPadding ? 0 : undefined, ...extraStyle }}
    >
      {maybeKeyboard}
    </SafeAreaView>
  );
}
