import APIService from './APIService';

export const AuthService = {
	login: ({ username, email, password }) => APIService.signin({ email: email || username, password }),
	register: ({ username, email, password }) => APIService.signup({ email: email || username, password }),
	logout: () => APIService.signout(),

	// Forgot password flows - wire to backend when endpoints are ready
		sendResetCode: async (email) => APIService.sendResetCode({ email }),
		resetPassword: async ({ email, code, password }) => APIService.resetPassword({ email, code, password }),
};

export default AuthService;
