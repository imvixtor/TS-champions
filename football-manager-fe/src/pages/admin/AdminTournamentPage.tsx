import { useEffect, useState } from 'react';
import { tournamentService, teamService } from '../../services';
import type { TeamBasic } from '../../types/team.types';
import type { Tournament } from '../../types/tournament.types';
import type { TournamentStanding } from '../../types/standing.types';

const API_URL = 'http://localhost:8080';

// --- HÀM XỬ LÝ ẢNH (Fix lỗi hiển thị trên Windows & Null) ---
const getImageUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/40';
    if (path.startsWith('http')) return path;
    
    // Xử lý đường dẫn Windows bị lỗi dấu \ thành /
    let cleanPath = path.replace(/\\/g, '/');
    // Đảm bảo bắt đầu bằng /
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    
    return `${API_URL}${cleanPath}`;
};

export const AdminTournamentPage = () => {
    // --- STATE DATA ---
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [allTeams, setAllTeams] = useState<TeamBasic[]>([]); // Kho đội bóng
    const [standings, setStandings] = useState<TournamentStanding[]>([]); // Đội ĐÃ tham gia giải

    // --- STATE UI ---
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

    // --- FORM INPUTS (DÙNG CHUNG CHO TẠO VÀ SỬA) ---
    const [form, setForm] = useState({ name: '', season: '', startDate: '', endDate: '' });
    const [editingId, setEditingId] = useState<number | null>(null); // ID giải đang sửa (null = mode tạo)

    // --- STATE CHO CHỨC NĂNG CHI TIẾT ---
    const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]); // Đội được tích chọn để thêm
    const [groupCount, setGroupCount] = useState(4); // Số bảng muốn chia
    const [manualTeamId, setManualTeamId] = useState(''); // ID đội muốn chỉnh thủ công
    const [manualGroupName, setManualGroupName] = useState('Group A'); // Bảng đích

    // ================== 1. LOAD DỮ LIỆU BAN ĐẦU ==================
    useEffect(() => {
        fetchTournaments();
        fetchAllTeams();
    }, []);

    const fetchTournaments = async () => {
        try {
            const data = await tournamentService.getAllTournaments();
            setTournaments(data);
        } catch (e) { console.error("Lỗi tải giải đấu", e); }
    };

    const fetchAllTeams = async () => {
        try {
            const data = await teamService.getAllTeams();
            setAllTeams(data);
        } catch (e) { console.error("Lỗi tải đội bóng", e); }
    };

    const fetchStandings = async (tourId: number) => {
        try {
            const data = await tournamentService.getStandings(tourId);
            setStandings(data);
        } catch (error) {
            console.error("Lỗi tải bảng xếp hạng", error);
            setStandings([]); 
        }
    };

    // ================== 2. CRUD GIẢI ĐẤU (CREATE / UPDATE / DELETE) ==================

    // 2.1. Xử lý Submit (Tạo mới HOẶC Cập nhật)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                // --- LOGIC CẬP NHẬT ---
                await tournamentService.updateTournament(editingId, form);
                alert("✅ Cập nhật giải đấu thành công!");
                handleCancelEdit(); // Reset form
            } else {
                // --- LOGIC TẠO MỚI ---
                await tournamentService.createTournament(form);
                alert("✅ Tạo giải đấu thành công!");
                setForm({ name: '', season: '', startDate: '', endDate: '' });
            }
            fetchTournaments();
        } catch (error) {
            console.error(error);
            alert("❌ Đã có lỗi xảy ra! Kiểm tra console.");
        } finally {
            setLoading(false);
        }
    };

    // 2.2. Chuyển sang chế độ Sửa (Điền dữ liệu vào form)
    const handleEditClick = (tour: Tournament, e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn ko cho nhảy vào trang chi tiết
        setEditingId(tour.id);
        setForm({
            name: tour.name,
            season: tour.season,
            startDate: tour.startDate,
            endDate: tour.endDate
        });
        // Cuộn lên đầu trang form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 2.3. Hủy chế độ Sửa -> Về chế độ Tạo
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', season: '', startDate: '', endDate: '' });
    };

    // 2.4. Xóa giải đấu
    const handleDeleteClick = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn ko cho nhảy vào trang chi tiết
        if (!confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa giải đấu này?\nTất cả dữ liệu bảng đấu, lịch thi đấu liên quan sẽ bị mất vĩnh viễn!")) return;

        try {
            await tournamentService.deleteTournament(id);
            alert("🗑️ Đã xóa giải đấu!");
            fetchTournaments();
            if (editingId === id) handleCancelEdit(); // Nếu đang sửa giải bị xóa thì reset form
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa (Có thể do lỗi server hoặc quyền hạn).");
        }
    };

    // ================== 3. CÁC CHỨC NĂNG CHI TIẾT (QUẢN LÝ BÊN TRONG) ==================

    // 3.1. Chuyển sang màn hình quản lý chi tiết
    const handleManage = (tour: Tournament) => {
        setSelectedTournament(tour);
        setViewMode('DETAIL');
        fetchStandings(tour.id);
        setSelectedTeamIds([]); 
        setManualTeamId('');
    };

    // 3.2. Thêm đội vào giải
    const toggleTeamSelection = (teamId: number) => {
        setSelectedTeamIds(prev => 
            prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
        );
    };

    const handleAddTeams = async () => {
        if (!selectedTournament || selectedTeamIds.length === 0) return alert("Chưa chọn đội nào!");
        try {
            await tournamentService.addTeams(selectedTournament.id, {
                teamIds: selectedTeamIds
            });
            alert(`✅ Đã thêm ${selectedTeamIds.length} đội vào giải!`);
            fetchStandings(selectedTournament.id); 
            setSelectedTeamIds([]);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi thêm đội (Có thể đội đã tồn tại trong giải).");
        }
    };

    // 3.3. Đánh dấu Hạt Giống (Seeding)
    const handleToggleSeed = async (teamId: number) => {
        if (!selectedTournament) return;
        try {
            await tournamentService.toggleSeed(selectedTournament.id, teamId);
            fetchStandings(selectedTournament.id); 
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi cập nhật hạt giống. Kiểm tra Backend API.");
        }
    };

    // 3.4. Chia bảng TỰ ĐỘNG (Auto Draw)
    const handleAutoDraw = async () => {
        if (!selectedTournament) return;
        const seedCount = standings.filter(s => s.isSeeded).length;
        if (!confirm(`Bạn có chắc muốn chia bảng?\n- Số bảng: ${groupCount}\n- Số hạt giống: ${seedCount}\n⚠️ Dữ liệu bảng cũ sẽ bị RESET.`)) return;

        try {
            await tournamentService.autoDraw(selectedTournament.id);
            alert("✅ Đã chia bảng thành công!");
            fetchStandings(selectedTournament.id);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi chia bảng. Hãy đảm bảo đã thêm đội vào giải.");
        }
    };

    // 3.5. Chia bảng THỦ CÔNG (Manual Draw)
    const handleManualDraw = async () => {
        if (!selectedTournament || !manualTeamId) return alert("Vui lòng chọn đội bóng!");
        try {
            await tournamentService.manualDraw(selectedTournament.id, {
                groups: [{
                    groupName: manualGroupName,
                    teamIds: [Number(manualTeamId)]
                }]
            });
            alert(`✅ Đã chuyển đội sang ${manualGroupName}`);
            fetchStandings(selectedTournament.id);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi cập nhật bảng đấu!");
        }
    };

    // --- UI HELPER: Gom nhóm đội theo tên bảng ---
    const groupedStandings = standings.reduce((acc, curr) => {
        const group = curr.groupName || 'Chưa chia bảng';
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, TournamentStanding[]>);


    // ================== GIAO DIỆN CHI TIẾT (VIEW MODE = DETAIL) ==================
    if (viewMode === 'DETAIL' && selectedTournament) {
        return (
            <div className="space-y-6 animate-fade-in-up">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                    <button onClick={() => setViewMode('LIST')} className="bg-white border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold text-gray-700 shadow-sm">
                        ← Quay lại
                    </button>
                    <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
                        <div>
                            <h1 className="text-2xl font-bold uppercase text-yellow-400 tracking-wider">{selectedTournament.name}</h1>
                            <p className="opacity-80 text-sm">Mùa giải: {selectedTournament.season} | {selectedTournament.startDate} - {selectedTournament.endDate}</p>
                        </div>
                        <span className="text-xs bg-blue-600 px-3 py-1 rounded-full font-mono border border-blue-400">ID: {selectedTournament.id}</span>
                    </div>
                </div>

                {/* --- 3 CỘT CHỨC NĂNG --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* CỘT 1: THÊM ĐỘI TỪ KHO */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-blue-100 flex flex-col h-full">
                        <h3 className="font-bold text-lg mb-3 text-blue-800 border-b pb-2 flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span> 
                            KHO ĐỘI BÓNG
                        </h3>
                        <div className="flex-1 max-h-80 overflow-y-auto border rounded-lg p-2 mb-4 bg-gray-50 text-sm custom-scrollbar">
                            {allTeams.map(team => {
                                const isAlreadyIn = standings.some(s => s.teamId === team.id || s.teamName === team.name);
                                return (
                                    <label key={team.id} className={`flex items-center gap-3 p-2 border-b last:border-0 rounded transition ${isAlreadyIn ? 'opacity-40 bg-gray-200 cursor-not-allowed' : 'hover:bg-white cursor-pointer hover:shadow-sm'}`}>
                                        <input 
                                            type="checkbox" 
                                            disabled={isAlreadyIn}
                                            checked={selectedTeamIds.includes(team.id)}
                                            onChange={() => toggleTeamSelection(team.id)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <img src={getImageUrl(team.logo)} className="w-8 h-8 object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/20'}/>
                                        <span className="font-semibold text-slate-700">{team.name}</span>
                                        {isAlreadyIn && <span className="text-[10px] bg-gray-400 text-white px-1 rounded ml-auto">Đã có</span>}
                                    </label>
                                )
                            })}
                        </div>
                        <button onClick={handleAddTeams} disabled={selectedTeamIds.length === 0} 
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition">
                            ➕ Thêm {selectedTeamIds.length} đội đã chọn
                        </button>
                    </div>

                    {/* CỘT 2: CHIA TỰ ĐỘNG & HẠT GIỐNG */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-orange-100 flex flex-col h-fit">
                        <h3 className="font-bold text-lg mb-3 text-orange-700 border-b pb-2 flex items-center gap-2">
                            <span className="bg-orange-100 text-orange-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span> 
                            CHIA TỰ ĐỘNG
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                                ★ Chọn Hạt Giống (Ưu tiên rải đều):
                            </label>
                            <div className="max-h-48 overflow-y-auto border rounded-lg bg-gray-50 p-1 text-sm">
                                {standings.length === 0 ? (
                                    <div className="p-4 text-center text-gray-400 italic text-xs">Chưa có đội nào tham gia giải.</div>
                                ) : (
                                    standings.map(s => (
                                        <div key={s.teamId} className="flex justify-between items-center p-2 border-b last:border-0 bg-white hover:bg-yellow-50 transition rounded-md mb-1">
                                            <div className="flex items-center gap-2">
                                                <img src={getImageUrl(s.teamLogo)} className="w-6 h-6 object-contain"/>
                                                <span className="font-semibold text-slate-700">{s.teamName}</span>
                                            </div>
                                            <button 
                                                onClick={() => handleToggleSeed(s.teamId)}
                                                className={`text-xl leading-none transition-all ${s.isSeeded ? 'text-yellow-400 scale-125 drop-shadow-sm' : 'text-gray-200 hover:text-yellow-300'}`}
                                                title={s.isSeeded ? "Bỏ hạt giống" : "Đặt làm hạt giống"}
                                            >
                                                ★
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 items-center mb-4 bg-orange-50 p-2 rounded-lg border border-orange-100">
                            <label className="font-bold text-sm text-gray-700 whitespace-nowrap">Số lượng bảng:</label>
                            <input 
                                type="number" min="1" max="8" 
                                value={groupCount} onChange={e => setGroupCount(Number(e.target.value))}
                                className="border-2 border-orange-200 p-1.5 rounded w-full text-center font-bold text-lg outline-none focus:border-orange-500 bg-white"
                            />
                        </div>
                        <button onClick={handleAutoDraw} disabled={standings.length === 0}
                            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 shadow-md transition disabled:opacity-50">
                            🎲 TRỘN & CHIA BẢNG
                        </button>
                    </div>

                    {/* CỘT 3: THỦ CÔNG */}
                    <div className="bg-white p-5 rounded-xl shadow-md border border-purple-100 flex flex-col h-fit">
                        <h3 className="font-bold text-lg mb-3 text-purple-800 border-b pb-2 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span> 
                            ĐIỀU CHỈNH THỦ CÔNG
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">Di chuyển đội bóng sang bảng khác theo ý muốn.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Chọn Đội bóng</label>
                                <select 
                                    className="w-full border-2 border-purple-100 p-2 rounded-lg font-semibold text-slate-700 outline-none focus:border-purple-500 text-sm"
                                    value={manualTeamId}
                                    onChange={e => setManualTeamId(e.target.value)}
                                >
                                    <option value="">-- Chọn đội cần xếp --</option>
                                    {standings.map(s => (
                                        <option key={s.teamId} value={s.teamId}>
                                            {s.teamName} [{s.groupName || 'Chưa xếp'}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Chuyển tới Bảng</label>
                                <select 
                                    className="w-full border-2 border-purple-100 p-2 rounded-lg font-semibold text-slate-700 outline-none focus:border-purple-500 text-sm"
                                    value={manualGroupName}
                                    onChange={e => setManualGroupName(e.target.value)}
                                >
                                    {['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'].map(g => (
                                        <option key={g} value={g}>{g}</option>
                                    ))}
                                </select>
                            </div>

                            <button onClick={handleManualDraw} className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 shadow-md transition">
                                💾 CẬP NHẬT VỊ TRÍ
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- HIỂN THỊ KẾT QUẢ CHIA BẢNG --- */}
                <div className="mt-8">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                            Kết Quả Bốc Thăm
                        </h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                            {standings.length} Teams
                        </span>
                        <div className="h-1 flex-1 bg-gray-200 rounded-full"></div>
                    </div>
                    
                    {Object.keys(groupedStandings).length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
                            <p className="text-lg italic">Chưa có dữ liệu bảng đấu.</p>
                            <p className="text-sm">Hãy thêm đội ở Cột 1 và bấm Chia bảng ở Cột 2.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 pb-10">
                            {Object.entries(groupedStandings).sort().map(([groupName, teams]) => (
                                <div key={groupName} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
                                    <div className="bg-slate-800 text-white p-3 font-bold flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-lg">🏆 {groupName}</span>
                                        <span className="text-[10px] font-normal uppercase tracking-wider bg-slate-600 px-2 py-0.5 rounded text-gray-200">
                                            {teams.length} Teams
                                        </span>
                                    </div>
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-semibold border-b text-[10px] uppercase tracking-wider">
                                            <tr>
                                                <th className="p-3 pl-4">Club</th>
                                                <th className="p-3 text-center w-12">Played</th>
                                                <th className="p-3 text-center w-12">GD</th>
                                                <th className="p-3 text-center w-12 font-bold text-slate-800">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {teams.map((t, idx) => (
                                                <tr key={idx} className={`${idx < 2 ? 'bg-green-50/60' : ''} hover:bg-gray-50`}>
                                                    <td className="p-3 pl-4 flex items-center gap-3">
                                                        <span className={`font-mono text-xs w-5 text-center rounded ${idx < 2 ? 'bg-green-600 text-white font-bold' : 'text-gray-400 bg-gray-100'}`}>
                                                            {idx + 1}
                                                        </span>
                                                        <img src={getImageUrl(t.teamLogo)} className="w-8 h-8 object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/20'}/>
                                                        <div>
                                                            <div className="font-bold text-slate-700 text-sm flex items-center gap-1">
                                                                {t.teamName}
                                                                {t.isSeeded && <span className="text-yellow-500 text-[10px]">★</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600 font-medium">{t.played}</td>
                                                    <td className="p-3 text-center text-gray-600 font-medium">{t.gd}</td>
                                                    <td className="p-3 text-center font-bold text-blue-700 text-base">{t.points}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ================== GIAO DIỆN DANH SÁCH (MẶC ĐỊNH = LIST) ==================
    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-fade-in-up">
            {/* CỘT TRÁI: FORM TẠO / SỬA */}
            <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className={`text-xl font-bold ${editingId ? 'text-orange-600' : 'text-slate-800'} flex items-center gap-2`}>
                        <span className="text-2xl">{editingId ? '✏️' : '🏆'}</span> 
                        {editingId ? 'CẬP NHẬT GIẢI ĐẤU' : 'TẠO GIẢI ĐẤU MỚI'}
                    </h2>
                    {editingId && (
                        <button onClick={handleCancelEdit} className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded text-gray-700 font-bold transition">
                            Hủy bỏ
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Tên Giải Đấu</label>
                        <input className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:border-blue-500 outline-none transition" 
                            required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Premier League 2025" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Mùa Giải</label>
                        <input className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:border-blue-500 outline-none transition" 
                            required value={form.season} onChange={e => setForm({...form, season: e.target.value})} placeholder="VD: 2024-2025" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Ngày Bắt đầu</label>
                            <input type="date" className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:border-blue-500 outline-none" 
                                required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Ngày Kết thúc</label>
                            <input type="date" className="w-full border-2 border-gray-200 p-2.5 rounded-lg focus:border-blue-500 outline-none" 
                                required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                        </div>
                    </div>
                    <button disabled={loading} className={`w-full text-white py-3 rounded-lg font-bold shadow-lg transition mt-2 disabled:bg-gray-400 
                        ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {loading ? 'Đang xử lý...' : (editingId ? 'LƯU CẬP NHẬT' : '✨ TẠO GIẢI ĐẤU')}
                    </button>
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH GIẢI ĐẤU */}
            <div className="md:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800">DANH SÁCH GIẢI ĐẤU</h2>
                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">Total: {tournaments.length}</span>
                </div>
                
                <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {tournaments.map(t => (
                        <li key={t.id} onClick={() => handleManage(t)}
                            className={`flex justify-between items-center p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer group 
                            ${editingId === t.id ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-200' : 'border-gray-100 hover:border-blue-300'}`}>
                            
                            {/* Thông tin giải đấu */}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg 
                                    ${editingId === t.id ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <div className={`font-bold text-lg transition ${editingId === t.id ? 'text-orange-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                        {t.name}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded">Mùa: {t.season}</span>
                                        <span>•</span>
                                        <span>{t.startDate} ➝ {t.endDate}</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Các nút thao tác */}
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => handleEditClick(t, e)}
                                    className="bg-white text-blue-600 border border-blue-100 p-2 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition shadow-sm"
                                    title="Sửa thông tin"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={(e) => handleDeleteClick(t.id, e)}
                                    className="bg-white text-red-600 border border-red-100 p-2 rounded-lg hover:bg-red-50 hover:border-red-300 transition shadow-sm"
                                    title="Xóa giải đấu"
                                >
                                    🗑️
                                </button>
                                <button className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm flex items-center gap-1">
                                    Quản lý ➡
                                </button>
                            </div>
                        </li>
                    ))}
                    {tournaments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <span className="text-4xl mb-2">📭</span>
                            <p>Chưa có giải đấu nào.</p>
                        </div>
                    )}
                </ul>
            </div>
        </div>
    );
};
