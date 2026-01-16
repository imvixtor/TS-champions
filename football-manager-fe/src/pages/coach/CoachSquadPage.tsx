import { useEffect, useState } from 'react';
import { playerService } from '../../services';
import { useAuth } from '../../hooks';
import { getImageUrl } from '../../utils';

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Shirt, AlertCircle } from "lucide-react"

export const CoachSquadPage = () => {
    const { user } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy teamId từ user (Coach)
    const myTeamId = (user as any)?.teamId;

    useEffect(() => {
        if (myTeamId) {
            playerService.getPlayersByTeam(myTeamId)
                .then(data => setPlayers(data))
                .catch(err => console.error("Lỗi tải cầu thủ:", err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [myTeamId]);

    if (!myTeamId) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 animate-fade-in">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-slate-700">Chưa liên kết Đội bóng</h2>
            <p className="text-muted-foreground mt-2">Vui lòng liên hệ Admin để được cấp quyền.</p>
        </div>
    );

    return (
        <div className="animate-fade-in-up pb-20 max-w-7xl mx-auto p-6">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
                <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-lg shadow-emerald-200">
                    <Users className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                        Danh Sách Cầu Thủ
                    </h1>
                    <p className="text-muted-foreground font-medium">Quản lý thành viên đội bóng.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-600" />
                    <span className="font-bold">Đang tải danh sách...</span>
                </div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed text-muted-foreground flex flex-col items-center">
                    <Shirt className="w-12 h-12 mb-4 text-slate-300" />
                    Đội bóng chưa có cầu thủ nào.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map(p => (
                        <Card key={p.id} className="hover:shadow-md transition duration-200 border-slate-200 overflow-hidden">
                            <CardContent className="p-5 flex items-center gap-4">
                                {/* Avatar */}
                                <Avatar className="w-16 h-16 border-2 border-emerald-100 shrink-0">
                                    <AvatarImage src={getImageUrl(p.avatar)} className="object-cover" />
                                    <AvatarFallback className="font-bold text-emerald-700 bg-emerald-50 text-xl">{p.name.charAt(0)}</AvatarFallback>
                                </Avatar>

                                {/* Thông tin */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 truncate text-lg pr-2">{p.name}</h3>
                                        <span className="font-black text-emerald-600 text-lg flex items-center gap-0.5">
                                            <span className="text-xs text-emerald-300 font-normal mr-1">#</span>{p.shirtNumber}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 truncate">{p.nationality || 'Quốc tịch chưa cập nhật'}</p>

                                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border-0
                                        ${p.position === 'GK' ? 'bg-yellow-100 text-yellow-700' :
                                            p.position === 'FW' ? 'bg-red-100 text-red-700' :
                                                p.position === 'MF' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {p.position}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
