import APIService from './APIService';

export const AuthService = {
	login: ({ email, password }) => APIService.signin({ email, password }),
	register: ({ email, password }) => APIService.signup({ email, password }),
	logout: () => APIService.signout(),

	// Forgot password flows - wire to backend when endpoints are ready
		sendResetCode: async (email) => APIService.sendResetCode({ email }),
		resetPassword: async ({ email, code, password }) => APIService.resetPassword({ email, code, password }),
};

export default AuthService;
