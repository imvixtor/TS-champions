import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';

export const AdminSchedulePage = () => {
    // Data List
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    
    // Form State
    const [tournamentId, setTournamentId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [matchDate, setMatchDate] = useState(''); // Định dạng datetime-local
    const [stadium, setStadium] = useState('');
    const [roundName, setRoundName] = useState('Vòng 1');
    const [loading, setLoading] = useState(false);

    // Load dữ liệu ban đầu
    useEffect(() => {
        axiosClient.get('/champions/public/tournaments').then(res => setTournaments(res.data));
        axiosClient.get('/champions/team').then(res => setTeams(res.data));
    }, []);

    // Tự động điền sân vận động khi chọn đội nhà
    useEffect(() => {
        if (homeTeamId) {
            const homeTeam = teams.find(t => t.id === Number(homeTeamId));
            if (homeTeam) setStadium(homeTeam.stadium);
        }
    }, [homeTeamId, teams]);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (homeTeamId === awayTeamId) return alert("❌ Đội nhà và Đội khách không được trùng nhau!");
        
        setLoading(true);
        try {
            const payload = {
                tournamentId: Number(tournamentId),
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
                matchDate: matchDate, // Gửi chuỗi ISO (VD: 2025-12-20T19:30)
                stadium,
                roundName
            };

            await axiosClient.post('/champions/match/create', payload);
            alert("✅ Lên lịch trận đấu thành công!");
            
            // Reset một số trường
            setAwayTeamId('');
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi lên lịch! Kiểm tra Backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center border-b pb-4">📅 LÊN LỊCH THI ĐẤU</h2>
            
            <form onSubmit={handleSchedule} className="space-y-6">
                
                {/* Chọn Giải Đấu */}
                <div>
                    <label className="block font-bold text-gray-700 mb-1">Giải Đấu</label>
                    <select className="w-full border p-3 rounded-lg bg-white" required
                        value={tournamentId} onChange={e => setTournamentId(e.target.value)}>
                        <option value="">-- Chọn giải đấu --</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.season})</option>)}
                    </select>
                </div>

                {/* Chọn 2 Đội */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg">
                    <div>
                        <label className="block font-bold text-blue-900 mb-1">Đội Nhà (Home)</label>
                        <select className="w-full border p-3 rounded-lg bg-white" required
                            value={homeTeamId} onChange={e => setHomeTeamId(e.target.value)}>
                            <option value="">-- Chọn đội nhà --</option>
                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block font-bold text-red-900 mb-1">Đội Khách (Away)</label>
                        <select className="w-full border p-3 rounded-lg bg-white" required
                            value={awayTeamId} onChange={e => setAwayTeamId(e.target.value)}>
                            <option value="">-- Chọn đội khách --</option>
                            {teams.map(t => (
                                <option key={t.id} value={t.id} disabled={t.id === Number(homeTeamId)}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Thời gian & Sân */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Ngày giờ thi đấu</label>
                        <input type="datetime-local" className="w-full border p-3 rounded-lg" required
                            value={matchDate} onChange={e => setMatchDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="block font-bold text-gray-700 mb-1">Sân vận động</label>
                        <input className="w-full border p-3 rounded-lg" required
                            value={stadium} onChange={e => setStadium(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className="block font-bold text-gray-700 mb-1">Vòng đấu</label>
                    <input className="w-full border p-3 rounded-lg" 
                        value={roundName} onChange={e => setRoundName(e.target.value)} placeholder="Vòng bảng, Bán kết..." />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg text-lg">
                    {loading ? 'Đang lưu...' : 'LƯU LỊCH THI ĐẤU'}
                </button>
            </form>
        </div>
    );
};