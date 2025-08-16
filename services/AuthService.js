import APIService from './APIService';

export const AuthService = {
	login: (payload) => APIService.signin(payload),
	register: (payload) => APIService.signup(payload),
	logout: () => APIService.signout(),

	// Forgot password flows - wire to backend when endpoints are ready
		sendResetCode: async (email) => APIService.sendResetCode({ email }),
		resetPassword: async ({ email, code, password }) => APIService.resetPassword({ email, code, password }),
};

export default AuthService;
