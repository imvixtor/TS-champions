import { useEffect, useState } from 'react';
import { playerService, teamService } from '../../../services';

const API_URL = 'http://localhost:8080';

export const AdminPlayerPage = () => {
    // State Form
    const [name, setName] = useState('');
    const [shirtNumber, setShirtNumber] = useState('');
    const [position, setPosition] = useState('FW');
    const [avatar, setAvatar] = useState<File | null>(null);
    
    // State Data
    const [teams, setTeams] = useState<any[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>(''); // Đội đang chọn để xem/thêm
    const [players, setPlayers] = useState<any[]>([]); // List cầu thủ của đội đó
    const [loading, setLoading] = useState(false);

    // 1. Load danh sách Đội bóng (để bỏ vào Dropdown)
    useEffect(() => {
        teamService.getAllTeams()
            .then(data => {
                setTeams(data);
                if (data.length > 0) {
                    setSelectedTeamId(data[0].id); // Mặc định chọn đội đầu tiên
                }
            })
            .catch(err => console.error("Lỗi tải đội:", err));
    }, []);

    // 2. Khi selectedTeamId thay đổi -> Load danh sách cầu thủ của đội đó
    useEffect(() => {
        if (selectedTeamId) {
            fetchPlayers(selectedTeamId);
        }
    }, [selectedTeamId]);

    const fetchPlayers = async (teamId: string) => {
        try {
            const data = await playerService.getPlayersByTeam(Number(teamId));
            setPlayers(data);
        } catch (error) {
            console.error("Lỗi tải cầu thủ:", error);
            setPlayers([]); // Nếu lỗi thì reset list
        }
    };

    // 3. Xử lý Thêm Cầu Thủ
    const handleCreatePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!selectedTeamId) return alert("Vui lòng chọn đội bóng trước!");
        setLoading(true);

        try {
            const formData = new FormData();

            // Đóng gói JSON
            const playerData = { 
                name, 
                shirtNumber: Number(shirtNumber), 
                position, 
                teamId: Number(selectedTeamId) // Lấy ID đội đang chọn
            };
            const jsonBlob = new Blob([JSON.stringify(playerData)], { type: 'application/json' });
            
            formData.append('player', jsonBlob);

            if (avatar) {
                formData.append('avatar', avatar);
            }

            await playerService.createPlayer({
                name,
                shirtNumber: Number(shirtNumber),
                position,
                teamId: Number(selectedTeamId)
            }, avatar || undefined);

            alert("✅ Thêm cầu thủ thành công!");
            setName(''); setShirtNumber(''); setAvatar(null); // Reset form
            fetchPlayers(selectedTeamId); // Load lại danh sách ngay

        } catch (error: any) {
            console.error("Lỗi thêm:", error);
            if (error.response?.status === 403) alert("❌ Lỗi quyền hạn (403). Hãy logout và login lại!");
            else alert("❌ Lỗi thêm cầu thủ! Kiểm tra console.");
        } finally {
            setLoading(false);
        }
    };

    // 4. Xử lý Xóa Cầu Thủ
    const handleDelete = async (playerId: number) => {
        if(!confirm("Bạn có chắc chắn muốn xóa cầu thủ này?")) return;
        
        try {
            await playerService.deletePlayer(playerId);
            alert("🗑️ Đã xóa thành công!");
            fetchPlayers(selectedTeamId); // Load lại list
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa (Có thể cầu thủ này đã có thống kê bàn thắng/thẻ phạt).");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* CỘT TRÁI: FORM THÊM CẦU THỦ */}
            <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">➕ THÊM CẦU THỦ</h2>
                
                <form onSubmit={handleCreatePlayer} className="space-y-4">
                    {/* Chọn đội để thêm vào */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <label className="block font-bold text-blue-800 mb-1 text-sm">Đang thao tác với đội:</label>
                        <select 
                            className="w-full border p-2 rounded bg-white font-bold text-slate-700"
                            value={selectedTeamId}
                            onChange={e => setSelectedTeamId(e.target.value)}
                        >
                            {teams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Tên Cầu Thủ</label>
                        <input className="w-full border p-2 rounded outline-blue-500"
                            required value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-bold mb-1">Số Áo</label>
                            <input type="number" className="w-full border p-2 rounded outline-blue-500"
                                required value={shirtNumber} onChange={e => setShirtNumber(e.target.value)} placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Vị Trí</label>
                            <select className="w-full border p-2 rounded outline-blue-500 bg-white" 
                                value={position} onChange={e => setPosition(e.target.value)}>
                                <option value="GK">Thủ môn</option>
                                <option value="DF">Hậu vệ</option>
                                <option value="MF">Tiền vệ</option>
                                <option value="FW">Tiền đạo</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Avatar</label>
                        <input type="file" accept="image/*" 
                            onChange={e => setAvatar(e.target.files ? e.target.files[0] : null)}
                            className="w-full text-xs"/>
                    </div>

                    <button disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 shadow-lg">
                        {loading ? 'Đang lưu...' : 'LƯU CẦU THỦ'}
                    </button>
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH CẦU THỦ */}
            <div className="md:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-slate-800">📋 DANH SÁCH CẦU THỦ</h2>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        Tổng: {players.length}
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600 sticky top-0">
                            <tr>
                                <th className="p-3 text-center">Số</th>
                                <th className="p-3">Avatar</th>
                                <th className="p-3">Tên & Vị trí</th>
                                <th className="p-3 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {players.length > 0 ? (
                                players.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-bold text-center text-blue-600 text-lg">
                                            {p.shirtNumber}
                                        </td>
                                        <td className="p-3">
                                            <img src={p.avatar ? `${API_URL}${p.avatar}` : 'https://placehold.co/40'} 
                                                 className="w-10 h-10 rounded-full object-cover border border-gray-200"/>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-slate-700">{p.name}</div>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded 
                                                ${p.position === 'GK' ? 'bg-yellow-100 text-yellow-700' : 
                                                  p.position === 'FW' ? 'bg-red-100 text-red-700' : 
                                                  p.position === 'MF' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {p.position}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button onClick={() => handleDelete(p.id)} 
                                                className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded transition" title="Xóa">
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-400 italic">
                                        Đội này chưa có cầu thủ nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};