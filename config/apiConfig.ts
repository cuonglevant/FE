// Cấu hình động cho API endpoint
// Lấy biến môi trường từ globalThis hoặc process.env (tùy môi trường build)
const env = (typeof globalThis !== 'undefined' ? globalThis : process.env) as any;

export const API_CONFIG = {
  API_BASE: env.EXAM_API_BASE || 'http://192.168.1.4:8080',
  BE_URL: env.EXAM_BE_URL || 'http://192.168.1.4:8080',
  FLASK_URL: env.EXAM_FLASK_URL || 'http://192.168.1.4:5000',
  isDevice: false,
};
