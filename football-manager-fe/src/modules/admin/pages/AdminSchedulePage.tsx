import { useEffect, useState, useMemo } from 'react';
import { publicService, teamService, matchService } from '../../../services';

// Helper: Xử lý ảnh (để hiển thị Logo)
const API_URL = 'http://localhost:8080';
const getImageUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/60?text=NoLogo';
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${API_URL}${cleanPath}`;
};

export const AdminSchedulePage = () => {
    // Data List
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    
    // Form State
    const [tournamentId, setTournamentId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [stadium, setStadium] = useState('');
    const [roundName, setRoundName] = useState('Vòng 1');
    const [loading, setLoading] = useState(false);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tourData, teamData] = await Promise.all([
                    publicService.getTournaments(),
                    teamService.getAllTeams()
                ]);
                setTournaments(tourData);
                setTeams(teamData);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    // LOGIC THÔNG MINH 1: Tự động điền sân vận động khi chọn Đội Nhà
    useEffect(() => {
        if (homeTeamId) {
            const homeTeam = teams.find(t => t.id === Number(homeTeamId));
            // Chỉ tự điền nếu ô Stadium đang trống hoặc đang chứa sân của đội nhà cũ
            if (homeTeam) setStadium(homeTeam.stadium);
        }
    }, [homeTeamId]); // Bỏ teams ra khỏi dependency để tránh re-render thừa

    // LOGIC THÔNG MINH 2: Tìm object đội bóng để hiển thị Preview
    const selectedHomeTeam = useMemo(() => teams.find(t => t.id === Number(homeTeamId)), [homeTeamId, teams]);
    const selectedAwayTeam = useMemo(() => teams.find(t => t.id === Number(awayTeamId)), [awayTeamId, teams]);
    const selectedTournament = useMemo(() => tournaments.find(t => t.id === Number(tournamentId)), [tournamentId, tournaments]);

    // LOGIC THÔNG MINH 3: Hoán đổi Đội Nhà <-> Đội Khách
    const handleSwapTeams = () => {
        if (!homeTeamId && !awayTeamId) return;
        const temp = homeTeamId;
        setHomeTeamId(awayTeamId);
        setAwayTeamId(temp);
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation: Ngày đá không được trong quá khứ
        if (new Date(matchDate) < new Date()) {
            return alert("⚠️ Ngày thi đấu không thể ở trong quá khứ!");
        }

        if (homeTeamId === awayTeamId) return alert("❌ Đội nhà và Đội khách không được trùng nhau!");
        
        setLoading(true);
        try {
            const payload = {
                tournamentId: Number(tournamentId),
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
                matchDate, 
                stadium,
                roundName
            };

            await matchService.createMatch(payload);
            alert("✅ Lên lịch trận đấu thành công!");
            
            // Reset form thông minh (Giữ lại giải đấu và vòng để nhập tiếp cho nhanh)
            setHomeTeamId('');
            setAwayTeamId('');
            // setTournamentId(''); // Không reset giải đấu
            // setRoundName('');    // Không reset vòng đấu
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi lên lịch! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 animate-fade-in-up">
            
            {/* CỘT TRÁI: FORM NHẬP LIỆU */}
            <div className="lg:col-span-7 xl:col-span-8">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-xl font-black text-slate-800 uppercase flex items-center gap-2">
                            📅 Thiết lập trận đấu
                        </h2>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">Admin Mode</span>
                    </div>
                    
                    <form onSubmit={handleSchedule} className="space-y-6">
                        
                        {/* 1. Giải Đấu & Vòng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giải Đấu</label>
                                <select className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition outline-none font-bold text-slate-700" required
                                    value={tournamentId} onChange={e => setTournamentId(e.target.value)}>
                                    <option value="">-- Chọn giải đấu --</option>
                                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.season})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên Vòng Đấu</label>
                                <input className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 transition outline-none font-bold" 
                                    value={roundName} onChange={e => setRoundName(e.target.value)} placeholder="VD: Vòng 1, Chung kết" />
                            </div>
                        </div>

                        {/* 2. Chọn Đội (Khu vực thông minh) */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                            {/* Nút Swap nằm giữa */}
                            <button type="button" onClick={handleSwapTeams} 
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border shadow-sm rounded-full flex items-center justify-center hover:rotate-180 transition duration-300 z-10 text-blue-600"
                                title="Hoán đổi đội nhà/khách">
                                ⇄
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Đội Nhà */}
                                <div>
                                    <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span> Đội Nhà (Home)
                                    </label>
                                    <select className="w-full border p-3 rounded-xl focus:border-blue-500 outline-none shadow-sm" required
                                        value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}>
                                        <option value="">-- Chọn đội nhà --</option>
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                {/* Đội Khách */}
                                <div>
                                    <label className="block text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Đội Khách (Away)
                                    </label>
                                    <select className="w-full border p-3 rounded-xl focus:border-red-500 outline-none shadow-sm" required
                                        value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}>
                                        <option value="">-- Chọn đội khách --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id} disabled={t.id === Number(homeTeamId)}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Thời gian & Sân */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ngày giờ thi đấu</label>
                                <input type="datetime-local" className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none font-mono text-sm" required
                                    value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sân vận động</label>
                                <input className="w-full border-2 border-gray-100 p-3 rounded-xl focus:border-blue-500 outline-none font-bold text-slate-700" required
                                    value={stadium} onChange={e => setStadium(e.target.value)} placeholder="Tự động điền theo đội nhà..." />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.01] transition duration-200 text-lg flex items-center justify-center gap-2">
                            {loading ? (
                                <>⏳ Đang xử lý...</>
                            ) : (
                                <>✅ LƯU LỊCH THI ĐẤU</>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* CỘT PHẢI: LIVE PREVIEW (XEM TRƯỚC) */}
            <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Xem trước hiển thị</h3>
                    
                    {/* THẺ TRẬN ĐẤU (PREVIEW CARD) */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 relative">
                        {/* Header của thẻ */}
                        <div className="bg-slate-900 text-white p-4 text-center">
                            <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-1">
                                {selectedTournament ? selectedTournament.name : 'Chưa chọn giải'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">
                                {roundName}
                            </div>
                        </div>

                        {/* Nội dung chính: Đội bóng */}
                        <div className="p-8 flex items-center justify-between relative">
                            {/* Background mờ */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-50 opacity-50"></div>
                            
                            {/* Đội Nhà */}
                            <div className="relative z-10 flex flex-col items-center w-1/3 text-center">
                                <div className="w-16 h-16 bg-white rounded-full p-2 shadow-md mb-2 flex items-center justify-center border border-gray-100">
                                    <img src={getImageUrl(selectedHomeTeam?.logoUrl || null)} className="w-full h-full object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/40'} />
                                </div>
                                <div className="font-bold text-slate-800 text-sm leading-tight">
                                    {selectedHomeTeam ? selectedHomeTeam.name : 'Home Team'}
                                </div>
                            </div>

                            {/* VS */}
                            <div className="relative z-10 flex flex-col items-center w-1/3">
                                <div className="text-2xl font-black text-gray-200">VS</div>
                                {matchDate && (
                                    <div className="mt-2 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                        {new Date(matchDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                )}
                            </div>

                            {/* Đội Khách */}
                            <div className="relative z-10 flex flex-col items-center w-1/3 text-center">
                                <div className="w-16 h-16 bg-white rounded-full p-2 shadow-md mb-2 flex items-center justify-center border border-gray-100">
                                    <img src={getImageUrl(selectedAwayTeam?.logoUrl || null)} className="w-full h-full object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/40'} />
                                </div>
                                <div className="font-bold text-slate-800 text-sm leading-tight">
                                    {selectedAwayTeam ? selectedAwayTeam.name : 'Away Team'}
                                </div>
                            </div>
                        </div>

                        {/* Footer của thẻ: Thông tin ngày giờ */}
                        <div className="bg-gray-50 border-t border-gray-100 p-3 text-center">
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                                <div className="flex items-center gap-1">
                                    📅 {matchDate ? new Date(matchDate).toLocaleDateString('vi-VN') : '--/--/----'}
                                </div>
                                <div className="flex items-center gap-1">
                                    🏟️ {stadium || 'Chưa xác định sân'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hướng dẫn nhanh */}
                    <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-2">
                        <p className="font-bold flex items-center gap-2">💡 Mẹo quản trị viên:</p>
                        <ul className="list-disc pl-4 space-y-1 opacity-80">
                            <li>Chọn đội nhà trước, sân vận động sẽ tự điền.</li>
                            <li>Dùng nút ⇄ ở giữa để đổi sân nhà/khách nhanh.</li>
                            <li>Kiểm tra kỹ ngày giờ trước khi lưu.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};