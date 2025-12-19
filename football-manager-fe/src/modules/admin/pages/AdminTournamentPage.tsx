import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';

export const AdminTournamentPage = () => {
    const [name, setName] = useState('');
    const [season, setSeason] = useState('2024-2025');
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const res = await axiosClient.get('/champions/public/tournaments');
            setTournaments(res.data);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axiosClient.post('/champions/tournament/create', { name, season });
            alert("✅ Tạo giải đấu thành công!");
            setName('');
            fetchTournaments();
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi tạo giải đấu (Kiểm tra API Backend)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Form Tạo */}
            <div className="md:col-span-4 bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">🏆 TẠO GIẢI ĐẤU</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Tên Giải Đấu</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            required value={name} onChange={e => setName(e.target.value)} placeholder="Premier League" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Mùa Giải</label>
                        <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            required value={season} onChange={e => setSeason(e.target.value)} placeholder="2024-2025" />
                    </div>
                    <button disabled={loading} className="w-full bg-yellow-500 text-blue-900 py-2 rounded-lg font-bold hover:bg-yellow-400 shadow-lg">
                        {loading ? 'Đang tạo...' : 'TẠO GIẢI ĐẤU'}
                    </button>
                </form>
            </div>

            {/* Danh sách */}
            <div className="md:col-span-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">DANH SÁCH GIẢI ĐẤU</h2>
                <ul className="space-y-3">
                    {tournaments.map(t => (
                        <li key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border hover:bg-gray-100">
                            <div>
                                <span className="font-bold text-lg text-blue-900">{t.name}</span>
                                <span className="text-xs text-gray-500 block">Mùa: {t.season}</span>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">Active</span>
                        </li>
                    ))}
                    {tournaments.length === 0 && <p className="text-gray-400 italic">Chưa có giải đấu nào.</p>}
                </ul>
            </div>
        </div>
    );
};