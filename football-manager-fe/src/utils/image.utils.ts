import { API_CONFIG } from '../config/env';

/**
 * Utility functions for handling images
 */

/**
 * Chuyển đổi đường dẫn ảnh từ backend thành URL đầy đủ
 * 
 * @param path - Đường dẫn ảnh từ backend (có thể null, relative path, hoặc absolute URL)
 * @param fallback - URL ảnh mặc định nếu path không hợp lệ (mặc định: placeholder)
 * @returns URL đầy đủ của ảnh
 * 
 * @example
 * getImageUrl('/uploads/team/logo.png') // => 'http://localhost:8080/uploads/team/logo.png'
 * getImageUrl('https://example.com/image.jpg') // => 'https://example.com/image.jpg'
 * getImageUrl(null) // => 'https://placehold.co/40'
 */
export const getImageUrl = (path: string | null, fallback: string = 'https://placehold.co/40'): string => {
    // Nếu không có path, trả về fallback
    if (!path) {
        return fallback;
    }

    // Nếu đã là absolute URL (http/https), trả về nguyên bản
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Xử lý đường dẫn Windows (thay \ thành /)
    let cleanPath = path.replace(/\\/g, '/');
    
    // Đảm bảo bắt đầu bằng /
    if (!cleanPath.startsWith('/')) {
        cleanPath = '/' + cleanPath;
    }

    // Kết hợp với base URL
    return `${API_CONFIG.BASE_URL}${cleanPath}`;
};

/**
 * Kiểm tra xem một URL có hợp lệ không
 * 
 * @param url - URL cần kiểm tra
 * @returns true nếu URL hợp lệ, false nếu không
 */
export const isValidImageUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
