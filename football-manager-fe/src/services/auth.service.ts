import axiosClient from './api/client';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    jwtToken: string;
}

export const authService = {
    /**
     * Đăng nhập
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosClient.post<LoginResponse>('/champions/auth/login', data);
        return response.data;
    },
};
