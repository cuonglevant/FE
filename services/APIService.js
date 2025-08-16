import { API_BASE } from '../config/api';

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
	signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
	signin: (payload) => request('/auth/signin', { method: 'POST', body: JSON.stringify(payload) }),
	signout: () => request('/auth/signout', { method: 'POST' }),
		sendResetCode: (payload) => request('/auth/send-reset-code', { method: 'POST', body: JSON.stringify(payload) }),
		resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

	// Exam
	getExams: () => request('/exam', { method: 'GET' }),
	getExamById: (id) => request(`/exam/${id}`, { method: 'GET' }),
	createExam: (payload) => request('/exam', { method: 'POST', body: JSON.stringify(payload) }),

	// Integration checks
	testFlaskConnection: () => request('/integration/test-flask-connection', { method: 'GET' }),
	testGradingCompatibility: (payload = {}) => request('/integration/test-grading-compatibility', { method: 'POST', body: JSON.stringify(payload) }),
};

export default APIService;
