import { useEffect, useState } from 'react';
import { teamService, playerService } from '../../services';
import { getImageUrl } from '../../utils';

export const AdminTeamPage = () => {
    // State Form & List (Cũ)
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [stadium, setStadium] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [coachName, setCoachName] = useState('');
    
    const [teams, setTeams] = useState<any[]>([]);
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // State Modal Xem Cầu Thủ (Cũ)
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);

    // --- MỚI: State cho Modal Cấp Tài Khoản HLV ---
    const [showCoachModal, setShowCoachModal] = useState(false);
    const [selectedTeamForCoach, setSelectedTeamForCoach] = useState<any>(null);
    const [coachUsername, setCoachUsername] = useState('');
    const [coachPassword, setCoachPassword] = useState('');

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const data = await teamService.getAllTeams();
            setTeams(data);
        } catch (e) { console.error(e); }
    };

    // --- 1. CÁC HÀM CŨ (GIỮ NGUYÊN) ---
    
    const handleViewPlayers = async (team: any) => {
        setSelectedTeam(team);
        setShowPlayerModal(true);
        setTeamPlayers([]);
        try {
            const data = await playerService.getPlayersByTeam(team.id);
            setTeamPlayers(data);
        } catch (error) {
            console.error("Lỗi tải cầu thủ:", error);
            alert("Không tải được danh sách cầu thủ.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            const teamData = { name, shortName, stadium, coachName };
            const jsonBlob = new Blob([JSON.stringify(teamData)], { type: 'application/json' });
            formData.append('team', jsonBlob);

            if (logo) formData.append('logo', logo);

            if (editingTeamId) {
                await teamService.updateTeam(editingTeamId, { name, shortName, stadium, coachName }, logo || undefined);
                alert("✅ Cập nhật thành công!");
            } else {
                await teamService.createTeam({ name, shortName, stadium, coachName }, logo || undefined);
                alert("✅ Tạo đội mới thành công!");
            }
            handleCancelEdit();
            fetchTeams(); 
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi xử lý! Kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ CẢNH BÁO: Xóa đội bóng sẽ XÓA LUÔN tất cả cầu thủ thuộc đội đó.\nBạn có chắc chắn không?")) return;
        try {
            await teamService.deleteTeam(id);
            alert("🗑️ Đã xóa đội bóng!");
            fetchTeams();
            if (editingTeamId === id) handleCancelEdit();
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa! (Có thể đội này đã đá giải, dính líu đến trận đấu).");
        }
    };

    const handleEditClick = (team: any) => {
        setEditingTeamId(team.id);
        setName(team.name);
        setShortName(team.shortName);
        setStadium(team.stadium);
        setCoachName(team.coachName || '');
        setLogo(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingTeamId(null);
        setName(''); setShortName(''); setStadium(''); setCoachName(''); setLogo(null);
        const fileInput = document.getElementById('logoInput') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    };

    // --- 2. CÁC HÀM MỚI (XỬ LÝ CẤP HLV) ---

    const handleOpenCoachModal = (team: any) => {
        setSelectedTeamForCoach(team);
        setCoachUsername('');
        setCoachPassword('');
        setShowCoachModal(true);
    };

    const handleCreateCoach = async () => {
        if (!coachUsername || !coachPassword) return alert("Vui lòng nhập Username và Password!");
        
        try {
            await teamService.createCoach({
                username: coachUsername,
                password: coachPassword,
                teamId: selectedTeamForCoach.id
            });
            alert(`✅ Đã cấp tài khoản HLV cho đội ${selectedTeamForCoach.name}`);
            setShowCoachModal(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data || "Có lỗi xảy ra (Check quyền Admin/Server)";
            alert(`❌ Lỗi: ${msg}`);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative p-6 animate-fade-in-up">
            
            {/* --- MODAL XEM CẦU THỦ (CŨ) --- */}
            {showPlayerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                👥 Đội hình: <span className="text-yellow-300 uppercase">{selectedTeam?.name}</span>
                            </h3>
                            <button onClick={() => setShowPlayerModal(false)} className="text-white hover:bg-blue-700 w-8 h-8 rounded-full font-bold">✕</button>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {teamPlayers.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 italic">Đội này chưa có cầu thủ nào.</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 text-xs font-bold uppercase text-gray-500 sticky top-0">
                                        <tr>
                                            <th className="p-3">Số áo</th>
                                            <th className="p-3">Ảnh</th>
                                            <th className="p-3">Tên cầu thủ</th>
                                            <th className="p-3">Vị trí</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teamPlayers.map(p => (
                                            <tr key={p.id}>
                                                <td className="p-3 font-bold text-center text-blue-600 text-lg">#{p.shirtNumber}</td>
                                                <td className="p-3">
                                                    <img src={getImageUrl(p.avatar)} 
                                                         className="w-10 h-10 rounded-full object-cover border border-gray-200"/>
                                                </td>
                                                <td className="p-3 font-bold text-gray-700">{p.name}</td>
                                                <td className="p-3"><span className="text-xs font-bold px-2 py-1 rounded bg-gray-100">{p.position}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MỚI: MODAL CẤP TÀI KHOẢN HLV --- */}
            {showCoachModal && selectedTeamForCoach && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
                        <div className="bg-purple-600 text-white p-4 text-center">
                            <h3 className="font-bold text-lg">Cấp TK Huấn Luyện Viên</h3>
                            <p className="text-sm opacity-90">Cho đội: <span className="font-black text-yellow-300">{selectedTeamForCoach.name}</span></p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                                <input className="w-full border-2 border-purple-100 p-2 rounded focus:border-purple-500 outline-none"
                                    value={coachUsername} onChange={e => setCoachUsername(e.target.value)} placeholder="VD: coach_hagl" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                                <input type="password" className="w-full border-2 border-purple-100 p-2 rounded focus:border-purple-500 outline-none"
                                    value={coachPassword} onChange={e => setCoachPassword(e.target.value)} placeholder="******" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowCoachModal(false)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-600">Hủy</button>
                                <button onClick={handleCreateCoach} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-bold shadow-lg">Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CỘT TRÁI: FORM --- */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit sticky top-4">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className={`text-xl font-bold ${editingTeamId ? 'text-orange-600' : 'text-blue-600'}`}>
                        {editingTeamId ? '✏️ SỬA ĐỘI BÓNG' : '➕ THÊM ĐỘI MỚI'}
                    </h2>
                    {editingTeamId && (
                        <button onClick={handleCancelEdit} className="text-xs bg-gray-200 px-2 py-1 rounded font-bold">Hủy</button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tên Đội</label>
                        <input className="w-full border p-2 rounded outline-blue-500" required value={name} onChange={e => setName(e.target.value)} placeholder="VD: Liverpool FC" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-bold mb-1">Mã (Short)</label>
                            <input className="w-full border p-2 rounded outline-blue-500" required value={shortName} onChange={e => setShortName(e.target.value)} placeholder="LIV" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">HLV</label>
                            <input className="w-full border p-2 rounded outline-blue-500" value={coachName} onChange={e => setCoachName(e.target.value)} placeholder="Arne Slot" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Sân Vận Động</label>
                        <input className="w-full border p-2 rounded outline-blue-500" required value={stadium} onChange={e => setStadium(e.target.value)} placeholder="Anfield" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Logo</label>
                        <input id="logoInput" type="file" accept="image/*" onChange={e => setLogo(e.target.files ? e.target.files[0] : null)} className="w-full text-sm"/>
                    </div>
                    
                    <button disabled={loading} className={`w-full text-white py-2 rounded-lg font-bold shadow-lg ${editingTeamId ? 'bg-orange-500' : 'bg-blue-600'}`}>
                        {loading ? 'Đang lưu...' : (editingTeamId ? 'CẬP NHẬT' : 'THÊM MỚI')}
                    </button>
                </form>
            </div>

            {/* --- CỘT PHẢI: DANH SÁCH --- */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">DANH SÁCH ĐỘI BÓNG</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                            <tr>
                                <th className="p-3 text-center">Logo</th>
                                <th className="p-3">Thông tin</th>
                                <th className="p-3 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-center">
                                        <img src={getImageUrl(team.logo)} className="w-12 h-12 object-contain mx-auto"/>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold text-lg">{team.name} <span className="text-gray-400 text-xs">({team.shortName})</span></div>
                                        <div className="text-gray-500 text-xs">🏟️ {team.stadium} • 👔 {team.coachName || 'N/A'}</div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2 flex-wrap">
                                            {/* Nút Xem Cầu Thủ */}
                                            <button onClick={() => handleViewPlayers(team)} 
                                                className="bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold hover:bg-green-200 flex items-center gap-1 text-xs">
                                                👥 Đội hình
                                            </button>

                                            {/* MỚI: Nút Cấp HLV */}
                                            <button onClick={() => handleOpenCoachModal(team)} 
                                                className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded font-bold hover:bg-purple-200 flex items-center gap-1 text-xs border border-purple-200">
                                                👤 Cấp HLV
                                            </button>
                                            
                                            {/* Nút Sửa */}
                                            <button onClick={() => handleEditClick(team)} 
                                                className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded font-bold hover:bg-blue-200 text-xs">
                                                ✏️ Sửa
                                            </button>
                                            
                                            {/* Nút Xóa */}
                                            <button onClick={() => handleDelete(team.id)} 
                                                className="bg-red-100 text-red-600 px-3 py-1.5 rounded font-bold hover:bg-red-200 text-xs">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
