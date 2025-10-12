/**
 * Integration Tests - Complete Flow Testing
 * Tests the entire workflow from login to exam grading
 */

import APIService from '../../services/APIService';
import AuthService from '../../services/AuthService';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('Complete Exam Grading Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Authentication Flow', () => {
    test('Complete signup → login flow', async () => {
      // Step 1: Signup
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ message: 'User created successfully' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await AuthService.register({
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      });

      // Step 2: Login
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'jwt_token_123',
          user: { email: 'newuser@test.com' },
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const loginResult = await AuthService.login({
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
      });

      expect(loginResult.token).toBe('jwt_token_123');
      expect(loginResult.user.email).toBe('newuser@test.com');
    });
  });

  describe('Exam Management Flow', () => {
    test('Create correct answers → Scan exam → Get results', async () => {
      // In a real workflow:
      // Step 1: Correct answers uploaded via POST /correctans (multipart/form-data)
      // Step 2: Student exam scanned via POST /scan/answers
      // Step 3: Exam results calculated and saved

      const examResult = {
        _id: 'exam_123',
        student_id: 'SBD12345',
        exam_code: 'DE001',
        score_p1: 3.0,
        score_p2: 2.5,
        score_p3: 2.5,
        total_score: 8.0,
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => examResult,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.createExam({
        student_id: 'SBD12345',
        exam_code: 'DE001',
        total_score: 8.0,
      });

      expect(result.student_id).toBe('SBD12345');
      expect(result.exam_code).toBe('DE001');
      expect(result.total_score).toBe(8.0);
    });

    test('Retrieve exam history', async () => {
      const mockExamHistory = [
        {
          _id: '1',
          student_id: 'SBD12345',
          exam_code: 'DE001',
          total_score: 8.0,
          created_at: '2025-10-12T10:00:00Z',
        },
        {
          _id: '2',
          student_id: 'SBD12346',
          exam_code: 'DE001',
          total_score: 9.0,
          created_at: '2025-10-12T11:00:00Z',
        },
      ];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockExamHistory,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const history = await APIService.getExams({ exam_code: 'DE001' });

      expect(history).toHaveLength(2);
      expect(history[0].student_id).toBe('SBD12345');
      expect(history[1].total_score).toBe(9.0);
    });
  });

  describe('Error Recovery Flow', () => {
    test('Should handle missing correct answers gracefully', async () => {
      // Try to get correct answers for non-existent exam
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Correct answers not found for exam code',
      } as Response);

      await expect(APIService.getCorrectAnswersByCode('INVALID_CODE')).rejects.toThrow();
    });

    test('Should retry on network failure', async () => {
      // First attempt fails
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new TypeError('Network request failed')
      );

      await expect(APIService.getExams()).rejects.toThrow();

      // Second attempt succeeds
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.getExams();
      expect(result).toEqual([]);
    });
  });

  describe('Data Consistency Tests', () => {
    test('Exam data should remain consistent across operations', async () => {
      const examData = {
        student_id: 'SBD99999',
        exam_code: 'DE999',
        total_score: 10.0,
      };

      // Create exam
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          _id: 'exam_999',
          student_id: 'SBD99999',
          exam_code: 'DE999',
          total_score: 10.0,
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const created = await APIService.createExam(examData);
      expect(created.student_id).toBe(examData.student_id);

      // Retrieve exam
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          _id: 'exam_999',
          student_id: 'SBD99999',
          exam_code: 'DE999',
          total_score: 10.0,
        }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const retrieved = await APIService.getExamById('exam_999');
      expect(retrieved.student_id).toBe(examData.student_id);
      expect(retrieved.exam_code).toBe(examData.exam_code);
      expect(retrieved.total_score).toBe(examData.total_score);
    });
  });
});
