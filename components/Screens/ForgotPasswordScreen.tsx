import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../ui/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';
import AuthService from '../../services/AuthService';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const sendCode = async () => {
    try {
      if (!email.trim()) return alert('Vui lòng nhập email');
      setSending(true);
      const resp: any = await AuthService.sendResetCode(email);
      // Prefill with demoCode if backend returns it (dev only)
      if (resp?.demoCode) {
        setCode(String(resp.demoCode));
      } else {
        setCode((Math.floor(100000 + Math.random() * 900000)).toString());
      }
  setSending(false);
    } catch {
      setSending(false);
    }
  };

  const onChangePassword = async () => {
    if (!email || !code || !password || !confirm) return alert('Nhập đầy đủ thông tin');
    if (password !== confirm) return alert('Mật khẩu không khớp');
  await AuthService.resetPassword({ email, code, password });
  alert('Đổi mật khẩu thành công');
  };

  return (
  <ScreenWrapper scroll keyboardAvoid centerContent>
          <View className="w-full items-center px-4 py-6">
      <View className="w-full max-w-md rounded-2xl bg-white p-5 shadow">
        {/* Email + Send code */}
        <View className="mb-4">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="mail" size={18} color="#064e3b" />
            <Text className="ml-1 font-semibold text-green-800">Your Email</Text>
          </View>
          <View className="flex-row items-center">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              className="mr-2 flex-1 rounded-lg border border-green-700/60 px-3 py-2 text-black"
            />
            <TouchableOpacity
              onPress={sendCode}
              disabled={sending}
              className="rounded-lg bg-green-800 px-3 py-2"
            >
              <Text className="text-sm font-semibold text-white">{sending ? 'Sending…' : 'Send code'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Code */}
        <View className="mb-4">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="shield-checkmark-outline" size={18} color="#064e3b" />
            <Text className="ml-1 font-semibold text-green-800">Code</Text>
          </View>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6-digit code"
            keyboardType="number-pad"
            className="rounded-lg border border-green-700/60 px-3 py-2 text-black"
          />
        </View>

        {/* New Password */}
        <View className="mb-4">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="lock-closed-outline" size={18} color="#064e3b" />
            <Text className="ml-1 font-semibold text-green-800">New Password</Text>
          </View>
          <View className="flex-row items-center rounded-lg border border-green-700/60 px-2">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              secureTextEntry={!showPassword}
              className="flex-1 py-2 text-black"
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)} className="pl-2">
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mb-6">
          <View className="mb-1 flex-row items-center">
            <Ionicons name="lock-closed-outline" size={18} color="#064e3b" />
            <Text className="ml-1 font-semibold text-green-800">Confirm Password</Text>
          </View>
          <View className="flex-row items-center rounded-lg border border-green-700/60 px-2">
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirm}
              className="flex-1 py-2 text-black"
            />
            <TouchableOpacity onPress={() => setShowConfirm((p) => !p)} className="pl-2">
              <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Change button */}
        <TouchableOpacity onPress={onChangePassword} className="rounded-lg bg-green-800 py-3">
          <Text className="text-center text-base font-semibold text-white">Change</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-3 items-center" onPress={() => navigation.navigate('LogInScreen')}>
          <Text className="text-sm text-gray-600">Have an account ?</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScreenWrapper>
  );
}
