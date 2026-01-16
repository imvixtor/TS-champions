import type { ReactElement } from 'react';

// Common types used across the application

// Generic API Response wrapper (if needed in the future)
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

// Route protection props
export interface ProtectedRouteProps {
    children: ReactElement;
    role: string;
}
