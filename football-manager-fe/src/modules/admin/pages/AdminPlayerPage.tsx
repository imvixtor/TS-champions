import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';

export const AdminPlayerPage = () => {
    // State Form
    const [name, setName] = useState('');
    const [shirtNumber, setShirtNumber] = useState('');
    const [position, setPosition] = useState('FW');
    const [teamId, setTeamId] = useState(''); 
    const [avatar, setAvatar] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // State danh sách đội để hiển thị Dropdown
    const [teams, setTeams] = useState<any[]>([]);

    // 1. Load danh sách đội để bỏ vào Dropdown
    useEffect(() => {
        axiosClient.get('/champions/team')
            .then(res => {
                setTeams(res.data);
                if(res.data.length > 0) setTeamId(res.data[0].id); // Chọn mặc định đội đầu tiên
            })
            .catch(err => console.error(err));
    }, []);

    // 2. Xử lý tạo cầu thủ
    const handleCreatePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!teamId) return alert("Vui lòng chọn đội bóng trước!");
        setLoading(true);

        try {
            const formData = new FormData();

            // --- SỬA LỖI TẠI ĐÂY: Dùng Blob cho player object ---
            const playerData = { 
                name, 
                shirtNumber: Number(shirtNumber), 
                position, 
                teamId: Number(teamId) 
            };
            const jsonBlob = new Blob([JSON.stringify(playerData)], { type: 'application/json' });
            
            formData.append('player', jsonBlob); // Backend nhận @RequestPart("player")
            // ----------------------------------------------------

            if (avatar) {
                formData.append('avatar', avatar); // Backend nhận @RequestPart("avatar")
            }

            await axiosClient.post('/champions/player/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("✅ Thêm cầu thủ thành công!");
            setName(''); setShirtNumber(''); setAvatar(null); // Reset form
            
        } catch (error) {
            console.error("Lỗi thêm cầu thủ:", error);
            alert("❌ Lỗi thêm cầu thủ! Kiểm tra console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100 mt-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">🏃 QUẢN LÝ CẦU THỦ</h2>
            
            <form onSubmit={handleCreatePlayer} className="space-y-6">
                {/* DROPDOWN CHỌN ĐỘI */}
                <div>
                    <label className="block font-bold text-gray-700 mb-1">Chọn Đội Bóng</label>
                    <select 
                        className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-slate-700"
                        value={teamId}
                        onChange={e => setTeamId(e.target.value)}
                    >
                        <option value="">-- Chọn đội bóng --</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Tên Cầu Thủ</label>
                        <input className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" />
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Số Áo</label>
                        <input type="number" className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required value={shirtNumber} onChange={e => setShirtNumber(e.target.value)} placeholder="10" />
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-gray-700 mb-1">Vị Trí</label>
                    <select className="w-full border p-3 rounded-lg bg-white focus:ring-2 focus:ring-green-500 outline-none" 
                        value={position} onChange={e => setPosition(e.target.value)}>
                        <option value="GK">Thủ môn (GK)</option>
                        <option value="DF">Hậu vệ (DF)</option>
                        <option value="MF">Tiền vệ (MF)</option>
                        <option value="FW">Tiền đạo (FW)</option>
                    </select>
                </div>

                <div>
                    <label className="block font-bold text-gray-700 mb-1">Ảnh Đại Diện</label>
                    <input type="file" accept="image/*" 
                        onChange={e => setAvatar(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                </div>

                <button disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20">
                    {loading ? 'Đang lưu...' : 'LƯU CẦU THỦ'}
                </button>
            </form>
        </div>
    );
};