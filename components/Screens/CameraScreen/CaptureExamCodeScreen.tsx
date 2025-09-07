import { BaseCameraScreen } from './BaseCameraScreen';
import React from 'react';

type Props = {
  onCaptured?: (uri: string) => void;
};

export default function CaptureExamCodeScreen({ onCaptured }: Props) {
  return (
    <BaseCameraScreen
      title="Chụp mã đề"
      filePrefix="exam_code"
      onCaptured={onCaptured}
    />
  );
}
