import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks';

export const AdminLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full md:relative z-20 hidden md:flex">
                <div className="p-6 text-2xl font-bold tracking-wider border-b border-slate-800 text-center text-blue-400">
                    ADMIN
                </div>
                <div className="p-4 text-xs text-slate-400 uppercase font-bold text-center">
                    Xin chào, {user?.username}
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin/matches" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white font-medium">
                        <span>⚽</span> Quản lý Trận đấu
                    </Link>
                    <Link to="/admin/schedule" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white font-medium bg-blue-900/30 text-blue-200">
                        <span>📅</span> Lên Lịch Thi Đấu
                    </Link>

                <div className="border-t border-slate-700 my-2"></div> {/* Đường kẻ ngang */}
                
                    <Link to="/admin/tournaments" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white font-medium">
                        <span>🏆</span> Quản lý Giải đấu
                    </Link>
                    <Link to="/admin/teams" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white font-medium">
                        <span>👕</span> Quản lý Đội bóng
                    </Link>
                    <Link to="/admin/players" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg transition text-slate-300 hover:text-white font-medium">
                        <span>🏃</span> Quản lý Cầu thủ
                    </Link>
                    {/* Thêm các menu khác ở đây nếu cần */}
                </nav>
                <button onClick={() => {logout(); navigate('/login')}} className="m-4 p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg shadow-red-900/50">
                    Đăng xuất
                </button>
            </aside>

            {/* Mobile Header (Chỉ hiện trên điện thoại) */}
            <div className="md:hidden fixed w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center shadow-md">
                 <span className="font-bold">ADMIN PANEL</span>
                 <button onClick={() => {logout(); navigate('/login')}} className="text-xs bg-red-600 px-3 py-1 rounded">Thoát</button>
            </div>

            {/* Content Area */}
            <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
