import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { useAuth } from '../../core/context/useAuth';

const API_URL = 'http://localhost:8080';

export const CoachSquadPage = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy teamId từ user (Coach)
    const myTeamId = (user as any)?.teamId;

    useEffect(() => {
        if (myTeamId) {
            axiosClient.get(`/champions/player/by-team/${myTeamId}`)
                .then(res => setPlayers(res.data))
                .catch(err => console.error("Lỗi tải cầu thủ:", err))
                .finally(() => setLoading(false));
        }
    }, [myTeamId]);

    if (!myTeamId) return <div className="p-10 text-center">Chưa liên kết đội bóng.</div>;

    return (
        <div className="animate-fade-in-up pb-20">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
                <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-200">
                    <span className="text-2xl">🏃</span>
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Danh Sách Cầu Thủ
                    </h1>
                    <p className="text-gray-500 font-medium">Quản lý thành viên đội bóng.</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Đang tải danh sách...</div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed text-gray-400">
                    Đội bóng chưa có cầu thủ nào.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map(p => (
                        <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                            {/* Avatar */}
                            <div className="w-20 h-20 rounded-full border-2 border-emerald-100 p-1 shrink-0">
                                <img 
                                    src={p.avatar ? `${API_URL}${p.avatar}` : 'https://placehold.co/100?text=Player'} 
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            
                            {/* Thông tin */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                                    <span className="text-lg font-black text-emerald-600">#{p.shirtNumber}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{p.nationality || 'Quốc tịch chưa cập nhật'}</p>
                                
                                <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase
                                    ${p.position === 'GK' ? 'bg-yellow-100 text-yellow-700' : 
                                      p.position === 'FW' ? 'bg-red-100 text-red-700' : 
                                      p.position === 'MF' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                    {p.position}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};