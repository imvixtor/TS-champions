import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';

const API_URL = 'http://localhost:8080';

export const AdminTeamPage = () => {
    // State quản lý Form
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [stadium, setStadium] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [coachName, setCoachName] = useState('');
    
    // State quản lý Danh sách
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Load danh sách đội khi vào trang
    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const res = await axiosClient.get('/champions/team');
            setTeams(res.data);
        } catch (e) { 
            console.error("Lỗi tải danh sách đội:", e); 
        }
    };

    // 2. Xử lý tạo đội mới
    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            
            // --- SỬA LỖI TẠI ĐÂY: Dùng Blob để ép kiểu JSON ---
            const teamData = { name, shortName, stadium, coachName };
            const jsonBlob = new Blob([JSON.stringify(teamData)], { type: 'application/json' });
            
            formData.append('team', jsonBlob); // Backend nhận @RequestPart("team")
            // --------------------------------------------------

            if (logo) {
                formData.append('logo', logo); // Backend nhận @RequestPart("logo")
            }

            await axiosClient.post('/champions/team/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("✅ Tạo đội bóng thành công!");
            
            // Reset form và load lại danh sách
            setName(''); setShortName(''); setStadium(''); setLogo(null); setCoachName('');
            fetchTeams(); 

        } catch (error) {
            console.error("Lỗi tạo đội:", error);
            alert("❌ Lỗi tạo đội! Kiểm tra console để biết chi tiết.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* CỘT TRÁI: FORM TẠO ĐỘI (Chiếm 4 phần) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">➕ THÊM ĐỘI BÓNG</h2>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tên Đội</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            required value={name} onChange={e => setName(e.target.value)} placeholder="Manchester United" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-bold mb-1">Viết Tắt</label>
                            <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                required value={shortName} onChange={e => setShortName(e.target.value)} placeholder="MUN" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">HLV</label>
                            <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                value={coachName} onChange={e => setCoachName(e.target.value)} placeholder="Ten Hag" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Sân Vận Động</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            required value={stadium} onChange={e => setStadium(e.target.value)} placeholder="Old Trafford" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Logo</label>
                        <input type="file" accept="image/*" 
                            onChange={e => setLogo(e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    <button disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        {loading ? 'Đang xử lý...' : 'LƯU ĐỘI BÓNG'}
                    </button>
                </form>
            </div>

            {/* CỘT PHẢI: DANH SÁCH ĐỘI (Chiếm 8 phần) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">📋 DANH SÁCH ĐỘI BÓNG</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                            <tr>
                                <th className="p-3 text-center">ID</th>
                                <th className="p-3 text-center">Logo</th>
                                <th className="p-3">Tên Đội (Mã)</th>
                                <th className="p-3">Sân Vận Động</th>
                                <th className="p-3">HLV</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {teams.map((team) => (
                                <tr key={team.id} className="hover:bg-gray-50 transition">
                                    <td className="p-3 font-bold text-gray-500 text-center">#{team.id}</td>
                                    <td className="p-3 text-center">
                                        <img src={team.logo ? `${API_URL}${team.logo}` : 'https://placehold.co/40'} 
                                             className="w-10 h-10 object-contain mx-auto" alt="logo"/>
                                    </td>
                                    <td className="p-3 font-bold text-slate-700">
                                        {team.name} <span className="text-xs text-gray-400">({team.shortName})</span>
                                    </td>
                                    <td className="p-3 text-gray-600">{team.stadium}</td>
                                    <td className="p-3 text-gray-600">{team.coachName || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {teams.length === 0 && <p className="text-center p-10 text-gray-400 italic">Chưa có đội bóng nào.</p>}
                </div>
            </div>
        </div>
    );
};