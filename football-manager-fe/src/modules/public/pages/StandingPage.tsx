import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Navbar } from '../components/Navbar';

const API_URL = 'http://localhost:8080';

// --- HÀM XỬ LÝ ẢNH ---
const getImageUrl = (path: string | null) => {
    if (!path) return 'https://placehold.co/40';
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${API_URL}${cleanPath}`;
};

// --- INTERFACES ---
interface Tournament {
    id: number;
    name: string;
    season: string;
}

interface Standing {
    teamId: number;
    teamName: string;
    teamLogo: string;
    groupName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    gd: number;
    points: number;
}

export const StandingPage = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
    const [standings, setStandings] = useState<Standing[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Tải danh sách giải đấu
    useEffect(() => {
        axiosClient.get('/champions/public/tournaments')
            .then(res => {
                setTournaments(res.data);
                // Chọn giải đấu đầu tiên làm mặc định
                if (res.data.length > 0) setSelectedTourId(res.data[0].id);
            })
            .catch(err => console.error("Lỗi tải giải đấu:", err));
    }, []);

    // 2. Tải BXH khi chọn giải
    useEffect(() => {
        if (!selectedTourId) return;
        
        const fetchStandings = async () => {
            setLoading(true);
            try {
                // Gọi API lấy BXH (Lưu ý: API này trả về list phẳng tất cả các đội)
                const res = await axiosClient.get(`/champions/public/tournament/${selectedTourId}/standings`);
                setStandings(res.data);
            } catch (err) {
                console.error("Lỗi tải BXH:", err);
                setStandings([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchStandings();
    }, [selectedTourId]);

    // --- LOGIC GOM NHÓM (GROUP BY) ---
    // Chuyển List phẳng -> Object { "Group A": [...], "Group B": [...] }
    const groupedStandings = standings.reduce((acc, curr) => {
        const group = curr.groupName || 'Chưa Xếp Bảng'; // Nếu chưa chia bảng thì gom vào đây
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, Standing[]>);

    // Sắp xếp tên bảng theo thứ tự A, B, C...
    const sortedGroupNames = Object.keys(groupedStandings).sort();

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in-up">
                
                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Bảng Xếp Hạng</h1>
                        <p className="text-slate-500 font-medium">Cập nhật liên tục kết quả thi đấu.</p>
                    </div>
                    
                    <select 
                        className="bg-white border-2 border-gray-200 text-slate-800 font-bold py-2 px-4 rounded-xl shadow-sm outline-none focus:border-blue-600 transition w-full md:w-64"
                        onChange={(e) => setSelectedTourId(Number(e.target.value))}
                        value={selectedTourId || ''}
                    >
                        {tournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.season})</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Đang tải dữ liệu...</div>
                ) : standings.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                        <p className="text-gray-400 text-lg">Chưa có dữ liệu bảng xếp hạng cho giải đấu này.</p>
                    </div>
                ) : (
                    // Grid hiển thị các bảng đấu (2 cột trên màn hình lớn)
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {sortedGroupNames.map((groupName) => (
                            <div key={groupName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 h-fit">
                                {/* Header Tên Bảng */}
                                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="text-yellow-400 text-xl">🏆</span> {groupName}
                                    </h3>
                                    <span className="text-xs bg-slate-700 px-2 py-1 rounded font-mono text-gray-300">
                                        {groupedStandings[groupName].length} Teams
                                    </span>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-wider">
                                            <tr>
                                                <th className="p-3 pl-4 w-10">#</th>
                                                <th className="p-3">Câu lạc bộ</th>
                                                <th className="p-3 text-center w-10" title="Played">P</th>
                                                <th className="p-3 text-center w-10" title="Won">W</th>
                                                <th className="p-3 text-center w-10" title="Drawn">D</th>
                                                <th className="p-3 text-center w-10" title="Lost">L</th>
                                                <th className="p-3 text-center w-12" title="Goal Difference">GD</th>
                                                <th className="p-3 text-center w-12 text-slate-900 bg-gray-100">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {groupedStandings[groupName].map((team, index) => (
                                                <tr key={team.teamId} className="group hover:bg-blue-50 transition-colors">
                                                    {/* Vị trí (Top 2 màu xanh) */}
                                                    <td className="p-3 pl-4">
                                                        <span className={`flex items-center justify-center w-6 h-6 rounded font-bold text-xs 
                                                            ${index < 2 ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                            {index + 1}
                                                        </span>
                                                    </td>
                                                    
                                                    {/* Thông tin đội */}
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={getImageUrl(team.teamLogo)} 
                                                                className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
                                                                alt={team.teamName}
                                                                onError={(e)=>e.currentTarget.src='https://placehold.co/20'}
                                                            />
                                                            <span className="font-bold text-slate-700">{team.teamName}</span>
                                                        </div>
                                                    </td>

                                                    {/* Chỉ số */}
                                                    <td className="p-3 text-center font-medium text-gray-600">{team.played}</td>
                                                    <td className="p-3 text-center text-gray-500">{team.won}</td>
                                                    <td className="p-3 text-center text-gray-500">{team.drawn}</td>
                                                    <td className="p-3 text-center text-gray-500">{team.lost}</td>
                                                    
                                                    {/* Hiệu số bàn thắng */}
                                                    <td className={`p-3 text-center font-bold ${team.gd > 0 ? 'text-green-600' : team.gd < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                                    </td>
                                                    
                                                    {/* Điểm số */}
                                                    <td className="p-3 text-center font-black text-slate-800 text-base bg-gray-50 group-hover:bg-blue-100 transition-colors">
                                                        {team.points}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};