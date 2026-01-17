import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { matchService, tournamentService, playerService } from '../../services';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { TournamentBasic, Match } from '../../types';

export const AdminMatchPage = () => {
    const location = useLocation();
    
    // --- STATE DANH SÁCH ---
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string>("");
    const [matches, setMatches] = useState<Match[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // --- STATE TRẬN ĐẤU ĐÃ CHỌN ---
    const [selectedMatchId, setSelectedMatchId] = useState<string>("");
    const [match, setMatch] = useState<any>(null);
    const [homePlayers, setHomePlayers] = useState<any[]>([]);
    const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
    const [loadingMatch, setLoadingMatch] = useState(false);

    // --- STATE THỜI GIAN ---
    const [currentMinute, setCurrentMinute] = useState(0);

    // --- STATE MODAL THAY NGƯỜI ---
    const [showSubModal, setShowSubModal] = useState(false);
    const [subTeamId, setSubTeamId] = useState<number | null>(null);
    const [playerOut, setPlayerOut] = useState<any>(null);
    const [playerIn, setPlayerIn] = useState<any>(null);
    const [actionMinute, setActionMinute] = useState('');

    // Load danh sách giải đấu
    useEffect(() => {
        tournamentService.getAllTournaments().then(data => {
            setTournaments(data);
            if (data.length > 0) setSelectedTourId(String(data[0].id));
        });
    }, []);

    // Load danh sách trận đấu khi chọn giải
    useEffect(() => {
        if (selectedTourId) fetchMatches();
    }, [selectedTourId]);

    const fetchMatches = async () => {
        if (!selectedTourId) return;
        setLoadingMatches(true);
        try {
            const data = await matchService.getMatchesByTournament(Number(selectedTourId));
            setMatches(data);
            
            // Ưu tiên chọn match từ navigation state, nếu không có thì chọn trận đầu tiên
            const matchIdFromState = (location.state as any)?.matchId;
            if (matchIdFromState && data.find(m => m.id === matchIdFromState)) {
                setSelectedMatchId(String(matchIdFromState));
            } else if (data.length > 0 && !selectedMatchId) {
                setSelectedMatchId(String(data[0].id));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMatches(false);
        }
    };

    // Load chi tiết trận đấu khi chọn
    useEffect(() => {
        if (selectedMatchId) fetchMatchDetail();
    }, [selectedMatchId]);

    const fetchMatchDetail = async () => {
        if (!selectedMatchId) return;
        setLoadingMatch(true);
        try {
            const matchData = await matchService.getMatchDetail(Number(selectedMatchId));
            setMatch(matchData);

            // Lấy danh sách cầu thủ 2 đội
            const [homeData, awayData] = await Promise.all([
                playerService.getPlayersByTeam(matchData.homeTeamId),
                playerService.getPlayersByTeam(matchData.awayTeamId)
            ]);

            setHomePlayers(homeData);
            setAwayPlayers(awayData);
        } catch (error) {
            console.error(error);
            alert("Lỗi tải dữ liệu trận đấu!");
        } finally {
            setLoadingMatch(false);
        }
    };

    // Timer giả lập (Tự tăng phút nếu trận đang LIVE)
    useEffect(() => {
        let interval: any;
        if (match?.status === 'IN_PROGRESS') {
            interval = setInterval(() => {
                setCurrentMinute(prev => (prev < 90 ? prev + 1 : prev));
            }, 60000); // 1 phút thật = 1 phút game
        }
        return () => clearInterval(interval);
    }, [match?.status]);

    // Helper: Chia đội hình (Đá chính / Dự bị)
    const getSquad = (allPlayers: any[]) => {
        return {
            onPitch: allPlayers.slice(0, 7),
            bench: allPlayers.slice(7)
        };
    };

    // --- CÁC HÀM XỬ LÝ ---

    // A. Bắt đầu trận đấu
    const handleStartMatch = async () => {
        if (!match) return;
        if (!confirm("Bắt đầu trận đấu? Trạng thái sẽ chuyển sang LIVE.")) return;
        try {
            await matchService.startMatch(match.id);
            setMatch({ ...match, status: 'IN_PROGRESS' });
            alert("▶ Trận đấu đã bắt đầu!");
        } catch (e) {
            alert("Lỗi bắt đầu trận đấu.");
        }
    };

    // B. Kết thúc trận đấu
    const handleFinishMatch = async () => {
        if (!match) return;
        if (!confirm("⚠️ XÁC NHẬN KẾT THÚC TRẬN ĐẤU?\nKết quả sẽ được lưu và cập nhật BXH.")) return;
        try {
            await matchService.finishMatch(match.id);
            setMatch({ ...match, status: 'FINISHED' });
            alert("🏁 Trận đấu đã kết thúc!");
            fetchMatches(); // Refresh danh sách
        } catch (e) {
            alert("Lỗi kết thúc trận đấu.");
        }
    };

    // C. Mở Modal Thay người
    const openSubModal = (teamId: number) => {
        setSubTeamId(teamId);
        setPlayerOut(null);
        setPlayerIn(null);
        setActionMinute(currentMinute.toString());
        setShowSubModal(true);
    };

    // D. Xử lý Thay người (Substitution)
    const handleSubmitSub = async () => {
        if (!match || !playerOut || !playerIn || !actionMinute) return alert("Vui lòng chọn đủ thông tin!");

        try {
            await matchService.addMatchEvent({
                matchId: match.id,
                teamId: subTeamId!,
                playerId: playerIn.id,
                eventType: 'SUBSTITUTION' as any,
                minute: Number(actionMinute)
            });

            // Cập nhật UI (Hoán đổi vị trí trong mảng local)
            const updateList = (prevList: any[]) => {
                const newList = [...prevList];
                const idxOut = newList.findIndex(p => p.id === playerOut.id);
                const idxIn = newList.findIndex(p => p.id === playerIn.id);
                if (idxOut !== -1 && idxIn !== -1) {
                    [newList[idxOut], newList[idxIn]] = [newList[idxIn], newList[idxOut]];
                }
                return newList;
            };

            if (subTeamId === match.homeTeamId) setHomePlayers(prev => updateList(prev));
            else setAwayPlayers(prev => updateList(prev));

            alert(`✅ Thay người thành công!`);
            setShowSubModal(false);
        } catch (error) {
            console.error(error);
            alert("Lỗi thay người!");
        }
    };

    // E. Xử lý sự kiện nhanh (Bàn thắng / Thẻ)
    const handleQuickEvent = async (type: string, teamId: number, player: any) => {
        if (!match) return;
        const minute = prompt(`Nhập phút cho sự kiện ${type === 'GOAL' ? 'Bàn thắng' : 'Thẻ'}:`, currentMinute.toString());
        if (!minute) return;

        try {
            await matchService.addMatchEvent({
                matchId: match.id,
                teamId: teamId,
                playerId: player.id,
                eventType: type as 'GOAL' | 'YELLOW_CARD' | 'RED_CARD',
                minute: Number(minute)
            });

            alert(`✅ Đã ghi nhận: ${type} - ${player.name} (Phút ${minute})`);

            // Cập nhật tỉ số ngay lập tức nếu là bàn thắng
            if (type === 'GOAL') {
                if (teamId === match.homeTeamId) setMatch({ ...match, homeScore: match.homeScore + 1 });
                else setMatch({ ...match, awayScore: match.awayScore + 1 });
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi ghi sự kiện!");
        }
    };

    // Phân tách đội hình
    const homeSquad = homePlayers.length > 0 ? getSquad(homePlayers) : { onPitch: [], bench: [] };
    const awaySquad = awayPlayers.length > 0 ? getSquad(awayPlayers) : { onPitch: [], bench: [] };

    // Squad cho Modal thay người
    const modalSquad = subTeamId === match?.homeTeamId ? homeSquad : awaySquad;
    const modalTeamName = subTeamId === match?.homeTeamId ? match?.homeTeam : match?.awayTeam;

    return (
        <div className="min-h-screen p-4 pb-20 animate-fade-in">
            {/* --- HEADER CHỌN TRẬN ĐẤU --- */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 border-b-2 border-blue-500">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">🎮 Console Điều Khiển Trận Đấu</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Chọn Giải Đấu</label>
                        <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn giải đấu" />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments.map(t => (
                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <label className="text-sm font-semibold text-gray-600 mb-2 block">Chọn Trận Đấu</label>
                        {loadingMatches ? (
                            <div className="h-10 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                        ) : (
                            <Select value={selectedMatchId} onValueChange={setSelectedMatchId} disabled={!selectedTourId || matches.length === 0}>
                                <SelectTrigger>
                                    <SelectValue placeholder={matches.length === 0 ? "Không có trận đấu" : "Chọn trận đấu"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {matches.map(m => {
                                        const statusBadge = m.status === 'SCHEDULED' ? '🟡 SẮP ĐÁ' :
                                            m.status === 'IN_PROGRESS' ? '🔴 LIVE' : '✅ FT';
                                        return (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {statusBadge} {m.homeTeam} vs {m.awayTeam} - {new Date(m.matchDate).toLocaleDateString('vi-VN')}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
            </div>

            {/* --- CONSOLE TRẬN ĐẤU --- */}
            {loadingMatch ? (
                <div className="text-center py-20 font-bold text-gray-500 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <span>⏳ Đang tải Console...</span>
                </div>
            ) : !match ? (
                <div className="text-center py-20 font-bold text-gray-400">
                    👆 Vui lòng chọn trận đấu để điều khiển
                </div>
            ) : (
                <>
                    {/* --- HEADER TỈ SỐ & ĐIỀU KHIỂN CHÍNH --- */}
                    <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl mb-6 sticky top-2 z-20 border-b-4 border-blue-500">
                        <div className="flex justify-between items-center text-center">

                            {/* ĐỘI NHÀ */}
                            <div className="w-1/3 flex flex-col items-center">
                                <img src={getImageUrl(match.homeLogo)} className="w-16 h-16 bg-white rounded-full p-1 object-contain mb-2" />
                                <h2 className="text-xl font-black uppercase">{match.homeTeam}</h2>
                            </div>

                            {/* TỈ SỐ & TRẠNG THÁI */}
                            <div className="w-1/3 flex flex-col items-center">
                                <div className="bg-black/50 px-4 py-1 rounded-full text-xs font-mono text-green-400 mb-2 border border-green-900">
                                    {match.status === 'SCHEDULED' ? 'CHƯA BẮT ĐẦU' : match.status === 'IN_PROGRESS' ? `LIVE: ${currentMinute}'` : 'KẾT THÚC'}
                                </div>

                                <div className="text-6xl font-black tracking-widest leading-none mb-2">
                                    {match.homeScore} - {match.awayScore}
                                </div>

                                {/* Nút Bắt đầu / Kết thúc */}
                                <div className="mt-2">
                                    {match.status === 'SCHEDULED' && (
                                        <button onClick={handleStartMatch} className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded shadow-lg animate-pulse">
                                            ▶ BẮT ĐẦU TRẬN ĐẤU
                                        </button>
                                    )}
                                    {match.status === 'IN_PROGRESS' && (
                                        <button onClick={handleFinishMatch} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded shadow-lg border border-red-400">
                                            🏁 KẾT THÚC TRẬN ĐẤU
                                        </button>
                                    )}
                                    {match.status === 'FINISHED' && (
                                        <div className="text-xs text-gray-400 font-semibold">Trận đấu đã kết thúc</div>
                                    )}
                                </div>
                            </div>

                            {/* ĐỘI KHÁCH */}
                            <div className="w-1/3 flex flex-col items-center">
                                <img src={getImageUrl(match.awayLogo)} className="w-16 h-16 bg-white rounded-full p-1 object-contain mb-2" />
                                <h2 className="text-xl font-black uppercase">{match.awayTeam}</h2>
                            </div>
                        </div>
                    </div>

                    {/* --- KHU VỰC CONSOLE 2 CỘT --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* === CỘT ĐỘI NHÀ === */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-700 text-white p-3 font-bold flex justify-between items-center shadow-md">
                                <span>🏠 HOME SQUAD</span>
                                {match.status === 'IN_PROGRESS' && (
                                    <button onClick={() => openSubModal(match.homeTeamId)} className="bg-white text-blue-700 px-3 py-1 rounded text-xs font-black hover:bg-blue-50 shadow transition">
                                        ⇄ THAY NGƯỜI
                                    </button>
                                )}
                            </div>
                            <div className="p-2">
                                {/* List Cầu thủ Trên sân */}
                                <div className="space-y-2 mb-4">
                                    {homeSquad.onPitch.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100 hover:border-blue-300 transition group">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-blue-900 w-6 text-lg">#{p.shirtNumber}</span>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800">{p.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{p.position}</div>
                                                </div>
                                            </div>
                                            {/* Nút thao tác nhanh */}
                                            {match.status === 'IN_PROGRESS' && (
                                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleQuickEvent('GOAL', match.homeTeamId, p)} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-green-600 shadow">⚽</button>
                                                    <button onClick={() => handleQuickEvent('YELLOW_CARD', match.homeTeamId, p)} className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded hover:bg-yellow-500 shadow">🟨</button>
                                                    <button onClick={() => handleQuickEvent('RED_CARD', match.homeTeamId, p)} className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 shadow">🟥</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* List Dự bị */}
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dự bị (Bench)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {homeSquad.bench.map(p => (
                                            <div key={p.id} className="text-xs flex gap-1 p-1 items-center text-gray-500">
                                                <span className="font-bold">#{p.shirtNumber}</span>
                                                <span className="truncate">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* === CỘT ĐỘI KHÁCH === */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-red-700 text-white p-3 font-bold flex justify-between items-center shadow-md">
                                <span>✈️ AWAY SQUAD</span>
                                {match.status === 'IN_PROGRESS' && (
                                    <button onClick={() => openSubModal(match.awayTeamId)} className="bg-white text-red-700 px-3 py-1 rounded text-xs font-black hover:bg-red-50 shadow transition">
                                        ⇄ THAY NGƯỜI
                                    </button>
                                )}
                            </div>
                            <div className="p-2">
                                {/* List Cầu thủ Trên sân */}
                                <div className="space-y-2 mb-4">
                                    {awaySquad.onPitch.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100 hover:border-red-300 transition group">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-red-900 w-6 text-lg">#{p.shirtNumber}</span>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800">{p.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{p.position}</div>
                                                </div>
                                            </div>
                                            {/* Nút thao tác nhanh */}
                                            {match.status === 'IN_PROGRESS' && (
                                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleQuickEvent('GOAL', match.awayTeamId, p)} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-green-600 shadow">⚽</button>
                                                    <button onClick={() => handleQuickEvent('YELLOW_CARD', match.awayTeamId, p)} className="bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded hover:bg-yellow-500 shadow">🟨</button>
                                                    <button onClick={() => handleQuickEvent('RED_CARD', match.awayTeamId, p)} className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600 shadow">🟥</button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {/* List Dự bị */}
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dự bị (Bench)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {awaySquad.bench.map(p => (
                                            <div key={p.id} className="text-xs flex gap-1 p-1 items-center text-gray-500">
                                                <span className="font-bold">#{p.shirtNumber}</span>
                                                <span className="truncate">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- MODAL THAY NGƯỜI --- */}
                    {showSubModal && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                {/* Header Modal */}
                                <div className="bg-slate-900 text-white p-4 text-center relative shadow-md">
                                    <h3 className="font-bold text-lg uppercase flex items-center justify-center gap-2">
                                        🔄 Thay người: <span className="text-yellow-400">{modalTeamName}</span>
                                    </h3>
                                    <button onClick={() => setShowSubModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white font-bold text-xl">✕</button>
                                </div>

                                {/* Body - Grid 2 Cột */}
                                <div className="p-4 grid grid-cols-2 gap-4 flex-1 overflow-y-auto bg-gray-100">
                                    {/* Cột NGƯỜI RA */}
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <h4 className="text-center font-black text-red-600 mb-3 uppercase text-sm border-b pb-2">🔻 Người Ra (Out)</h4>
                                        <div className="space-y-2">
                                            {modalSquad.onPitch.map(p => (
                                                <div key={p.id} onClick={() => setPlayerOut(p)}
                                                    className={`p-2 rounded-lg border-2 cursor-pointer flex justify-between items-center transition
                                                        ${playerOut?.id === p.id ? 'bg-red-50 border-red-500' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                                                    <span className="font-bold text-slate-700">#{p.shirtNumber}</span>
                                                    <span className="text-sm font-medium">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cột NGƯỜI VÀO */}
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <h4 className="text-center font-black text-green-600 mb-3 uppercase text-sm border-b pb-2">💚 Người Vào (In)</h4>
                                        <div className="space-y-2">
                                            {modalSquad.bench.map(p => (
                                                <div key={p.id} onClick={() => setPlayerIn(p)}
                                                    className={`p-2 rounded-lg border-2 cursor-pointer flex justify-between items-center transition
                                                        ${playerIn?.id === p.id ? 'bg-green-50 border-green-500' : 'border-transparent hover:bg-gray-50 hover:border-gray-200'}`}>
                                                    <span className="font-bold text-slate-700">#{p.shirtNumber}</span>
                                                    <span className="text-sm font-medium">{p.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Modal */}
                                <div className="p-4 bg-white border-t flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                                    <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                                        <label className="font-bold text-sm text-gray-600">Phút:</label>
                                        <input type="number" className="w-16 bg-white border border-gray-300 rounded p-1 text-center font-bold"
                                            value={actionMinute} onChange={e => setActionMinute(e.target.value)} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setShowSubModal(false)} className="px-5 py-2 bg-gray-200 rounded-lg font-bold text-gray-600 hover:bg-gray-300 transition">Hủy</button>
                                        <button onClick={handleSubmitSub} disabled={!playerIn || !playerOut}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95">
                                            XÁC NHẬN
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
