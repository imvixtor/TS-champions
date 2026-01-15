import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';
import { useAuth } from '../../../hooks/useAuth';

const API_URL = 'http://localhost:8080';

export const CoachLineupPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // Lấy ID từ URL (VD: ?teamId=1)
    const teamId = searchParams.get('teamId') || (user as any)?.teamId;

    // --- STATE ---
    const [allPlayers, setAllPlayers] = useState<any[]>([]);
    
    // MỚI: Chế độ sân (7 hoặc 11)
    const [gameMode, setGameMode] = useState<7 | 11>(11); 

    const [starters, setStarters] = useState<any[]>([]);
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load cầu thủ
    useEffect(() => {
        if (teamId) {
            setLoading(true);
            axiosClient.get(`/champions/player/by-team/${teamId}`)
                .then(res => setAllPlayers(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [teamId]);

    // --- LOGIC DI CHUYỂN CẦU THỦ ---
    
    // 1. Chọn đá chính
    const moveToStarter = (player: any) => {
        // Kiểm tra giới hạn dựa trên GameMode
        if (starters.length >= gameMode) {
            alert(`⚠️ Đã đủ ${gameMode} cầu thủ đá chính cho sân ${gameMode}!`);
            return;
        }
        if (starters.find(p => p.id === player.id)) return;

        // Xóa khỏi danh sách dự bị (nếu có)
        setSubs(subs.filter(p => p.id !== player.id));
        // Thêm vào đá chính
        setStarters([...starters, player]);
    };

    // 2. Chọn dự bị
    const moveToSub = (player: any) => {
        if (subs.find(p => p.id === player.id)) return;
        
        // Xóa khỏi đá chính (nếu có)
        setStarters(starters.filter(p => p.id !== player.id));
        // Thêm vào dự bị
        setSubs([...subs, player]);
    };

    // 3. Hủy chọn (Về danh sách chờ)
    const removeFromSquad = (player: any) => {
        setStarters(starters.filter(p => p.id !== player.id));
        setSubs(subs.filter(p => p.id !== player.id));
    };

    // --- XỬ LÝ LƯU ---
    const handleSaveLineup = async () => {
        // MỚI: Validate linh hoạt theo GameMode
        if (starters.length !== gameMode) {
            alert(`❌ Vui lòng chọn đủ ${gameMode} cầu thủ đá chính (Hiện tại: ${starters.length})`);
            return;
        }

        if (subs.length === 0 && !confirm("Bạn chưa chọn cầu thủ dự bị nào. Tiếp tục?")) return;

        alert(`✅ Đã lưu đội hình (Sân ${gameMode}): ${starters.length} chính, ${subs.length} dự bị!`);
        // Gọi API lưu xuống database tại đây (nếu có API)
        // await axiosClient.post('/lineup/save', { matchId, starters, subs });
        navigate('/coach/matches');
    };

    // Lọc danh sách cầu thủ chưa được chọn
    const availablePlayers = allPlayers.filter(p => 
        !starters.find(s => s.id === p.id) && 
        !subs.find(s => s.id === p.id)
    );

    return (
        <div className="p-4 md:p-6 animate-fade-in-up pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase">📋 Đăng Ký Đội Hình</h1>
                    <p className="text-gray-500 text-sm">Kéo thả hoặc bấm để chọn cầu thủ</p>
                </div>
                
                {/* --- MỚI: BỘ CHUYỂN ĐỔI CHẾ ĐỘ SÂN --- */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => { setGameMode(7); if(starters.length > 7) alert("⚠️ Chú ý: Số cầu thủ đang vượt quá 7 người!"); }}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${gameMode === 7 ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sân 7
                    </button>
                    <button 
                        onClick={() => setGameMode(11)}
                        className={`px-6 py-2 rounded-md font-bold text-sm transition-all ${gameMode === 11 ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Sân 11
                    </button>
                </div>

                <button 
                    onClick={handleSaveLineup}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 transition"
                >
                    💾 Lưu Đội Hình
                </button>
            </div>

            {/* MAIN CONTENT - 3 CỘT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                
                {/* CỘT 1: DANH SÁCH CHỜ */}
                <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-3 bg-gray-50 border-b font-bold text-gray-500 flex justify-between">
                        <span>Danh sách cầu thủ</span>
                        <span className="bg-gray-200 text-gray-700 px-2 rounded text-xs py-0.5">{availablePlayers.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto flex-1 space-y-2">
                        {loading ? <div className="text-center py-4">Đang tải...</div> : availablePlayers.map(p => (
                            <div key={p.id} onClick={() => moveToStarter(p)} 
                                className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition group">
                                <img src={p.avatar ? `${API_URL}${p.avatar}` : 'https://placehold.co/40'} className="w-10 h-10 rounded-full object-cover"/>
                                <div>
                                    <div className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">{p.name}</div>
                                    <div className="text-xs text-gray-400">{p.position} • #{p.shirtNumber}</div>
                                </div>
                                <span className="ml-auto text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100">+ Đá chính</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CỘT 2: ĐÁ CHÍNH (STARTERS) */}
                <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 flex flex-col overflow-hidden relative">
                    <div className="p-3 bg-emerald-600 text-white font-bold flex justify-between items-center">
                        <span className="flex items-center gap-2">🔥 ĐỘI HÌNH RA SÂN (Sân {gameMode})</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-black 
                            ${starters.length === gameMode ? 'bg-white text-emerald-600' : 'bg-red-500 text-white animate-pulse'}`}>
                            {starters.length} / {gameMode}
                        </span>
                    </div>
                    
                    {/* Hình sân cỏ mờ làm nền */}
                    <div className="absolute inset-0 top-12 bg-[url('https://thumbs.dreamstime.com/b/soccer-field-pattern-green-grass-texture-background-vector-illustration-130453001.jpg')] opacity-10 pointer-events-none bg-cover"></div>

                    <div className="p-2 overflow-y-auto flex-1 space-y-2 relative z-10">
                        {starters.length === 0 && <div className="text-center text-gray-400 mt-10 italic">Chọn cầu thủ từ cột bên trái</div>}
                        {starters.map((p, index) => (
                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                                <span className="font-black text-emerald-200 text-xl w-6 text-center">{index + 1}</span>
                                <img src={p.avatar ? `${API_URL}${p.avatar}` : 'https://placehold.co/40'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"/>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-slate-800">{p.name}</div>
                                    <div className="text-xs text-emerald-600 font-bold">{p.position}</div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveToSub(p)} className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded font-bold hover:bg-blue-200">Xuống dự bị</button>
                                    <button onClick={() => removeFromSquad(p)} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CỘT 3: DỰ BỊ (SUBS) */}
                <div className="bg-white rounded-xl shadow border border-gray-200 flex flex-col overflow-hidden">
                    <div className="p-3 bg-blue-50 border-b border-blue-100 font-bold text-blue-800 flex justify-between">
                        <span>Cầu thủ dự bị</span>
                        <span className="bg-blue-200 text-blue-800 px-2 rounded text-xs py-0.5">{subs.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto flex-1 space-y-2">
                        {subs.length === 0 && <div className="text-center text-gray-400 mt-10 italic">Chưa có cầu thủ dự bị</div>}
                        {subs.map(p => (
                            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                <img src={p.avatar ? `${API_URL}${p.avatar}` : 'https://placehold.co/40'} className="w-10 h-10 rounded-full object-cover grayscale opacity-70"/>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-gray-600">{p.name}</div>
                                    <div className="text-xs text-gray-400">{p.position}</div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => moveToStarter(p)} className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded font-bold hover:bg-emerald-200">↑ Đá chính</button>
                                    <button onClick={() => removeFromSquad(p)} className="text-[10px] text-gray-400 hover:text-red-500 px-2">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};