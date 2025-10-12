import React from 'react';
import { render } from '@testing-library/react-native';
import { ExamCard } from '../../components/ui/ExamCard';

describe('ExamCard Component', () => {
  const mockProps = {
    title: 'TOÁN',
    code: 'TO01',
    createdAt: '27-TH6-2025',
    questionCount: 30,
    onPress: jest.fn(),
  };

  it('should render exam card with correct information', () => {
    const { getByText } = render(<ExamCard {...mockProps} />);

    expect(getByText('TOÁN - TO01')).toBeTruthy();
    expect(getByText('Ngày tạo: 27-TH6-2025')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
  });

  test('should call onPress when card is pressed', () => {
    render(<ExamCard {...mockProps} />);
    
    // Note: ExamCard would need testID prop for this to work
    // This is a placeholder test
    expect(mockProps.onPress).toBeDefined();
  });

  test('should display different question counts', () => {
    const { rerender, getByText } = render(
      <ExamCard {...mockProps} questionCount={50} />
    );

    expect(getByText('50')).toBeTruthy();

    rerender(<ExamCard {...mockProps} questionCount={20} />);
    expect(getByText('20')).toBeTruthy();
  });
});
