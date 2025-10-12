import APIService from '../../services/APIService';
import AuthService from '../../services/AuthService';

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('API Services Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe('AuthService', () => {
    test('should login successfully with valid credentials', async () => {
      const mockResponse = {
        token: 'mock_jwt_token',
        user: { email: 'test@example.com' },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await AuthService.login({
        username: 'test@example.com',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('should handle login errors', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid credentials',
      } as Response);

      await expect(
        AuthService.login({ username: 'wrong@test.com', email: 'wrong@test.com', password: 'wrong' })
      ).rejects.toThrow();
    });
  });

  describe('Exam Management', () => {
    test('should fetch all exams successfully', async () => {
      const mockExams = [
        {
          _id: '1',
          student_id: 'SBD001',
          exam_code: 'DE001',
          total_score: 8.5,
          created_at: '2025-10-12T10:00:00Z',
        },
        {
          _id: '2',
          student_id: 'SBD002',
          exam_code: 'DE001',
          total_score: 7.0,
          created_at: '2025-10-12T11:00:00Z',
        },
      ];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockExams,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.getExams();

      expect(result).toEqual(mockExams);
      expect(result).toHaveLength(2);
      expect(result[0].student_id).toBe('SBD001');
    });

    test('should filter exams by student_id', async () => {
      const mockExams = [
        {
          _id: '1',
          student_id: 'SBD001',
          exam_code: 'DE001',
          total_score: 8.5,
        },
      ];

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockExams,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.getExams({ student_id: 'SBD001' });

      expect(result).toEqual(mockExams);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('student_id=SBD001'),
        expect.any(Object)
      );
    });

    test('should create exam successfully', async () => {
      const newExam = {
        student_id: 'SBD003',
        exam_code: 'DE002',
        total_score: 9.0,
      };

      const createdExam = { _id: '123', ...newExam };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdExam,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.createExam(newExam);

      expect(result).toEqual(createdExam);
      expect(result._id).toBe('123');
    });
  });

  describe('Health Check', () => {
    test('should verify backend health', async () => {
      const mockHealth = {
        status: 'healthy',
        services: {
          database: 'connected',
          ocr: 'available',
        },
      };

      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHealth,
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      const result = await APIService.testFlaskConnection();

      expect(result.status).toBe('healthy');
      expect(result.services.database).toBe('connected');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
        new TypeError('Network request failed')
      );

      await expect(APIService.getExams()).rejects.toThrow();
    });

    test('should handle 500 server errors', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error occurred',
      } as Response);

      await expect(APIService.getExams()).rejects.toThrow();
    });

    test('should handle 404 not found errors', async () => {
      (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      } as Response);

      await expect(APIService.getExamById('invalid_id')).rejects.toThrow();
    });
  });
});
