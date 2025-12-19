import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';

const API_URL = 'http://localhost:8080';

export const MatchConsole = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Dữ liệu trận đấu và cầu thủ
    const [match, setMatch] = useState<any>(null);
    const [homePlayers, setHomePlayers] = useState<any[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
    const [currentPlayers, setCurrentPlayers] = useState<any[]>([]); // List cầu thủ đang hiển thị

    // State Form sự kiện
    const [event, setEvent] = useState({ 
        type: 'GOAL', 
        teamId: '', // Sẽ tự điền khi chọn đội
        playerId: '', 
        minute: '' 
    });
    
    const [loading, setLoading] = useState(false);

    // 1. Tải thông tin trận đấu & Cầu thủ 2 đội
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy chi tiết trận đấu (Để biết ID 2 đội)
                // Lưu ý: Bạn cần đảm bảo Backend có API /champions/match/{id} hoặc dùng API public tương tự
                const matchRes = await axiosClient.get(`/champions/match/${id}`); // Hoặc /champions/public/match/${id}
                const m = matchRes.data;
                setMatch(m);

                // Lấy cầu thủ Đội Nhà
                const homeRes = await axiosClient.get(`/champions/player/by-team/${m.homeTeamId}`);
                setHomePlayers(homeRes.data);

                // Lấy cầu thủ Đội Khách
                const awayRes = await axiosClient.get(`/champions/player/by-team/${m.awayTeamId}`);
                setAwayPlayers(awayRes.data);

            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
                alert("Không thể tải thông tin trận đấu!");
            }
        };
        fetchData();
    }, [id]);

    // Xử lý khi chọn đội
    const handleSelectTeam = (teamId: number, isHome: boolean) => {
        setEvent({ ...event, teamId: teamId.toString(), playerId: '' }); // Reset cầu thủ khi đổi đội
        setCurrentPlayers(isHome ? homePlayers : awayPlayers);
    };

    const handleEvent = async () => {
        if(!event.teamId || !event.playerId || !event.minute) return alert("Vui lòng nhập đủ thông tin!");
        setLoading(true);
        try {
            await axiosClient.post('/champions/match/events', { 
                matchId: id,
                type: event.type,
                teamId: Number(event.teamId),
                playerId: Number(event.playerId),
                minute: Number(event.minute)
            });
            alert("✅ Đã ghi nhận sự kiện!");
            setEvent({...event, minute: ''}); // Giữ nguyên đội/cầu thủ, chỉ xóa phút để nhập tiếp cho nhanh
        } catch (e) { 
            console.error(e);
            alert("❌ Lỗi hệ thống!"); 
        } finally {
            setLoading(false);
        }
    };

    const finishMatch = async () => {
        if(!confirm("⚠️ KẾT THÚC TRẬN ĐẤU? Hành động này không thể hoàn tác.")) return;
        try {
            await axiosClient.post(`/champions/match/${id}/finish`);
            alert("Trận đấu đã kết thúc!");
            navigate('/admin/matches');
        } catch (e) { 
            console.error(e);
            alert("Lỗi!"); }
    };

    if (!match) return <div className="text-center p-10">Đang tải thông tin trận đấu...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
             <button onClick={() => navigate('/admin/matches')} className="mb-4 text-gray-500 hover:text-black">← Quay lại</button>
             
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Trận Đấu */}
                <div className="bg-slate-900 text-white p-6 text-center">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-2">Điều Khiển Trận Đấu</h1>
                    <div className="flex justify-center items-center gap-8 text-2xl font-black text-yellow-400">
                        <span>{match.homeTeam}</span>
                        <span className="text-white text-sm bg-slate-700 px-2 py-1 rounded">VS</span>
                        <span>{match.awayTeam}</span>
                    </div>
                </div>
                
                <div className="p-6 md:p-8 grid gap-8">
                    
                    {/* 1. CHỌN LOẠI SỰ KIỆN */}
                    <div>
                        <label className="block font-bold text-sm text-gray-400 mb-2 uppercase">1. Chọn Sự Kiện</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['GOAL', 'YELLOW_CARD', 'RED_CARD'].map((type) => (
                                <button key={type} onClick={() => setEvent({...event, type})}
                                    className={`py-4 rounded-xl font-bold transition border-2 flex flex-col items-center gap-1
                                        ${event.type === type 
                                            ? (type === 'GOAL' ? 'border-green-500 bg-green-50 text-green-700' : type === 'YELLOW_CARD' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-red-500 bg-red-50 text-red-700')
                                            : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-white hover:border-gray-300'}`}>
                                    <span className="text-2xl">{type === 'GOAL' ? '⚽' : type === 'YELLOW_CARD' ? '🟨' : '🟥'}</span>
                                    <span className="text-xs">{type === 'GOAL' ? 'BÀN THẮNG' : type === 'YELLOW_CARD' ? 'THẺ VÀNG' : 'THẺ ĐỎ'}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. CHỌN ĐỘI BÓNG (Nút bấm to) */}
                    <div>
                        <label className="block font-bold text-sm text-gray-400 mb-2 uppercase">2. Đội nào ghi nhận?</label>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Nút Đội Nhà */}
                            <button 
                                onClick={() => handleSelectTeam(match.homeTeamId, true)}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition
                                    ${Number(event.teamId) === match.homeTeamId 
                                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-200' 
                                        : 'border-gray-200 hover:border-blue-300'}`}>
                                <img src={match.homeLogo ? `${API_URL}${match.homeLogo}` : 'https://placehold.co/40'} className="w-10 h-10 object-contain"/>
                                <span className="font-bold text-lg">{match.homeTeam}</span>
                            </button>

                            {/* Nút Đội Khách */}
                            <button 
                                onClick={() => handleSelectTeam(match.awayTeamId, false)}
                                className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition
                                    ${Number(event.teamId) === match.awayTeamId 
                                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-200' 
                                        : 'border-gray-200 hover:border-blue-300'}`}>
                                <img src={match.awayLogo ? `${API_URL}${match.awayLogo}` : 'https://placehold.co/40'} className="w-10 h-10 object-contain"/>
                                <span className="font-bold text-lg">{match.awayTeam}</span>
                            </button>
                        </div>
                    </div>

                    {/* 3. CHỌN CẦU THỦ & PHÚT (Chung 1 dòng) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <label className="block font-bold text-sm text-gray-400 mb-2 uppercase">3. Cầu thủ</label>
                            <select 
                                className="w-full border-2 border-gray-200 p-4 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 disabled:bg-gray-100"
                                value={event.playerId}
                                onChange={e => setEvent({...event, playerId: e.target.value})}
                                disabled={!event.teamId} // Khóa nếu chưa chọn đội
                            >
                                <option value="">
                                    {!event.teamId ? "-- Vui lòng chọn đội trước --" : "-- Chọn cầu thủ --"}
                                </option>
                                {currentPlayers.map(p => (
                                    <option key={p.id} value={p.id}>
                                        (#{p.shirtNumber}) {p.name} - {p.position}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block font-bold text-sm text-gray-400 mb-2 uppercase">4. Phút thứ</label>
                            <input type="number" 
                                className="w-full border-2 border-gray-200 p-4 rounded-xl font-bold text-center outline-none focus:border-blue-500" 
                                placeholder="VD: 45"
                                value={event.minute}
                                onChange={e => setEvent({...event, minute: e.target.value})} />
                        </div>
                    </div>
                    
                    {/* NÚT XÁC NHẬN */}
                    <button 
                        onClick={handleEvent} 
                        disabled={loading || !event.teamId || !event.playerId || !event.minute}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-500/30 text-lg mt-2 disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none">
                        {loading ? 'Đang xử lý...' : '✅ XÁC NHẬN SỰ KIỆN'}
                    </button>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200 text-center">
                    <button onClick={finishMatch} className="text-red-600 font-bold hover:bg-red-100 px-6 py-2 rounded-lg transition border border-red-200">
                        🏁 KẾT THÚC TRẬN ĐẤU
                    </button>
                </div>
            </div>
        </div>
    );
};