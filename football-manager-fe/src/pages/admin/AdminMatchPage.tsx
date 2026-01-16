import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService, tournamentService, playerService } from '../../services';
import type { TournamentBasic } from '../../types/tournament.types';
import type { Match } from '../../types/match.types';

const API_URL = 'http://localhost:8080';

const getImageUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/40';
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${API_URL}${cleanPath}`;
};

export const AdminMatchPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterGroup, setFilterGroup] = useState<string>(''); 

    // State Modal Sửa Trận Đấu
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [editForm, setEditForm] = useState({ matchDate: '', stadium: '' });

    // --- MỚI: State Modal Xem Đội Hình ---
    const [showSquadModal, setShowSquadModal] = useState(false);
    const [selectedTeamName, setSelectedTeamName] = useState('');
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    useEffect(() => {
        tournamentService.getAllTournaments().then(data => {
            setTournaments(data);
            if (data.length > 0) setSelectedTourId(data[0].id);
        });
    }, []);

    useEffect(() => {
        if (selectedTourId) fetchMatches();
    }, [selectedTourId, filterGroup]);

    const fetchMatches = async () => {
        if (!selectedTourId) return;
        setLoading(true);
        try {
            const data = await matchService.getMatchesByTournament(selectedTourId, filterGroup || undefined);
            setMatches(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleGenerateSchedule = async () => {
        if (!selectedTourId || !confirm("Sinh lịch thi đấu tự động?")) return;
        try {
            await matchService.generateSchedule(selectedTourId);
            alert("✅ Đã sinh lịch thành công!");
            fetchMatches();
        } catch (error) { console.error(error); alert("❌ Lỗi sinh lịch!"); }
    };

    const handleSaveUpdate = async () => {
        if (!editingMatch) return;
        try {
            await matchService.updateMatch(editingMatch.id, {
                matchDate: editForm.matchDate,
                stadium: editForm.stadium,
                status: editingMatch.status
            });
            alert("✅ Cập nhật thành công!");
            setEditingMatch(null);
            fetchMatches();
        } catch (e) { console.error(e); alert("❌ Lỗi cập nhật"); }
    };

    // --- MỚI: Hàm xem đội hình ---
    const handleViewTeam = async (teamId: number, teamName: string) => {
        if (!teamId) return;
        setSelectedTeamName(teamName);
        setShowSquadModal(true);
        setLoadingPlayers(true);
        setTeamPlayers([]); // Clear dữ liệu cũ
        
        try {
            const data = await playerService.getPlayersByTeam(teamId);
            setTeamPlayers(data);
        } catch (error) {
            console.error(error);
            alert("❌ Không thể tải danh sách cầu thủ.");
        } finally {
            setLoadingPlayers(false);
        }
    };

    // Gom nhóm theo vòng đấu
    const matchesByRound = matches.reduce((acc, match) => {
        const round = match.roundName || 'Chưa xếp vòng';
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return (
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header & Filter */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">📅 QUẢN LÝ LỊCH THI ĐẤU</h2>
                    <div className="flex gap-3">
                        <select className="border p-2 rounded" value={selectedTourId || ''} onChange={e => setSelectedTourId(Number(e.target.value))}>
                            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={handleGenerateSchedule} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">⚡ Sinh Lịch</button>
                    </div>
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto">
                    <button onClick={() => setFilterGroup('')} className={`px-4 py-1 rounded-full text-sm border ${filterGroup===''?'bg-slate-800 text-white':'bg-white'}`}>Tất cả</button>
                    {['Group A','Group B','Group C','Group D'].map(g => (
                        <button key={g} onClick={() => setFilterGroup(g)} className={`px-4 py-1 rounded-full text-sm border ${filterGroup===g?'bg-blue-600 text-white':'bg-white'}`}>{g}</button>
                    ))}
                </div>
            </div>

            {/* Danh sách trận đấu */}
            {loading ? <div className="text-center py-10">Đang tải...</div> : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sortedRounds.map(round => (
                        <div key={round} className="bg-white border rounded-xl overflow-hidden shadow-sm h-fit">
                            <div className="bg-slate-100 p-3 font-bold text-slate-700 border-b flex justify-between">
                                <span>{round}</span>
                                <span className="text-xs bg-white border px-2 py-0.5 rounded text-gray-500">{matchesByRound[round].length} trận</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {matchesByRound[round].map(match => (
                                    <div key={match.id} className="p-4 hover:bg-blue-50 transition relative group">
                                        <div className="absolute top-2 right-2">
                                            {match.status === 'SCHEDULED' && <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded-full">SẮP ĐÁ</span>}
                                            {match.status === 'IN_PROGRESS' && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>}
                                            {match.status === 'FINISHED' && <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded-full">FT</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2 flex gap-2">
                                            <span className="font-mono text-blue-600 bg-blue-50 px-1 rounded">{new Date(match.matchDate).toLocaleString('vi-VN')}</span>
                                            <span>• {match.stadium || 'Chưa có sân'} • <b className="text-orange-600">{match.groupName}</b></span>
                                        </div>
                                        <div className="flex justify-between items-center mb-3">
                                            {/* ĐỘI NHÀ (Clickable) */}
                                            <div 
                                                className="flex items-center gap-2 w-1/3 cursor-pointer hover:opacity-80 transition p-1 rounded hover:bg-gray-100"
                                                onClick={() => handleViewTeam(match.homeTeamId, match.homeTeam)}
                                                title="Xem đội hình"
                                            >
                                                <img src={getImageUrl(match.homeLogo)} className="w-6 h-6 object-contain"/>
                                                <span className="font-bold text-sm hover:text-blue-600 hover:underline">{match.homeTeam}</span>
                                            </div>

                                            <div className="font-bold text-lg bg-gray-100 px-3 py-1 rounded">{match.status==='SCHEDULED'?'VS':`${match.homeScore} - ${match.awayScore}`}</div>

                                            {/* ĐỘI KHÁCH (Clickable) */}
                                            <div 
                                                className="flex items-center gap-2 w-1/3 justify-end cursor-pointer hover:opacity-80 transition p-1 rounded hover:bg-gray-100"
                                                onClick={() => handleViewTeam(match.awayTeamId, match.awayTeam)}
                                                title="Xem đội hình"
                                            >
                                                <span className="font-bold text-sm text-right hover:text-blue-600 hover:underline">{match.awayTeam}</span>
                                                <img src={getImageUrl(match.awayLogo)} className="w-6 h-6 object-contain"/>
                                            </div>
                                        </div>
                                        
                                        {/* Action Buttons */}
                                        <div className="flex justify-center gap-2 mt-2">
                                            <button onClick={() => { setEditingMatch(match); setEditForm({ matchDate: match.matchDate, stadium: match.stadium || '' }) }} 
                                                className="text-xs border px-3 py-1 rounded hover:bg-gray-100">✏️ Sửa Giờ</button>
                                            
                                            {match.status !== 'FINISHED' && (
                                                <button onClick={() => navigate(`/admin/match/${match.id}/console`)} 
                                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 shadow-sm flex items-center gap-1">
                                                    💻 Vào Console
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Sửa Trận Đấu */}
            {editingMatch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Cập nhật trận đấu</h3>
                        <div className="space-y-3">
                            <input type="datetime-local" className="w-full border p-2 rounded" value={editForm.matchDate} onChange={e => setEditForm({...editForm, matchDate: e.target.value})} />
                            <input type="text" className="w-full border p-2 rounded" placeholder="Sân vận động..." value={editForm.stadium} onChange={e => setEditForm({...editForm, stadium: e.target.value})} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setEditingMatch(null)} className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 font-bold text-sm">Hủy</button>
                                <button onClick={handleSaveUpdate} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold text-sm">Lưu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MỚI: Modal Xem Đội Hình (Squad) --- */}
            {showSquadModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                        {/* Header Modal */}
                        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                🏃 Đội hình: <span className="text-yellow-400 uppercase">{selectedTeamName}</span>
                            </h3>
                            <button onClick={() => setShowSquadModal(false)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition">✕</button>
                        </div>
                        
                        {/* Body Modal (Scrollable) */}
                        <div className="p-0 overflow-y-auto flex-1 bg-gray-50">
                            {loadingPlayers ? (
                                <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang tải danh sách cầu thủ...</span>
                                </div>
                            ) : teamPlayers.length === 0 ? (
                                <div className="p-10 text-center text-gray-400 italic">Đội này chưa có cầu thủ nào.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-200 text-xs font-bold uppercase text-gray-600 sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="p-3 text-center w-16">Số áo</th>
                                            <th className="p-3">Họ tên & Quốc tịch</th>
                                            <th className="p-3 text-center w-24">Vị trí</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white text-sm">
                                        {teamPlayers.map(p => (
                                            <tr key={p.id} className="hover:bg-blue-50 transition">
                                                <td className="p-3 text-center font-black text-slate-300 text-xl group-hover:text-blue-600">
                                                    #{p.shirtNumber}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={getImageUrl(p.avatar)} className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm" />
                                                        <div>
                                                            <div className="font-bold text-slate-800">{p.name}</div>
                                                            <div className="text-xs text-gray-400">{p.nationality || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded border
                                                        ${p.position === 'GK' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                          p.position === 'FW' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                          p.position === 'MF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                        {p.position}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        {/* Footer Modal */}
                        <div className="p-3 border-t bg-white text-right shrink-0">
                            <button onClick={() => setShowSquadModal(false)} className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition">Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
