import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';

const API_URL = 'http://localhost:8080';

export const MatchConsolePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [match, setMatch] = useState<any>(null);
    const [homePlayers, setHomePlayers] = useState<any[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
    const [currentPlayers, setCurrentPlayers] = useState<any[]>([]); 
    
    // Form Sự kiện
    const [event, setEvent] = useState({ type: 'GOAL', teamId: '', playerId: '', minute: '' });
    const [loading, setLoading] = useState(false);

    // 1. Load dữ liệu khi vào trang
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Lấy chi tiết trận đấu
                const matchRes = await axiosClient.get(`/champions/match/${id}`);
                setMatch(matchRes.data);

                // Lấy danh sách cầu thủ 2 đội (Để chọn người ghi bàn)
                const homeRes = await axiosClient.get(`/champions/player/by-team/${matchRes.data.homeTeamId}`);
                setHomePlayers(homeRes.data);

                const awayRes = await axiosClient.get(`/champions/player/by-team/${matchRes.data.awayTeamId}`);
                setAwayPlayers(awayRes.data);

            } catch (error) {
                console.error(error);
                alert("Lỗi tải dữ liệu trận đấu!");
                navigate('/admin/matches');
            }
        };
        fetchData();
    }, [id]);

    // 2. Bắt đầu trận đấu (Nếu chưa bắt đầu)
    const handleStartMatch = async () => {
        if(!confirm("Bắt đầu trận đấu? Trạng thái sẽ chuyển sang LIVE.")) return;
        try {
            await axiosClient.post(`/champions/match/${id}/start`);
            setMatch({...match, status: 'IN_PROGRESS'}); // Update UI
            alert("Trận đấu đã bắt đầu! ⚽");
        } catch (e) { 
            
            console.error(e);
            alert("Lỗi bắt đầu trận đấu (Có thể đã bắt đầu rồi)."); }
    };

    // 3. Xử lý gửi sự kiện (Bàn thắng / Thẻ)
    const handleEventSubmit = async () => {
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
            
            // Nếu là bàn thắng -> Cập nhật tỉ số trên màn hình ngay lập tức
            if (event.type === 'GOAL') {
                if (Number(event.teamId) === match.homeTeamId) {
                    setMatch({ ...match, homeScore: match.homeScore + 1 });
                } else {
                    setMatch({ ...match, awayScore: match.awayScore + 1 });
                }
            }
            
            setEvent({...event, minute: ''}); // Reset phút
        } catch (e) { 
            console.error(e);
            alert("❌ Lỗi hệ thống!"); 
        } finally {
            setLoading(false);
        }
    };

    // 4. Kết thúc trận đấu
    const finishMatch = async () => {
        if(!confirm("⚠️ XÁC NHẬN KẾT THÚC TRẬN ĐẤU?\nBXH sẽ được cập nhật và không thể thay đổi tỉ số nữa.")) return;
        try {
            await axiosClient.post(`/champions/match/${id}/finish`);
            alert("🏁 Trận đấu đã kết thúc!");
            navigate('/admin/matches'); // Quay về danh sách
        } catch (e) { 
            
            console.error(e);
            alert("Lỗi kết thúc trận đấu!"); }
    };

    // Chọn đội để hiển thị cầu thủ tương ứng
    const handleSelectTeam = (teamId: number, isHome: boolean) => {
        setEvent({ ...event, teamId: teamId.toString(), playerId: '' });
        setCurrentPlayers(isHome ? homePlayers : awayPlayers);
    };

    if (!match) return <div className="text-center p-10">Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 animate-fade-in-up">
             <button onClick={() => navigate('/admin/matches')} className="mb-4 bg-white border px-4 py-2 rounded shadow-sm hover:bg-gray-100">← Quay lại danh sách</button>
             
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header Tỉ số */}
                <div className="bg-slate-900 text-white p-6 text-center">
                    <div className="flex justify-between items-center mb-4">
                        <span className="bg-slate-700 px-3 py-1 rounded text-xs">Vòng: {match.roundName}</span>
                        {match.status === 'SCHEDULED' && <button onClick={handleStartMatch} className="bg-green-600 hover:bg-green-500 px-4 py-1 rounded font-bold animate-pulse">▶ BẮT ĐẦU TRẬN ĐẤU</button>}
                        {match.status === 'IN_PROGRESS' && <span className="bg-red-600 px-3 py-1 rounded font-bold animate-pulse">● LIVE</span>}
                        {match.status === 'FINISHED' && <span className="bg-gray-600 px-3 py-1 rounded font-bold">FINISHED</span>}
                    </div>

                    <div className="flex justify-center items-center gap-4 md:gap-12 text-3xl font-black text-yellow-400">
                        <div className="text-center w-1/3">
                            <div className="text-white text-lg md:text-2xl font-bold mb-2">{match.homeTeam}</div>
                            <div className="text-5xl md:text-7xl">{match.homeScore}</div>
                        </div>
                        <span className="text-gray-500 text-xl">-</span>
                        <div className="text-center w-1/3">
                            <div className="text-white text-lg md:text-2xl font-bold mb-2">{match.awayTeam}</div>
                            <div className="text-5xl md:text-7xl">{match.awayScore}</div>
                        </div>
                    </div>
                </div>
                
                {/* Form Điều khiển */}
                <div className="p-6 md:p-8 grid gap-8 pointer-events-auto">
                    {/* Chỉ cho phép nhập liệu khi trận đang diễn ra */}
                    {match.status !== 'IN_PROGRESS' && match.status !== 'FINISHED' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                            Vui lòng bấm nút <b>"BẮT ĐẦU TRẬN ĐẤU"</b> ở trên để mở khóa chức năng ghi sự kiện.
                        </div>
                    )}

                    {match.status === 'IN_PROGRESS' && (
                        <>
                            {/* 1. Loại Sự Kiện */}
                            <div>
                                <label className="block font-bold text-sm text-gray-400 mb-2 uppercase">1. Chọn Sự Kiện</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['GOAL', 'YELLOW_CARD', 'RED_CARD'].map((type) => (
                                        <button key={type} onClick={() => setEvent({...event, type})}
                                            className={`py-3 rounded-xl font-bold border-2 transition ${event.type === type 
                                                ? (type === 'GOAL' ? 'border-green-500 bg-green-50 text-green-700' : type === 'YELLOW_CARD' ? 'border-yellow-400 bg-yellow-50 text-yellow-700' : 'border-red-500 bg-red-50 text-red-700')
                                                : 'border-gray-100 hover:bg-gray-50'}`}>
                                            {type === 'GOAL' ? '⚽ BÀN THẮNG' : type === 'YELLOW_CARD' ? '🟨 THẺ VÀNG' : '🟥 THẺ ĐỎ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Đội Bóng */}
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleSelectTeam(match.homeTeamId, true)}
                                    className={`p-4 rounded-xl border-2 font-bold text-lg transition ${Number(event.teamId) === match.homeTeamId ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    {match.homeTeam}
                                </button>
                                <button onClick={() => handleSelectTeam(match.awayTeamId, false)}
                                    className={`p-4 rounded-xl border-2 font-bold text-lg transition ${Number(event.teamId) === match.awayTeamId ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    {match.awayTeam}
                                </button>
                            </div>

                            {/* 3. Cầu thủ & Phút */}
                            <div className="flex gap-4">
                                <select className="w-2/3 border-2 border-gray-200 p-3 rounded-xl font-bold outline-none focus:border-blue-500"
                                    value={event.playerId} onChange={e => setEvent({...event, playerId: e.target.value})} disabled={!event.teamId}>
                                    <option value="">-- Chọn cầu thủ --</option>
                                    {currentPlayers.map(p => <option key={p.id} value={p.id}>(#{p.shirtNumber}) {p.name}</option>)}
                                </select>
                                <input type="number" className="w-1/3 border-2 border-gray-200 p-3 rounded-xl font-bold text-center outline-none focus:border-blue-500"
                                    placeholder="Phút..." value={event.minute} onChange={e => setEvent({...event, minute: e.target.value})} />
                            </div>
                            
                            <button onClick={handleEventSubmit} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg mt-2">
                                ✅ XÁC NHẬN
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200 text-center">
                    {match.status === 'IN_PROGRESS' ? (
                        <button onClick={finishMatch} className="text-red-600 font-bold hover:bg-red-100 px-6 py-2 rounded-lg border border-red-200 transition">
                            🏁 KẾT THÚC TRẬN ĐẤU
                        </button>
                    ) : match.status === 'FINISHED' ? (
                        <span className="text-green-600 font-bold">Trận đấu đã kết thúc.</span>
                    ) : null}
                </div>
            </div>
        </div>
    );
};