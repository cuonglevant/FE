import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from '../ui/ScreenWrapper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<NavigationProp<any>>();

  const fields = [
    {
      label: 'Email',
      icon: 'mail',
      value: email,
      onChangeText: setEmail,
      placeholder: 'Enter email',
      keyboardType: 'email-address',
      secure: false,
      showSecure: undefined,
      toggleSecure: undefined,
      mb: 4,
    },
    {
      label: 'Password',
      icon: 'lock-closed-outline',
      value: password,
      onChangeText: setPassword,
      placeholder: 'Enter password',
      keyboardType: 'default',
      secure: !showPassword,
      showSecure: showPassword,
      toggleSecure: () => setShowPassword(!showPassword),
      mb: 4,
    },
    {
      label: 'Confirm Password',
      icon: 'lock-closed-outline',
      value: confirmPassword,
      onChangeText: setConfirmPassword,
      placeholder: 'Re-enter password',
      keyboardType: 'default',
      secure: !showConfirmPassword,
      showSecure: showConfirmPassword,
      toggleSecure: () => setShowConfirmPassword(!showConfirmPassword),
      mb: 2,
    },
  ];

  return (
  <ScreenWrapper scroll keyboardAvoid centerContent>
          <View className="w-full items-center px-6 py-8">
            {fields.map((item) => (
          <View className="w-full mb-4" key={item.label}>
            <View className="mb-1 flex-row items-center">
              <Ionicons name={item.icon as any} size={18} color="#064e3b" className="mr-1" />
              <Text className="text-green-800 font-semibold">{item.label}</Text>
            </View>
            <View className="flex-row items-center rounded-lg border border-green-700 px-3 py-2">
              <TextInput
                placeholder={item.placeholder}
                className="flex-1 text-black"
                keyboardType={item.keyboardType as any}
                value={item.value}
                onChangeText={item.onChangeText}
                secureTextEntry={item.secure}
              />
              {item.toggleSecure && (
                <TouchableOpacity onPress={item.toggleSecure} className="pl-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  {item.showSecure ? (
                    <Ionicons name="eye-off-outline" size={20} color="#4B5563" />
                  ) : (
                    <Ionicons name="eye-outline" size={20} color="#4B5563" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity className="w-full items-end pb-2">
          <Text className="text-sm text-gray-600" onPress={() => navigation.navigate('LogInScreen')}>
            Have an account?
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full rounded-lg bg-green-800 py-3 mb-3"
          onPress={async () => {
            if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
              alert('Vui lòng nhập đầy đủ thông tin!');
              return;
            }
            if (password !== confirmPassword) {
              alert('Mật khẩu không khớp');
              return;
            }
            try {
              // Using email as username by default for demo
              await AuthService.register({ username: email, email, password });
              navigation.navigate('LogInScreen');
            } catch (e: any) {
              alert(e.message || 'Đăng ký thất bại');
            }
          }}
        >
          <Text className="text-white text-center text-base font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
