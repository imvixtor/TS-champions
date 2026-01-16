import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { playerService } from '../../services';
import { useAuth } from '../../hooks';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, UserPlus, UserMinus, X, Shield, Users } from "lucide-react"


export const CoachLineupPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Lấy ID từ URL (VD: ?teamId=1)
    const teamId = searchParams.get('teamId') || (user as any)?.teamId;

    // --- STATE ---
    const [allPlayers, setAllPlayers] = useState<any[]>([]);

    // MỚI: Chế độ sân (7 hoặc 11)
    const [gameMode, setGameMode] = useState<7 | 11>(11);

    const [starters, setStarters] = useState<any[]>([]);
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load cầu thủ
    useEffect(() => {
        if (teamId) {
            setLoading(true);
            playerService.getPlayersByTeam(teamId)
                .then(data => setAllPlayers(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [teamId]);

    // --- LOGIC DI CHUYỂN CẦU THỦ ---

    // 1. Chọn đá chính
    const moveToStarter = (player: any) => {
        // Kiểm tra giới hạn dựa trên GameMode
        if (starters.length >= gameMode) {
            alert(`⚠️ Đã đủ ${gameMode} cầu thủ đá chính cho sân ${gameMode}!`);
            return;
        }
        if (starters.find(p => p.id === player.id)) return;

        // Xóa khỏi danh sách dự bị (nếu có)
        setSubs(subs.filter(p => p.id !== player.id));
        // Thêm vào đá chính
        setStarters([...starters, player]);
    };

    // 2. Chọn dự bị
    const moveToSub = (player: any) => {
        if (subs.find(p => p.id === player.id)) return;

        // Xóa khỏi đá chính (nếu có)
        setStarters(starters.filter(p => p.id !== player.id));
        // Thêm vào dự bị
        setSubs([...subs, player]);
    };

    // 3. Hủy chọn (Về danh sách chờ)
    const removeFromSquad = (player: any) => {
        setStarters(starters.filter(p => p.id !== player.id));
        setSubs(subs.filter(p => p.id !== player.id));
    };

    // --- XỬ LÝ LƯU ---
    const handleSaveLineup = async () => {
        // MỚI: Validate linh hoạt theo GameMode
        if (starters.length !== gameMode) {
            alert(`❌ Vui lòng chọn đủ ${gameMode} cầu thủ đá chính (Hiện tại: ${starters.length})`);
            return;
        }

        if (subs.length === 0 && !confirm("Bạn chưa chọn cầu thủ dự bị nào. Tiếp tục?")) return;

        alert(`✅ Đã lưu đội hình (Sân ${gameMode}): ${starters.length} chính, ${subs.length} dự bị!`);
        // Gọi API lưu xuống database tại đây (nếu có API)
        // await axiosClient.post('/lineup/save', { matchId, starters, subs });
        navigate('/coach/matches');
    };

    // Lọc danh sách cầu thủ chưa được chọn
    const availablePlayers = allPlayers.filter(p =>
        !starters.find(s => s.id === p.id) &&
        !subs.find(s => s.id === p.id)
    );

    return (
        <div className="p-4 md:p-6 animate-fade-in-up pb-20 max-w-[1600px] mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" /> Đăng Ký Đội Hình
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Kéo thả hoặc bấm để chọn cầu thủ cho trận đấu sắp tới.</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* --- MỚI: BỘ CHUYỂN ĐỔI CHẾ ĐỘ SÂN --- */}
                    <Tabs value={String(gameMode)} onValueChange={(v) => {
                        const newMode = Number(v) as 7 | 11;
                        setGameMode(newMode);
                        if (starters.length > newMode) alert(`⚠️ Chú ý: Số cầu thủ đang vượt quá ${newMode} người!`);
                    }} className="w-[200px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="7">Sân 7</TabsTrigger>
                            <TabsTrigger value="11">Sân 11</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <Button
                        onClick={handleSaveLineup}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu Đội Hình
                    </Button>
                </div>
            </div>

            {/* MAIN CONTENT - 3 CỘT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

                {/* CỘT 1: DANH SÁCH CHỜ */}
                <Card className="flex flex-col overflow-hidden border-slate-200 shadow-sm h-full">
                    <CardHeader className="bg-slate-50 border-b py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                                <Users className="w-4 h-4" /> Danh sách cầu thủ
                            </CardTitle>
                            <Badge variant="secondary" className="bg-slate-200 text-slate-700">{availablePlayers.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-2">
                            {loading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
                            ) : availablePlayers.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-sm italic">Không còn cầu thủ nào.</div>
                            ) : (
                                <div className="space-y-2">
                                    {availablePlayers.map(p => (
                                        <div key={p.id} onClick={() => moveToStarter(p)}
                                            className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-emerald-200 hover:bg-emerald-50 cursor-pointer transition group relative bg-white shadow-sm">
                                            <Avatar className="w-10 h-10 border border-slate-100">
                                                <AvatarImage src={getImageUrl(p.avatar)} className="object-cover" />
                                                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">{p.name}</div>
                                                <div className="text-xs text-muted-foreground font-mono">#{p.shirtNumber} • {p.position}</div>
                                            </div>
                                            <Badge variant="outline" className="ml-auto opacity-0 group-hover:opacity-100 text-emerald-600 border-emerald-200 bg-white">
                                                <UserPlus className="w-3 h-3 mr-1" /> Đá chính
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* CỘT 2: ĐÁ CHÍNH (STARTERS) */}
                <Card className="flex flex-col overflow-hidden border-2 border-emerald-500 shadow-lg h-full relative">
                    <CardHeader className="bg-emerald-600 text-white border-b border-emerald-700 py-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                🔥 Đội Hình Ra Sân (Sân {gameMode})
                            </CardTitle>
                            <Badge variant={starters.length === gameMode ? "secondary" : "destructive"} className={`font-mono ${starters.length !== gameMode ? 'animate-pulse' : ''}`}>
                                {starters.length} / {gameMode}
                            </Badge>
                        </div>
                    </CardHeader>

                    {/* Hình sân cỏ mờ làm nền (CSS background would be better but simple div works) */}
                    <div className="absolute inset-0 top-14 bg-emerald-50 opacity-30 pointer-events-none"
                        style={{ backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                    </div>

                    <CardContent className="p-0 flex-1 overflow-hidden relative z-10">
                        <ScrollArea className="h-full p-2">
                            {starters.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50">
                                    <Shield className="w-12 h-12 mb-2" />
                                    <span className="text-sm italic">Chọn cầu thủ từ danh sách bên trái</span>
                                </div>
                            )}
                            <div className="space-y-2">
                                {starters.map((p, index) => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-emerald-100 shadow-sm hover:shadow-md transition">
                                        <div className="font-black text-emerald-200 text-xl w-6 text-center">{index + 1}</div>
                                        <Avatar className="w-10 h-10 border-2 border-emerald-100">
                                            <AvatarImage src={getImageUrl(p.avatar)} className="object-cover" />
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-slate-800">{p.name}</div>
                                            <div className="text-xs text-emerald-600 font-bold">{p.position}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600 hover:bg-blue-100 hover:text-blue-700" onClick={() => moveToSub(p)} title="Đẩy xuống dự bị">
                                                <UserMinus className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:bg-red-100 hover:text-red-500" onClick={() => removeFromSquad(p)} title="Loại khỏi đội hình">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* CỘT 3: DỰ BỊ (SUBS) */}
                <Card className="flex flex-col overflow-hidden border-slate-200 shadow-sm h-full">
                    <CardHeader className="bg-blue-50 border-b border-blue-100 py-3">
                        <div className="flex justify-between items-center text-blue-900">
                            <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                                🛡️ Cầu thủ dự bị
                            </CardTitle>
                            <Badge variant="secondary" className="bg-blue-200 text-blue-800 hover:bg-blue-200">{subs.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                        <ScrollArea className="h-full p-2">
                            {subs.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm italic">Chưa có cầu thủ dự bị nào</div>
                            )}
                            <div className="space-y-2">
                                {subs.map(p => (
                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 opacity-80 hover:opacity-100 transition">
                                        <Avatar className="w-10 h-10 grayscale">
                                            <AvatarImage src={getImageUrl(p.avatar)} className="object-cover" />
                                            <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm text-slate-600">{p.name}</div>
                                            <div className="text-xs text-slate-400">{p.position}</div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-100" onClick={() => moveToStarter(p)} title="Đưa lên đá chính">
                                                <UserPlus className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:bg-red-100 hover:text-red-500" onClick={() => removeFromSquad(p)} title="Loại khỏi đội hình">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};
