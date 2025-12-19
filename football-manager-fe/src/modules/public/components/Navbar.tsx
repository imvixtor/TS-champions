import { Link } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';

export const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-700">
            <div className="container mx-auto px-4 py-3">
                {/* flex-col cho điện thoại (xếp dọc), md:flex-row cho máy tính (xếp ngang) */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    
                    {/* LOGO */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-2 rounded-lg transform group-hover:rotate-12 transition duration-300 shadow-blue-500/50 shadow-lg">
                            ⚽
                        </div>
                        <span className="text-xl font-bold tracking-wider group-hover:text-blue-400 transition">
                            FOOTBALL MANAGER
                        </span>
                    </Link>

                    {/* MENU */}
                    <div className="flex items-center gap-6 text-sm font-semibold tracking-wide bg-slate-800 md:bg-transparent px-6 py-2 rounded-full md:px-0 md:py-0">
                        <Link to="/" className="hover:text-blue-400 transition relative group">
                            LỊCH THI ĐẤU
                        </Link>
                        <div className="w-px h-4 bg-gray-600"></div> {/* Đường kẻ dọc ngăn cách */}
                        <Link to="/standings" className="hover:text-blue-400 transition relative group">
                            BẢNG XẾP HẠNG
                        </Link>
                    </div>

                    {/* USER / LOGIN */}
                    <div className="w-full md:w-auto flex justify-center">
                        {user ? (
                            <div className="flex items-center gap-3 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-600">
                                <span className="text-yellow-400 font-bold text-sm">Hi, {user.username}</span>
                                <button onClick={logout} className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition">
                                    Thoát
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-900/50 transition transform active:scale-95 text-sm w-full md:w-auto text-center">
                                Đăng Nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};