import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { useAuth } from '../../core/context/useAuth';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    // --- KHẮC PHỤC LỖI REFERENCE ERROR TẠI ĐÂY ---
    const [error, setError] = useState(''); // Thêm dòng này
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axiosClient.post('/champions/auth/login', { username, password });
            
            console.log("Response:", res.data);

            const token = res.data.jwtToken; 

            if (!token) throw new Error("Không có token!");

            let role = 'USER';
            if (username === 'admin') role = 'ADMIN';
            else if (username === 'coach') role = 'COACH';

            login(token, { username, role });

            if (role === 'ADMIN') {
                alert('Xin chào Admin!');
                navigate('/admin/matches');
            } else if (role === 'COACH') {
                alert('Xin chào Coach!');
                navigate('/coach/matches');
            } else {
                navigate('/');
            }

        } catch (err: any) {
            console.error(err);
            // Hiển thị lỗi ra màn hình
            if (err.response && err.response.status === 403) {
                setError('Lỗi 403: Backend đang chặn API này. Hãy kiểm tra SecurityConfig.');
            } else {
                setError('Sai tài khoản hoặc mật khẩu!');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-blue-900">FOOTBALL MANAGER</h2>
                    <p className="text-gray-500 mt-2">Đăng nhập hệ thống</p>
                </div>

                {/* Hiển thị lỗi màu đỏ nếu có */}
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản</label>
                        <input 
                            type="text" 
                            className="w-full border p-3 rounded-lg"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input 
                            type="password" 
                            className="w-full border p-3 rounded-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                    </button>
                </form>
            </div>
        </div>
    );
};