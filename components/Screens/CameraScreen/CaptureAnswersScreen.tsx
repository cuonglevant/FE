import { BaseCameraScreen } from './BaseCameraScreen';
import React from 'react';

type Props = {
  onCaptured?: (uri: string) => void;
};

export default function CaptureAnswersScreen({ onCaptured }: Props) {
  return (
    <BaseCameraScreen
      title="Chụp đáp án"
      filePrefix="answer_sheet"
      onCaptured={onCaptured}
    />
  );
}
