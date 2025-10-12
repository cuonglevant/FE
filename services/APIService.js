import { API_BASE } from '../config/apiConfig';

async function request(path, options = {}) {
	const url = `${API_BASE}${path}`;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), options.timeout || 15000); // 15s default
	try {
		// Log request (don't try to parse FormData as JSON)
		const bodyLog = options.body instanceof FormData 
			? '[FormData]' 
			: options.body 
				? JSON.parse(options.body) 
				: '';
		console.log(`[API] ${options.method || 'GET'} ${url}`, bodyLog);
		
		// Prepare headers - don't set Content-Type for FormData
		const headers = { ...options.headers };
		if (!(options.body instanceof FormData) && !headers['Content-Type']) {
			headers['Content-Type'] = 'application/json';
		}
		
		const res = await fetch(url, {
			headers,
			credentials: 'include',
			signal: controller.signal,
			...options,
		});
		console.log(`[API] Response ${res.status} ${res.statusText}`);
		if (!res.ok) {
			const text = await res.text().catch(() => '');
			console.error(`[API] Error response:`, text);
			throw new Error(`Request to ${url} failed: HTTP ${res.status} ${res.statusText} ${text}`.trim());
		}
		const ct = res.headers.get('content-type') || '';
		console.log(`[API] Content-Type: ${ct}`);
		
		// Try to parse response
		if (ct.includes('application/json')) {
			const json = await res.json();
			console.log(`[API] JSON Response:`, json);
			return json;
		} else {
			const text = await res.text();
			console.log(`[API] Text Response:`, text);
			return text;
		}
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
	// Auth - Updated endpoints to match new API
	signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
	signin: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
	signout: () => request('/auth/logout', { method: 'POST' }),
	sendResetCode: (payload) => request('/auth/send-reset-code', { method: 'POST', body: JSON.stringify(payload) }),
	resetPassword: (payload) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

	// Exams - Updated endpoints
	getExams: (params = {}) => {
		const query = new URLSearchParams(params).toString();
		return request(`/exams${query ? '?' + query : ''}`, { method: 'GET' });
	},
	getExamById: (id) => request(`/exams/${id}`, { method: 'GET' }),
	createExam: (payload) => request('/exams', { method: 'POST', body: JSON.stringify(payload) }),
	updateExam: (id, payload) => request(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
	deleteExam: (id) => request(`/exams/${id}`, { method: 'DELETE' }),

	// Correct Answers
	getCorrectAnswers: () => request('/correctans', { method: 'GET' }),
	getCorrectAnswersByCode: (examCode) => request(`/correctans/${examCode}`, { method: 'GET' }),
	updateCorrectAnswers: (examCode, payload) => request(`/correctans/${examCode}`, { method: 'PUT', body: JSON.stringify(payload) }),
	deleteCorrectAnswers: (examCode) => request(`/correctans/${examCode}`, { method: 'DELETE' }),

	// Scan endpoints
	scanStudentId: (imageFile) => {
		const formData = new FormData();
		formData.append('image', imageFile);
		return request('/scan/student_id', {
			method: 'POST',
			body: formData,
			headers: {}, // Remove Content-Type to let browser set it with boundary
		});
	},
	scanExamCode: (imageFile) => {
		const formData = new FormData();
		formData.append('image', imageFile);
		return request('/scan/exam_code', {
			method: 'POST',
			body: formData,
			headers: {},
		});
	},
	scanAnswers: (p1Image, p2Image, p3Image) => {
		const formData = new FormData();
		if (p1Image) formData.append('p1_img', p1Image);
		if (p2Image) formData.append('p2_img', p2Image);
		if (p3Image) formData.append('p3_img', p3Image);
		return request('/scan/answers', {
			method: 'POST',
			body: formData,
			headers: {},
		});
	},

	// Health check
	testFlaskConnection: () => request('/health', { method: 'GET' }),
	testGradingCompatibility: () => request('/health', { method: 'GET' }),
};

export default APIService;
