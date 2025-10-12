import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from 'components/Screens/CameraScreen/CameraScreen';
import CaptureExamCodeScreen from 'components/Screens/CameraScreen/CaptureExamCodeScreen';
import CaptureAnswersScreen from 'components/Screens/CameraScreen/CaptureAnswersScreen';
import CreateCorrectAnswersScreen from 'components/Screens/CreateCorrectAnswersScreen';
import MultiPartScanScreen from 'components/Screens/MultiPartScanScreen';
import ReviewScanScreen from 'components/Screens/ReviewScanScreen';
import SettingScreen from 'components/Screens/SettingScreen';
import { StatusBar } from 'expo-status-bar';
import LogInScreen from 'components/Screens/LogInScreen';
import SignUpScreen from 'components/Screens/SignUpScreen';
import PreviewScreen from 'components/Screens/PreviewScreen';
import ResultsScreen from 'components/Screens/ResultsScreen';
import ForgotPasswordScreen from 'components/Screens/ForgotPasswordScreen';

import Home from './components/home/Home';
import './global.css';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="LogInScreen"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="CameraScreen" component={CameraScreen} />
          <Stack.Screen name="CaptureExamCodeScreen" component={CaptureExamCodeScreen} />
          <Stack.Screen name="CaptureAnswersScreen" component={CaptureAnswersScreen} />
          <Stack.Screen name="MultiPartScanScreen" component={MultiPartScanScreen} />
          <Stack.Screen name="ReviewScanScreen" component={ReviewScanScreen} />
          <Stack.Screen name="SettingScreen" component={SettingScreen} />
          <Stack.Screen name="LogInScreen" component={LogInScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
          <Stack.Screen name="PreviewScreen" component={PreviewScreen} />
          <Stack.Screen name="ResultsScreen" component={ResultsScreen} />
          <Stack.Screen name="CreateCorrectAnswersScreen" component={CreateCorrectAnswersScreen} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
