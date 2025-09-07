import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, FlatList, BackHandler, Platform, ToastAndroid } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '../ui/AppHeader';
import { BottomNav } from '../ui/BottomNav';
import { useResponsiveHeader } from '../ui/useResponsiveHeader';
import { ExamCard } from '../ui/ExamCard';
import { SideMenu } from '../ui/SideMenu';
import APIService from '../../services/APIService';

function computeQuestionCount(parts: any[]): number {
  if (!Array.isArray(parts)) return 0;
  let total = 0;
  for (const p of parts) {
    const q = Array.isArray(p?.questions) ? p.questions.length : 0;
    total += q;
  }
  return total;
}

function mapExamToCard(x: any) {
  const created = x?.createdAt ? new Date(x.createdAt) : null;
  const createdAt = created ? created.toLocaleDateString('vi-VN') : '-';
  return {
    title: x?.name || 'Đề',
    code: x?.code || (x?._id ? String(x._id).slice(-4) : '----'),
    createdAt,
    questionCount: computeQuestionCount(x?.parts),
  };
}

type RootStackParamList = {
  CameraScreen: undefined;
  HistoryScreen: undefined;
  CreateExamScreen: undefined;
  SettingScreen: undefined;
  AutoGradingFlowScreen: undefined;
};

const sampleExams = [
  { title: 'TOÁN', code: 'TO01', createdAt: '27-TH6-2025', questionCount: 30 },
  { title: 'ANH', code: 'AO12', createdAt: '28-TH6-2025', questionCount: 40 },
  { title: 'LÝ', code: 'LO02', createdAt: '29-TH6-2025', questionCount: 35 },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exams, setExams] = useState<any[]>(sampleExams);
  const lastBackPressRef = useRef<number>(0);

  const { headerHeight } = useResponsiveHeader();
  const bubbleSize = useMemo(() => Math.max(64, Math.min(96, Math.floor(headerHeight * 0.35))), [headerHeight]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await APIService.getExams();
        const arr = Array.isArray(data) ? data : [];
        const mapped = arr.map(mapExamToCard);
        if (mounted && mapped.length) setExams(mapped);
      } catch (e) {
        console.warn('Failed to fetch exams from backend:', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Android hardware back: close menu if open, else exit app (prevent going back to login)
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return; // only apply on Android
      const onBackPress = () => {
        if (menuOpen) {
          setMenuOpen(false);
          return true;
        }
        const now = Date.now();
        if (lastBackPressRef.current && now - lastBackPressRef.current < 2000) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressRef.current = now;
        try {
          ToastAndroid.show('Nhấn lần nữa để thoát', ToastAndroid.SHORT);
          return true; // consume first press
        } catch {
          return false; // fallback if toast fails
        }
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [menuOpen])
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
  <AppHeader onMenu={() => setMenuOpen(true)} height={headerHeight} centerIcon={{ name: 'home' }} />

      {/* Cards list */}
      <FlatList
        data={exams}
        keyExtractor={(ex) => String(ex.code)}
        contentContainerStyle={{
          paddingTop: bubbleSize / 2 + 12,
          paddingHorizontal: 16,
          paddingBottom: Math.max(insets.bottom, 8) + 96,
        }}
        renderItem={({ item: ex }) => (
          <ExamCard
            title={ex.title}
            code={ex.code}
            createdAt={ex.createdAt}
            questionCount={ex.questionCount}
            onPress={() => navigation.navigate('CameraScreen')}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Add button */}
  {/* <TouchableOpacity
        onPress={() => navigation.navigate('CreateExamScreen')}
        className="absolute right-6 h-14 w-14 items-center justify-center rounded-full shadow"
        style={{ backgroundColor: COLORS.green, bottom: Math.max(insets.bottom + 72, 24) }}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity> */}

      {/* Bottom nav icons (centered) */}
  <BottomNav active="home" onHome={() => {}} onSettings={() => navigation.navigate('SettingScreen')} />

      {/* Side menu */}
      <SideMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { icon: 'checkbox-outline', label: 'Chấm bài', onPress: () => { setMenuOpen(false); navigation.navigate('AutoGradingFlowScreen'); } },
          { icon: 'create-outline', label: 'Tạo đáp án đúng', onPress: () => { setMenuOpen(false); navigation.navigate('CreateCorrectAnswersScreen' as any); } },
          { icon: 'school-outline', label: 'Lớp học', onPress: () => { setMenuOpen(false); } },
          { icon: 'settings-outline', label: 'Cài đặt', onPress: () => { setMenuOpen(false); navigation.navigate('SettingScreen'); } },
          // { icon: 'document-text-outline', label: 'Giấy thi', onPress: () => { setMenuOpen(false); } },
          // { icon: 'book-outline', label: 'Hướng dẫn', onPress: () => { setMenuOpen(false); } },
          // { icon: 'card-outline', label: 'Thanh toán', onPress: () => { setMenuOpen(false); } },
        ]}
      />
    </View>
  );
}
