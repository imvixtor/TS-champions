import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../../services';
import { useAuth } from '../../hooks';

export const CoachMatchList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Lấy teamId từ user
    const myTeamId = (user as any)?.teamId;

    // --- SỬA 1: Logic Loading thông minh hơn ---
    // Nếu chưa có teamId thì không cần loading làm gì cả
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!myTeamId); 

    useEffect(() => {
        // --- SỬA 2: Chỉ gọi API khi có teamId ---
        if (myTeamId) {
            setLoading(true);
            matchService.getMatchesByTeam(myTeamId)
                .then(data => setMatches(data))
                .catch(err => {
                    console.error(err);
                    // Có thể set error state ở đây nếu API lỗi
                })
                .finally(() => setLoading(false));
        }
    }, [myTeamId]);

    // --- SỬA 3: Xử lý lỗi "Không có Team" ngay tại đây (Early Return) ---
    // Không cần dùng useEffect để set errorMsg, cứ hiển thị luôn nếu thiếu ID
    if (!myTeamId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in">
                <div className="text-6xl mb-4">🚫</div>
                <h2 className="text-xl font-bold text-gray-700">Chưa liên kết Đội bóng</h2>
                <p className="text-gray-500 mt-2">
                    Tài khoản của bạn chưa được gán vào đội bóng nào.<br/>
                    Vui lòng liên hệ Admin để được cấp quyền.
                </p>
            </div>
        );
    }

    // --- Giao diện chính (Khi đã có TeamID) ---
    return (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in-up font-sans">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
                <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg shadow-blue-200">
                    <span className="text-2xl">📅</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Lịch Thi Đấu Đội Nhà
                    </h1>
                    <p className="text-gray-500 font-medium">Quản lý và đăng ký đội hình cho các trận đấu.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500 font-bold flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    ⏳ Đang tải dữ liệu...
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                    Chưa có trận đấu nào được lên lịch.
                </div>
            ) : (
                <div className="grid gap-6">
                    {matches.map(match => {
                        const isMyHome = match.homeTeamId === myTeamId;
                        return (
                            <div key={match.id} className="bg-white p-0 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition overflow-hidden group">
                                {/* Header Card */}
                                <div className="bg-slate-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <span>{new Date(match.matchDate).toLocaleDateString('vi-VN', {weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'})}</span>
                                    <span>{match.stadium || 'Sân chưa cập nhật'}</span>
                                </div>

                                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                    
                                    {/* Thông tin 2 đội */}
                                    <div className="flex-1 flex items-center justify-center gap-6 md:gap-12 w-full">
                                        <div className={`text-center flex flex-col items-center gap-2 ${isMyHome ? 'order-1' : 'order-3'}`}>
                                            <span className={`font-black text-xl md:text-2xl ${match.homeTeamId === myTeamId ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {match.homeTeam}
                                            </span>
                                            {match.homeTeamId === myTeamId && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">ĐỘI NHÀ</span>}
                                        </div>

                                        <div className="order-2 text-3xl font-light text-gray-300">VS</div>

                                        <div className={`text-center flex flex-col items-center gap-2 ${isMyHome ? 'order-3' : 'order-1'}`}>
                                            <span className={`font-black text-xl md:text-2xl ${match.awayTeamId === myTeamId ? 'text-blue-700' : 'text-slate-700'}`}>
                                                {match.awayTeam}
                                            </span>
                                            {match.awayTeamId === myTeamId && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">ĐỘI NHÀ</span>}
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="w-full md:w-auto flex justify-center">
                                        {match.status === 'SCHEDULED' ? (
                                            <button 
                                                onClick={() => navigate(`/coach/match/${match.id}/lineup?teamId=${myTeamId}`)}
                                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition transform shadow-blue-200 w-full md:w-auto flex items-center justify-center gap-2"
                                            >
                                                <span>👕</span> Đăng Ký Đội Hình
                                            </button>
                                        ) : (
                                            <div className={`px-6 py-2 rounded-full font-bold border ${match.status === 'FINISHED' ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-green-100 text-green-700 border-green-200 animate-pulse'}`}>
                                                {match.status === 'FINISHED' ? 'Đã Kết Thúc' : 'Đang Diễn Ra'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
