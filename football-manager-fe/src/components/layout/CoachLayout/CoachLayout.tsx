import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

export const CoachLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            
            {/* --- SIDEBAR (THANH BÊN) --- */}
            <aside className="w-64 bg-emerald-900 text-white hidden md:flex flex-col shadow-2xl z-20">
                {/* Header Sidebar */}
                <div className="p-6 border-b border-emerald-800 text-center">
                    <h2 className="text-2xl font-black tracking-widest text-emerald-400">COACH ZONE</h2>
                    <p className="text-[10px] text-emerald-200 mt-1 opacity-70">TACTICAL CENTER</p>
                </div>

                {/* User Info */}
                <div className="p-6 text-center border-b border-emerald-800/50">
                    <div className="w-16 h-16 bg-white/10 rounded-full mx-auto flex items-center justify-center text-3xl mb-3 border-2 border-emerald-500">
                        👔
                    </div>
                    <p className="font-bold text-sm">HLV. {user?.username}</p>
                    <p className="text-xs text-emerald-300 mt-1">Đội bóng của bạn</p>
                </div>

                {/* Menu Links */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2 px-2">Quản lý</p>
                    
                    <Link to="/coach/matches" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-800 hover:shadow-lg group">
                        <span className="text-xl group-hover:scale-110 transition">📅</span>
                        <span className="font-bold text-sm text-emerald-100 group-hover:text-white">Lịch Thi Đấu</span>
                    </Link>

                    {/* Placeholder cho tính năng tương lai */}
                    <Link to="/coach/squad" className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-800 hover:shadow-lg group">
                        <span className="text-xl group-hover:scale-110 transition">🏃</span>
                        <span className="font-bold text-sm text-emerald-100 group-hover:text-white">Đội Hình</span>
                    </Link>
                    
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-emerald-800/50 opacity-50 cursor-not-allowed group">
                        <span className="text-xl">📊</span>
                        <span className="font-bold text-sm text-emerald-100">Thống Kê (Sắp có)</span>
                    </button>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-emerald-800">
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/90 hover:bg-red-600 text-white rounded-xl font-bold transition shadow-lg shadow-red-900/20"
                    >
                        <span>🚪</span> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT (NỘI DUNG CHÍNH) --- */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                
                {/* Mobile Header (Chỉ hiện trên điện thoại) */}
                <header className="md:hidden bg-emerald-900 text-white p-4 flex justify-between items-center shadow-md z-30">
                    <div className="font-bold flex items-center gap-2">
                        <span>👔</span> HLV. {user?.username}
                    </div>
                    <button onClick={handleLogout} className="text-xs bg-red-600 px-3 py-1.5 rounded font-bold shadow">
                        Thoát
                    </button>
                </header>

                {/* Vùng hiển thị nội dung trang con (Outlet) */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 scroll-smooth">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
