import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenWrapper } from '../ui/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp<any>>();

  return (
  <ScreenWrapper scroll keyboardAvoid centerContent>
          <View className="w-full items-center px-6 py-8">
        {[{
          label: 'Email',
          icon: 'mail',
          value: email,
          onChangeText: setEmail,
          placeholder: 'Enter email',
          keyboardType: 'email-address',
          secure: false
        }, {
          label: 'Password',
          icon: 'lock-closed-outline',
          value: password,
          onChangeText: setPassword,
          placeholder: 'Enter password',
          keyboardType: 'default',
          secure: !showPassword,
          toggleSecure: () => setShowPassword(!showPassword),
          showSecure: showPassword
        }].map((item, idx) => (
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
        <TouchableOpacity className="w-full items-end pb-2" onPress={() => navigation.navigate('ForgotPasswordScreen')}>
          <Text className="text-sm text-gray-600">Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-full rounded-lg bg-green-800 py-3 mb-3"
          onPress={async () => {
            if (!email.trim() || !password.trim()) {
              alert('Vui lòng nhập đầy đủ thông tin!');
              return;
            }
            try {
              await AuthService.login({ username: email, password });
              navigation.navigate('Home');
            } catch (e: any) {
              alert(e.message || 'Đăng nhập thất bại');
            }
          }}
        >
          <Text className="text-white text-center text-base font-semibold">Log in</Text>
        </TouchableOpacity>
        <TouchableOpacity className="w-full">
          <Text className="text-sm text-center text-gray-600" onPress={() => navigation.navigate('SignUpScreen')}>
            Not have account?
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
