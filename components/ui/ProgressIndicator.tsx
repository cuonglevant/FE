import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface Step {
  key: string;
  label: string;
  icon: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  const getStepStatus = (index: number): Step['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStepColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return { bg: COLORS.green, text: 'text-green-700', icon: COLORS.green };
      case 'active':
        return { bg: COLORS.primary, text: 'text-primary', icon: COLORS.primary };
      case 'error':
        return { bg: '#EF4444', text: 'text-red-700', icon: '#EF4444' };
      default:
        return { bg: '#E5E7EB', text: 'text-gray-400', icon: '#9CA3AF' };
    }
  };

  const getStepIcon = (step: Step, status: Step['status']) => {
    if (status === 'completed') {
      return 'checkmark-circle';
    }
    if (status === 'error') {
      return 'close-circle';
    }
    return step.icon;
  };

  return (
    <View className={`px-4 py-3 bg-gray-50 rounded-lg ${className}`}>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-gray-700">Tiến độ chấm bài</Text>
        <Text className="text-sm text-gray-500">{currentStep + 1}/{steps.length}</Text>
      </View>
      
      <View className="flex-row space-x-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const colors = getStepColor(status);
          const iconName = getStepIcon(step, status);
          
          return (
            <View key={step.key} className="flex-1 items-center">
              {/* Progress Bar */}
              <View className="w-full mb-2">
                <View 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    status === 'completed' ? 'bg-green-500' : 
                    status === 'active' ? 'bg-primary' : 'bg-gray-200'
                  }`} 
                />
              </View>
              
              {/* Icon and Label */}
              <View className="items-center">
                <View 
                  className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${
                    status === 'completed' ? 'bg-green-100' :
                    status === 'active' ? 'bg-primary/20' : 'bg-gray-100'
                  }`}
                >
                  <Ionicons 
                    name={iconName as any} 
                    size={16} 
                    color={colors.icon} 
                  />
                </View>
                <Text 
                  className={`text-xs text-center font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'active' ? 'text-primary' : 'text-gray-400'
                  }`}
                  numberOfLines={2}
                >
                  {step.label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default ProgressIndicator;
