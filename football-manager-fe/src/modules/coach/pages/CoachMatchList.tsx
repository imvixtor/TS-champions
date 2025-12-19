import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/context/useAuth';

export const CoachMatchList = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Tạm thời lấy list chung. Đúng ra nên có API /coach/my-matches
        axiosClient.get('/champions/public/matches/weekly').then(res => setMatches(res.data));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">COACH DASHBOARD</h1>
                        <p className="text-gray-500">Xin chào, {user?.username}</p>
                    </div>
                    <button onClick={() => {logout(); navigate('/login')}} className="text-sm text-red-600 font-bold hover:underline">Đăng xuất</button>
                </div>

                <h2 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wide">Lịch thi đấu & Đăng ký</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.filter(m => m.status === 'SCHEDULED').map(m => (
                        <div key={m.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                    {new Date(m.matchDate).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400 text-xs font-bold">{m.stadium}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-slate-800 mb-1 text-center">
                                {m.homeTeam} <span className="text-gray-300 mx-1">vs</span> {m.awayTeam}
                            </h3>
                            <p className="text-center text-gray-500 text-sm mb-6">
                                {new Date(m.matchDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>

                            <Link to={`/coach/match/${m.id}/lineup`} 
                                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition">
                                Đăng ký Đội hình
                            </Link>
                        </div>
                    ))}
                    {matches.filter(m => m.status === 'SCHEDULED').length === 0 && (
                        <p className="text-gray-500 italic">Không có trận đấu nào sắp diễn ra.</p>
                    )}
                </div>
            </div>
        </div>
    );
};