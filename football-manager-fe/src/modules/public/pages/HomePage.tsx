import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient'; // Dùng axiosClient đã config
import { Navbar } from '../components/Navbar';
import { MatchCard } from '../components/MatchCard';

export const HomePage = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API lấy lịch thi đấu tuần
        axiosClient.get('/champions/public/matches/weekly')
            .then(res => setMatches(res.data))
            .catch(err => console.error("Lỗi tải lịch:", err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="container mx-auto max-w-4xl px-4 py-8">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-8 shadow-lg text-center">
                    <h2 className="text-2xl font-bold uppercase">Lịch Thi Đấu Tuần Này</h2>
                    <p className="text-blue-100 mt-1 opacity-80">Cập nhật kết quả trực tuyến</p>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded shadow text-gray-500">
                        Tuần này không có trận đấu nào.
                    </div>
                ) : (
                    <div>
                        {matches.map(match => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};