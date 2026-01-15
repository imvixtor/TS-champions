
const API_URL = 'http://localhost:8080';

export const MatchCard = ({ match }: { match: any }) => {
    const isLive = match.status === 'LIVE';
    
    const date = new Date(match.matchDate);
    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 p-5 mb-4 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
            
            {/* Thanh trang trí bên trái */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isLive ? 'bg-red-500' : 'bg-blue-500'} group-hover:w-2 transition-all`}></div>

            {/* Thông tin phụ: Ngày giờ & Sân */}
            <div className="flex justify-between items-center text-xs text-gray-400 mb-6 font-semibold uppercase tracking-wider pl-3">
                <span className="bg-gray-100 px-2 py-1 rounded">{match.roundName || 'Vòng bảng'}</span>
                <span>{dateStr} • {match.stadium || 'Sân vận động'}</span>
            </div>

            {/* NỘI DUNG CHÍNH: Flex-col cho mobile, Flex-row cho desktop */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 pl-2">
                
                {/* ĐỘI NHÀ (Trái/Trên) */}
                <div className="flex-1 flex flex-row-reverse md:flex-row items-center justify-end gap-3 w-full md:w-auto">
                    <span className="font-bold text-gray-800 text-lg md:text-xl md:text-right flex-1 md:flex-none">
                        {match.homeTeam}
                    </span>
                    <img 
                        src={match.homeLogo ? `${API_URL}${match.homeLogo}` : 'https://placehold.co/60'} 
                        className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-md" 
                        alt="Home" 
                    />
                </div>

                {/* TỈ SỐ (Giữa) */}
                <div className="w-full md:w-32 py-1 flex flex-col items-center justify-center bg-slate-50 md:bg-transparent rounded-lg">
                    {match.status === 'SCHEDULED' ? (
                        <div className="text-center">
                            <span className="text-2xl font-black text-slate-700 block tracking-tight">{timeStr}</span>
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full mt-1 inline-block uppercase">Sắp đá</span>
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className={`text-3xl md:text-4xl font-black ${isLive ? 'text-red-600' : 'text-slate-800'}`}>
                                {match.homeScore} - {match.awayScore}
                            </span>
                            {isLive ? (
                                <span className="text-[10px] text-red-600 font-bold animate-pulse block mt-1 uppercase">● Trực tiếp</span>
                            ) : (
                                <span className="text-[10px] text-gray-500 font-bold block mt-1 bg-gray-200 px-2 rounded-full uppercase">Kết thúc</span>
                            )}
                        </div>
                    )}
                </div>

                {/* ĐỘI KHÁCH (Phải/Dưới) */}
                <div className="flex-1 flex flex-row items-center justify-start gap-3 w-full md:w-auto">
                    <img 
                        src={match.awayLogo ? `${API_URL}${match.awayLogo}` : 'https://placehold.co/60'} 
                        className="w-10 h-10 md:w-14 md:h-14 object-contain drop-shadow-md" 
                        alt="Away" 
                    />
                    <span className="font-bold text-gray-800 text-lg md:text-xl text-left flex-1 md:flex-none">
                        {match.awayTeam}
                    </span>
                </div>
            </div>
        </div>
    );
};