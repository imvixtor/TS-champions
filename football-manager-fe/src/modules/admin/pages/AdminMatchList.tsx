import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Link } from 'react-router-dom';

export const AdminMatchList = () => {
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        // Gọi API lấy tất cả trận (hoặc theo tuần)
        axiosClient.get('/champions/public/matches/weekly').then(res => setMatches(res.data));
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">QUẢN LÝ TRẬN ĐẤU</h1>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 whitespace-nowrap">Thời gian</th>
                                <th className="p-4 whitespace-nowrap">Cặp đấu</th>
                                <th className="p-4 whitespace-nowrap text-center">Trạng thái</th>
                                <th className="p-4 whitespace-nowrap text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {matches.map(m => (
                                <tr key={m.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-sm whitespace-nowrap">
                                        {new Date(m.matchDate).toLocaleDateString()} <br/>
                                        <span className="text-gray-500 text-xs">{new Date(m.matchDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                                        {m.homeTeam} <span className="text-gray-400 font-normal mx-2">vs</span> {m.awayTeam}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold 
                                            ${m.status==='LIVE' ? 'bg-red-100 text-red-600 animate-pulse' : 
                                              m.status==='FINISHED' ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        {m.status !== 'FINISHED' && (
                                            <Link to={`/admin/matches/${m.id}/console`} 
                                                className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition">
                                                Điều khiển
                                            </Link>
                                        )}
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