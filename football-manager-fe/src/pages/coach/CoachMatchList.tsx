import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService } from '../../services';
import { useAuth } from '../../hooks';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Calendar, MapPin, Shirt, AlertCircle } from "lucide-react"

export const CoachMatchList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Lấy teamId từ user
    const myTeamId = (user as any)?.teamId;

    // --- SỬA 1: Logic Loading thông minh hơn ---
    // Nếu chưa có teamId thì không cần loading làm gì cả
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(!!myTeamId);

    useEffect(() => {
        // --- SỬA 2: Chỉ gọi API khi có teamId ---
        if (myTeamId) {
            setLoading(true);
            matchService.getMatchesByTeam(myTeamId)
                .then(data => setMatches(data))
                .catch(err => {
                    console.error(err);
                    // Có thể set error state ở đây nếu API lỗi
                })
                .finally(() => setLoading(false));
        }
    }, [myTeamId]);

    // --- SỬA 3: Xử lý lỗi "Không có Team" ngay tại đây (Early Return) ---
    // Không cần dùng useEffect để set errorMsg, cứ hiển thị luôn nếu thiếu ID
    if (!myTeamId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in">
                <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold text-slate-700">Chưa liên kết Đội bóng</h2>
                <p className="text-muted-foreground mt-2">
                    Tài khoản của bạn chưa được gán vào đội bóng nào.<br />
                    Vui lòng liên hệ Admin để được cấp quyền.
                </p>
            </div>
        );
    }

    // --- Giao diện chính (Khi đã có TeamID) ---
    return (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in-up font-sans">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
                <div className="bg-blue-600 text-white p-3 rounded-lg shadow-lg shadow-blue-200">
                    <Calendar className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Lịch Thi Đấu Đội Nhà
                    </h1>
                    <p className="text-muted-foreground font-medium">Quản lý và đăng ký đội hình cho các trận đấu.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
                    <span className="font-bold">Đang tải dữ liệu...</span>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed text-muted-foreground">
                    Chưa có trận đấu nào được lên lịch.
                </div>
            ) : (
                <div className="grid gap-6">
                    {matches.map(match => {
                        const isMyHome = match.homeTeamId === myTeamId;
                        return (
                            <Card key={match.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                <CardHeader className="bg-slate-50 border-b pb-3 pt-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(match.matchDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {match.stadium || 'Sân chưa cập nhật'}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                                        {/* Thông tin 2 đội */}
                                        <div className="flex-1 flex items-center justify-center gap-6 md:gap-12 w-full">
                                            <div className={`text-center flex flex-col items-center gap-2 ${isMyHome ? 'order-1' : 'order-3'} flex-1`}>
                                                <span className={`font-black text-xl md:text-2xl ${match.homeTeamId === myTeamId ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {match.homeTeam}
                                                </span>
                                                {match.homeTeamId === myTeamId && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">ĐỘI NHÀ</Badge>}
                                            </div>

                                            <div className="order-2 text-3xl font-light text-slate-300">VS</div>

                                            <div className={`text-center flex flex-col items-center gap-2 ${isMyHome ? 'order-3' : 'order-1'} flex-1`}>
                                                <span className={`font-black text-xl md:text-2xl ${match.awayTeamId === myTeamId ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {match.awayTeam}
                                                </span>
                                                {match.awayTeamId === myTeamId && <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">ĐỘI NHÀ</Badge>}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="w-full md:w-auto flex justify-center mt-4 md:mt-0">
                                            {match.status === 'SCHEDULED' ? (
                                                <Button
                                                    onClick={() => navigate(`/coach/match/${match.id}/lineup?teamId=${myTeamId}`)}
                                                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md"
                                                >
                                                    <Shirt className="w-4 h-4 mr-2" />
                                                    Đăng Ký Đội Hình
                                                </Button>
                                            ) : (
                                                match.status === 'FINISHED' ? (
                                                    <Badge variant="secondary" className="px-4 py-2 text-sm bg-gray-100 text-gray-500 border-gray-200">Đã Kết Thúc</Badge>
                                                ) : (
                                                    <Badge className="px-4 py-2 text-sm bg-green-100 text-green-700 border-green-200 animate-pulse hover:bg-green-100">Đang Diễn Ra</Badge>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
