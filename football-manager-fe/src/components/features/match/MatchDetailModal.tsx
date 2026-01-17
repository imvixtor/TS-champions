import { useEffect, useState } from 'react';
import { publicService } from '../../../services';
import type { MatchDetailProps, MatchWithEvents, MatchEvent } from '../../../types';
import { getImageUrl } from '../../../utils';
import { Circle, Square, Calendar, Building2, Loader2, X } from "lucide-react";

// Component Icon sự kiện
const EventIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'GOAL': 
            return <Circle className="w-5 h-5 text-green-600 fill-green-600" />;
        case 'YELLOW_CARD': 
            return <Square className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
        case 'RED_CARD': 
            return <Square className="w-5 h-5 text-red-600 fill-red-600" />;
        default: 
            return <span className="w-2 h-2 rounded-full bg-gray-400" />;
    }
};

export const MatchDetailModal = ({ matchId, onClose }: MatchDetailProps) => {
    const [match, setMatch] = useState<MatchWithEvents | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API public để lấy chi tiết trận đấu + events
        publicService.getMatchDetail(matchId)
            .then(data => setMatch(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [matchId]);

    // Đóng modal khi bấm ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!matchId) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            {/* Click vào nội dung modal không bị đóng */}
            <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                
                {/* Nút đóng */}
                <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition">
                    <X className="w-6 h-6" />
                </button>

                {loading ? (
                    <div className="p-12 text-center text-gray-500 font-bold flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span>Đang tải chi tiết...</span>
                    </div>
                ) : match ? (
                    <>
                        {/* 1. HEADER TỈ SỐ (Banner) */}
                        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8 relative overflow-hidden text-center">
                            
                            <div className="flex justify-between items-center relative z-10">
                                {/* Đội Nhà */}
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center p-2 backdrop-blur-md shadow-lg">
                                        <img src={getImageUrl(match.homeLogo)} className="w-full h-full object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/40'}/>
                                    </div>
                                    <h2 className="font-bold text-lg md:text-xl uppercase tracking-wide">{match.homeTeam}</h2>
                                </div>

                                {/* Tỉ số & Info */}
                                <div className="mx-2 flex flex-col items-center">
                                    <span className="text-xs font-bold bg-black/30 px-3 py-1 rounded-full mb-3 border border-white/10">
                                        {match.status === 'FINISHED' ? 'KẾT THÚC' : match.status === 'IN_PROGRESS' ? 'ĐANG ĐÁ' : 'SẮP DIỄN RA'}
                                    </span>
                                    
                                    <div className="text-5xl md:text-6xl font-black tracking-tighter flex items-center gap-4 bg-white/5 px-6 py-2 rounded-xl border border-white/10 shadow-inner">
                                        <span className="text-blue-200">{match.homeScore}</span>
                                        <span className="text-2xl opacity-40 font-light">:</span>
                                        <span className="text-red-200">{match.awayScore}</span>
                                    </div>
                                    
                                    <div className="text-xs text-blue-200 mt-3 flex items-center gap-2 opacity-80">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(match.matchDate).toLocaleDateString()}
                                        </span>
                                        <span>|</span>
                                        <span className="flex items-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {match.stadium || 'Sân vận động'}
                                        </span>
                                    </div>
                                </div>

                                {/* Đội Khách */}
                                <div className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center p-2 backdrop-blur-md shadow-lg">
                                        <img src={getImageUrl(match.awayLogo)} className="w-full h-full object-contain" onError={(e)=>e.currentTarget.src='https://placehold.co/40'}/>
                                    </div>
                                    <h2 className="font-bold text-lg md:text-xl uppercase tracking-wide">{match.awayTeam}</h2>
                                </div>
                            </div>
                        </div>

                        {/* 2. TIMELINE DIỄN BIẾN */}
                        <div className="p-6 bg-slate-50 min-h-[300px] max-h-[50vh] overflow-y-auto custom-scrollbar">
                            <h3 className="text-center font-bold text-slate-400 uppercase text-xs tracking-widest mb-6 border-b border-gray-200 pb-2">
                                Diễn biến trận đấu
                            </h3>
                            
                            <div className="space-y-4 relative">
                                {/* Đường kẻ trục giữa */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 rounded-full"></div>

                                {match.events && match.events.length > 0 ? (
                                    match.events.map((evt: MatchEvent, idx: number) => {
                                        const isHomeEvent = evt.teamId === match.homeTeamId;
                                        return (
                                            <div key={idx} className={`flex items-center w-full ${isHomeEvent ? 'flex-row' : 'flex-row-reverse'}`}>
                                                
                                                {/* Nội dung sự kiện */}
                                                <div className={`w-[45%] flex items-center gap-3 ${isHomeEvent ? 'justify-end pr-4 text-right' : 'justify-end pl-4 text-left flex-row-reverse'}`}>
                                                    <div>
                                                        <div className="font-bold text-slate-800 text-sm">
                                                            {evt.playerName} 
                                                            <span className="text-xs text-gray-400 font-normal ml-1">(#{evt.playerNumber})</span>
                                                        </div>
                                                        <div className={`text-[10px] uppercase font-bold tracking-wide ${evt.type === 'GOAL' ? 'text-green-600' : 'text-orange-500'}`}>
                                                            {evt.type === 'GOAL' ? 'Ghi bàn' : evt.type === 'YELLOW_CARD' ? 'Thẻ vàng' : 'Thẻ đỏ'}
                                                        </div>
                                                    </div>
                                                    <div className="text-2xl drop-shadow-sm filter"><EventIcon type={evt.type} /></div>
                                                </div>

                                                {/* Phút thi đấu (Trục giữa) */}
                                                <div className="relative z-10 w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center shadow-sm">
                                                    {evt.minute}'
                                                </div>

                                                {/* Khoảng trống bên kia */}
                                                <div className="w-[45%]"></div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center text-gray-400 italic text-sm py-10 bg-white rounded-lg border border-dashed">
                                        (Chưa có diễn biến nào được ghi nhận)
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center text-red-500">Không tìm thấy dữ liệu trận đấu.</div>
                )}
            </div>
        </div>
    );
};
