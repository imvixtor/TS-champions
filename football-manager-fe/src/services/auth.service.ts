import axiosClient from './api/client';
import type { LoginRequest, LoginResponse } from '../types';

export type { LoginRequest, LoginResponse };

export const authService = {
    /**
     * Đăng nhập
     */
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await axiosClient.post<LoginResponse>('/champions/auth/login', data);
        return response.data;
    },
};
