import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import APIService from '../../services/APIService';

interface CapturedImage {
  uri: string;
  fileName: string;
}

interface RouteParams {
  examCode: string;
  scannedExamCode?: string;
  images: {
    exam_code: CapturedImage;
    p1: CapturedImage;
    p2: CapturedImage;
    p3: CapturedImage;
  };
}

export default function ReviewScanScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { examCode, scannedExamCode, images } = route.params as RouteParams;

  const [studentId, setStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!studentId.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mã sinh viên');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare files
      const p1File = {
        uri: images.p1.uri,
        type: 'image/jpeg',
        name: images.p1.fileName,
      };
      const p2File = {
        uri: images.p2.uri,
        type: 'image/jpeg',
        name: images.p2.fileName,
      };
      const p3File = {
        uri: images.p3.uri,
        type: 'image/jpeg',
        name: images.p3.fileName,
      };

      // Scan all answer parts
      const answerResults = await APIService.scanAnswers(p1File, p2File, p3File);

      // Calculate total score
      const totalScore =
        (answerResults.p1?.score || 0) +
        (answerResults.p2?.score || 0) +
        (answerResults.p3?.score || 0);

      // Create exam record
      const examData = {
        exam_code: scannedExamCode || examCode,
        student_id: studentId.trim(),
        total_score: totalScore,
        score_p1: answerResults.p1?.score || 0,
        score_p2: answerResults.p2?.score || 0,
        score_p3: answerResults.p3?.score || 0,
        answers: [
          ...(answerResults.p1?.answers || []),
          ...(answerResults.p2?.answers || []),
          ...(answerResults.p3?.answers || []),
        ],
      };

      await APIService.createExam(examData);

      Alert.alert('✅ Hoàn thành', `Tổng điểm: ${totalScore}`, [
        {
          text: 'Xem kết quả',
          onPress: () => {
            (navigation as any).navigate('ResultsScreen', {
              examResult: examData,
              answerDetails: answerResults,
            });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể hoàn tất chấm điểm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderImagePreview = (label: string, image: CapturedImage) => {
    return (
      <View className="mb-4">
        <Text className="mb-2 font-semibold" style={{ color: COLORS.darkBlue }}>
          {label}
        </Text>
        <Image
          source={{ uri: image.uri }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 12,
            backgroundColor: COLORS.lightGray,
          }}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6" style={{ backgroundColor: COLORS.darkBlue }}>
        <Text className="text-2xl font-bold text-white">Xem lại trước khi nộp</Text>
        <Text className="mt-2 text-white/80">
          Đề: {scannedExamCode || examCode}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Student ID Input */}
        <View className="mb-6">
          <Text className="mb-2 text-lg font-bold" style={{ color: COLORS.darkBlue }}>
            Mã sinh viên *
          </Text>
          <TextInput
            value={studentId}
            onChangeText={setStudentId}
            placeholder="Nhập mã sinh viên (VD: SBD12345)"
            className="rounded-xl border-2 px-4 py-3 text-base"
            style={{
              borderColor: COLORS.lightGray,
              color: COLORS.darkBlue,
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        {/* Images Preview */}
        <View className="mb-6">
          <Text className="mb-4 text-lg font-bold" style={{ color: COLORS.darkBlue }}>
            Ảnh đã chụp
          </Text>

          {renderImagePreview('📄 Mã đề thi', images.exam_code)}
          {renderImagePreview('📝 Phần 1', images.p1)}
          {renderImagePreview('📝 Phần 2', images.p2)}
          {renderImagePreview('📝 Phần 3', images.p3)}
        </View>

        {/* Info Box */}
        <View
          className="mb-6 rounded-2xl p-4"
          style={{ backgroundColor: COLORS.beige }}
        >
          <Text className="text-sm" style={{ color: COLORS.darkBlue }}>
            💡 <Text className="font-semibold">Lưu ý:</Text> Kiểm tra kỹ các ảnh đã chụp.
            Sau khi nộp, hệ thống sẽ tự động chấm điểm dựa trên đáp án đã tạo.
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="mb-3 rounded-xl py-4"
          style={{ backgroundColor: COLORS.green }}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-lg font-bold text-white">
              ✅ Nộp bài và chấm điểm
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-xl py-4"
          style={{ backgroundColor: COLORS.lightGray }}
          disabled={isSubmitting}
        >
          <Text className="text-center font-semibold" style={{ color: COLORS.darkBlue }}>
            ← Quay lại chụp lại
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
