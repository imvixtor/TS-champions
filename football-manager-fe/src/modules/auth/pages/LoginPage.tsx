import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../../services/auth.service';
import { useAuth } from '../../../hooks/useAuth';

// Interface cho Token đã giải mã
interface DecodedToken {
    sub: string;    // Username
    role: string;   // Role (ADMIN, COACH, USER)
    teamId?: number; // TeamID (Backend gửi lên)
    exp: number;
}

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Gọi API đăng nhập
            const res = await authService.login({ username, password });
            const token = res.jwtToken; 

            if (!token) throw new Error("Không nhận được token từ server!");

            // 2. Giải mã Token để lấy thông tin (Role, TeamID)
            const decoded: DecodedToken = jwtDecode(token);
            
            console.log("Login Success - Decoded Token:", decoded);

            // 3. Lưu thông tin vào Context & LocalStorage
            // Backend trả về 'sub' là username, ta map sang field username của User
            login(token, {
                username: decoded.sub,
                role: decoded.role,
                teamId: decoded.teamId // 👈 Quan trọng: Truyền teamId vào AuthProvider
            });

            // 4. Điều hướng dựa theo quyền
            if (decoded.role === 'ADMIN') {
                navigate('/admin/matches');
            } else if (decoded.role === 'COACH') {
                navigate('/coach/matches');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            console.error("Login Error:", err);
            
            // Xử lý thông báo lỗi chi tiết
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Lỗi 403: Tài khoản hoặc mật khẩu không đúng!');
                } else if (err.response.status === 401) {
                    setError('Sai tài khoản hoặc mật khẩu!');
                } else {
                    setError(err.response.data?.message || 'Có lỗi xảy ra từ server.');
                }
            } else {
                setError('Không thể kết nối đến server.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-900 uppercase tracking-tight">Football Manager</h2>
                    <p className="text-gray-500 mt-2 font-medium">Đăng nhập hệ thống quản lý</p>
                </div>

                {/* Hiển thị lỗi màu đỏ nếu có */}
                {error && (
                    <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg mb-6 text-sm font-bold text-center flex items-center justify-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">Tài khoản</label>
                        <input 
                            type="text" 
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-600 focus:outline-none transition font-medium text-slate-700"
                            placeholder="Nhập username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase">Mật khẩu</label>
                        <input 
                            type="password" 
                            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-600 focus:outline-none transition font-medium text-slate-700"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        disabled={loading}
                        className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200 mt-4"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Đang xử lý...
                            </span>
                        ) : 'ĐĂNG NHẬP'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    © 2024 Football Champions League
                </div>
            </div>
        </div>
    );
};