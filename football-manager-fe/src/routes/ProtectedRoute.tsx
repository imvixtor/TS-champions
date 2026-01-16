import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import type { ProtectedRouteProps } from '../types';

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { user } = useAuth();
    
    // 1. Chưa đăng nhập -> Về trang Login
    if (!user) return <Navigate to="/login" replace />;
    
    // 2. Đã đăng nhập nhưng sai quyền
    if (user.role !== role && role !== 'ANY') {
        // Nếu là Coach cố vào Admin -> Về Coach Dashboard
        if (user.role === 'COACH') return <Navigate to="/coach/matches" replace />;
        // Nếu là Admin cố vào Coach -> Về Admin Dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/matches" replace />;
        
        return <Navigate to="/" replace />;
    }
    
    return children;
};
