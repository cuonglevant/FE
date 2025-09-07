import { API_BASE } from '../config/apiConfig';

async function request(path, options = {}) {
	const url = `${API_BASE}${path}`;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), options.timeout || 15000); // 15s default
	try {
		const res = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				...(options.headers || {}),
			},
			credentials: 'include',
			signal: controller.signal,
			...options,
		});
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`Request to ${url} failed: HTTP ${res.status} ${res.statusText} ${text}`.trim());
		}
		const ct = res.headers.get('content-type') || '';
		return ct.includes('application/json') ? res.json() : res.text();
	} catch (err) {
		if (err.name === 'AbortError') {
			throw new Error(`Request timed out: ${url}`);
		}
		// React Native fetch uses a generic TypeError on network failure
		throw new Error(`Network error calling ${url}: ${err.message || err}`);
	} finally {
		clearTimeout(id);
	}
}

export const APIService = {
	// Auth
	signup: (payload) => request('/signup', { method: 'POST', body: JSON.stringify(payload) }),
	signin: (payload) => request('/login', { method: 'POST', body: JSON.stringify(payload) }),
	signout: () => request('/logout', { method: 'POST' }),
		sendResetCode: (payload) => request('/auth/send-reset-code', { method: 'POST', body: JSON.stringify(payload) }),
		resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

	// Exam
	getExams: () => request('/exams', { method: 'GET' }),
	getExamById: (id) => request(`/exam/${id}`, { method: 'GET' }),
	createExam: (payload) => request('/exam', { method: 'POST', body: JSON.stringify(payload) }),

	// Integration checks (map to /health for availability)
	testFlaskConnection: () => request('/health', { method: 'GET' }),
	testGradingCompatibility: (payload = {}) => request('/health', { method: 'GET' }),
};

export default APIService;
