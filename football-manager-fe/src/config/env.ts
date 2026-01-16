/**
 * Environment configuration
 * 
 * Sử dụng Vite environment variables:
 * - Development: .env.local hoặc .env
 * - Production: Set trong CI/CD hoặc hosting platform
 * 
 * Usage:
 * import { API_CONFIG } from '@/config/env';
 * const url = `${API_CONFIG.BASE_URL}/api/endpoint`;
 */

export const API_CONFIG = {
    /**
     * Base URL của API backend
     * Mặc định: http://localhost:8080 (development)
     * Production: Set VITE_API_URL trong environment variables
     */
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
} as const;

/**
 * Kiểm tra xem có đang ở môi trường development không
 */
export const isDevelopment = import.meta.env.DEV;

/**
 * Kiểm tra xem có đang ở môi trường production không
 */
export const isProduction = import.meta.env.PROD;
