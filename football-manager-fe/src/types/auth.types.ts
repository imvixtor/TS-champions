// Auth related types
export interface User {
    username: string;
    role: string;
    teamId?: number;
}

export interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

export interface DecodedToken {
    sub: string;    // Username
    role: string;   // Role (ADMIN, COACH, USER)
    teamId?: number; // TeamID (Backend gửi lên)
    exp: number;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    jwtToken: string;
}

// User roles
export type UserRole = 'ADMIN' | 'COACH' | 'USER';
