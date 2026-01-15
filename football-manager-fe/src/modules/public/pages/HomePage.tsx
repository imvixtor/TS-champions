import { useEffect, useState } from 'react';
import { publicService } from '../../../services/public.service';
import { Navbar } from '../../../components/common/Navbar';
import { MatchCard, MatchDetailModal } from '../../../components/features/match';

// Helper: Lấy ngày hôm nay định dạng YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

export const HomePage = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]); // List giải đấu để chọn
    const [loading, setLoading] = useState(false);

    // --- STATE CHO FILTER ---
    const [filterDate, setFilterDate] = useState(getTodayString()); // Mặc định là hôm nay
    const [filterTourId, setFilterTourId] = useState<number | ''>(''); // Mặc định chọn tất cả
    
    // State Modal
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

    // 1. Load danh sách giải đấu (cho Dropdown)
    useEffect(() => {
        publicService.getTournaments()
            .then(data => setTournaments(data))
            .catch(e => console.error(e));
    }, []);

    // 2. Load danh sách trận đấu khi Filter thay đổi
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const data = await publicService.searchMatches({
                    date: filterDate,
                    tournamentId: filterTourId || null
                });
                setMatches(data);
            } catch (err) {
                console.error("Lỗi tải lịch:", err);
                setMatches([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [filterDate, filterTourId]); // Chạy lại khi Date hoặc TourId thay đổi

    return (
        <div className="min-h-screen bg-gray-50 pb-10 font-sans">
            <Navbar />
            
            <main className="container mx-auto max-w-4xl px-4 py-8 animate-fade-in-up">
                
                {/* --- HEADER & FILTER BAR --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-2xl font-black uppercase text-slate-800 mb-4 flex items-center gap-2">
                        📅 Lịch Thi Đấu
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* 1. Chọn Giải Đấu */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Giải đấu</label>
                            <select 
                                className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-slate-700 outline-none focus:border-blue-600 transition"
                                value={filterTourId}
                                onChange={e => setFilterTourId(e.target.value ? Number(e.target.value) : '')}
                            >
                                <option value="">🏆 Tất cả giải đấu</option>
                                {tournaments.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.season})</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Chọn Ngày */}
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Ngày thi đấu</label>
                            <input 
                                type="date" 
                                className="w-full border-2 border-gray-200 rounded-xl p-2.5 font-bold text-slate-700 outline-none focus:border-blue-600 transition"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                            />
                        </div>

                        {/* 3. Nút "Hôm nay" nhanh */}
                        <div className="flex items-end">
                            <button 
                                onClick={() => setFilterDate(getTodayString())}
                                className="h-[46px] px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 transition shadow-lg shadow-slate-300"
                            >
                                Hôm nay
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- KẾT QUẢ TÌM KIẾM --- */}
                {loading ? (
                    <div className="text-center py-20 text-gray-500 font-bold animate-pulse flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                        Đang tìm trận đấu...
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                        <span className="text-4xl block mb-2">😴</span>
                        <p>Không có trận đấu nào vào ngày <b>{new Date(filterDate).toLocaleDateString('vi-VN')}</b></p>
                        {filterTourId && <p className="text-sm">(Thuộc giải đấu bạn chọn)</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2 mb-2">
                            <span className="font-bold text-slate-500 text-sm">Tìm thấy {matches.length} trận đấu</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                                {new Date(filterDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                            </span>
                        </div>

                        {matches.map(match => (
                            <div 
                                key={match.id} 
                                onClick={() => setSelectedMatchId(match.id)}
                                className="cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <MatchCard match={match} />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Chi Tiết */}
            {selectedMatchId && (
                <MatchDetailModal 
                    matchId={selectedMatchId} 
                    onClose={() => setSelectedMatchId(null)} 
                />
            )}
        </div>
    );
};