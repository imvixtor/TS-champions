import { useEffect, useState } from 'react';
import axiosClient from '../../core/api/axiosClient';
import { Navbar } from '../components/Navbar';

const API_URL = 'http://localhost:8080';

export const StandingPage = () => {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
    const [standings, setStandings] = useState<any[]>([]);

    useEffect(() => {
        axiosClient.get('/champions/public/tournaments').then(res => {
            setTournaments(res.data);
            if (res.data.length > 0) setSelectedTourId(res.data[0].id);
        });
    }, []);

    useEffect(() => {
        if (selectedTourId) {
            axiosClient.get(`/champions/public/tournament/${selectedTourId}/standings`)
                .then(res => setStandings(res.data))
                .catch(err => console.error(err));
        }
    }, [selectedTourId]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="container mx-auto max-w-5xl px-4 py-8">
                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight border-l-4 border-blue-600 pl-3">
                        Bảng Xếp Hạng
                    </h1>
                    
                    <select 
                        className="w-full md:w-64 border border-gray-300 rounded-lg p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
                        onChange={(e) => setSelectedTourId(Number(e.target.value))}
                        value={selectedTourId || ''}
                    >
                        {tournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Table Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-4 text-center w-16">#</th>
                                    <th className="p-4">Câu lạc bộ</th>
                                    <th className="p-4 text-center w-20">Trận</th>
                                    <th className="p-4 text-center w-20">HS</th>
                                    <th className="p-4 text-center w-20 font-black text-slate-900">Điểm</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm md:text-base divide-y divide-gray-100">
                                {standings.map((row, index) => (
                                    <tr key={row.teamId} className={`hover:bg-blue-50 transition ${index < 4 ? 'bg-blue-50/30' : ''}`}>
                                        <td className="p-4 text-center font-bold text-slate-500">
                                            <span className={`inline-block w-8 h-8 leading-8 rounded-full ${index === 0 ? 'bg-yellow-400 text-yellow-900' : index < 4 ? 'bg-blue-100 text-blue-700' : ''}`}>
                                                {index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={row.teamLogo ? `${API_URL}${row.teamLogo}` : 'https://placehold.co/30'} 
                                                     className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm" alt="Logo"/>
                                                <span className="font-bold text-slate-800">{row.teamName}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-medium">{row.played}</td>
                                        <td className="p-4 text-center text-slate-500 font-medium">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                                        <td className="p-4 text-center font-black text-blue-700 text-lg">{row.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {standings.length === 0 && (
                        <div className="p-10 text-center text-slate-400 italic">Chưa có dữ liệu cho giải đấu này.</div>
                    )}
                </div>
            </main>
        </div>
    );
};