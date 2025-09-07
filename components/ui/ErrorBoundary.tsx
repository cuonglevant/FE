import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 items-center justify-center bg-white px-4">
          <Ionicons name="bug" size={64} color="#EF4444" />
          <Text className="text-red-600 text-xl font-bold mb-2 text-center">
            Đã xảy ra lỗi
          </Text>
          <Text className="text-gray-600 text-base mb-6 text-center">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
          </Text>
          
          <TouchableOpacity 
            onPress={this.handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-lg mb-3"
          >
            <Text className="text-white font-medium text-base">Thử lại</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              // Force app restart or navigate to home
              this.setState({ hasError: false });
            }}
            className="px-6 py-2"
          >
            <Text className="text-gray-600">Khởi động lại</Text>
          </TouchableOpacity>
          
          {__DEV__ && this.state.error && (
            <View className="mt-6 p-4 bg-gray-100 rounded-lg max-w-full">
              <Text className="text-xs text-gray-600 font-mono">
                {this.state.error.toString()}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
