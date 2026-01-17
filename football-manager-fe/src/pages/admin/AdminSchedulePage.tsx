import { useEffect, useState, useMemo } from 'react';
import { publicService, teamService, matchService } from '../../services';
import type { TournamentBasic, Team } from '../../types';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Calendar, MapPin, ArrowRightLeft, Trophy, Info } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export const AdminSchedulePage = () => {
    // Data List
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);

    // Form State
    const [tournamentId, setTournamentId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [stadium, setStadium] = useState('');
    const [roundName, setRoundName] = useState('Vòng 1');
    const [loading, setLoading] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tourData, teamData] = await Promise.all([
                    publicService.getTournaments(),
                    teamService.getAllTeams()
                ]);
                setTournaments(tourData);
                setTeams(teamData);
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    // LOGIC THÔNG MINH 1: Tự động điền sân vận động khi chọn Đội Nhà
    useEffect(() => {
        if (homeTeamId && teams.length > 0) {
            const homeTeam = teams.find(t => t.id === Number(homeTeamId));
            // Chỉ tự điền nếu ô Stadium đang trống hoặc đang chứa sân của đội nhà cũ
            if (homeTeam) setStadium(homeTeam.stadium);
        }
    }, [homeTeamId, teams]);

    // LOGIC THÔNG MINH 2: Tìm object đội bóng để hiển thị Preview
    const selectedHomeTeam = useMemo(() => teams.find(t => t.id === Number(homeTeamId)), [homeTeamId, teams]);
    const selectedAwayTeam = useMemo(() => teams.find(t => t.id === Number(awayTeamId)), [awayTeamId, teams]);
    const selectedTournament = useMemo(() => tournaments.find(t => t.id === Number(tournamentId)), [tournamentId, tournaments]);

    // LOGIC THÔNG MINH 3: Hoán đổi Đội Nhà <-> Đội Khách
    const handleSwapTeams = () => {
        if (!homeTeamId && !awayTeamId) return;
        const temp = homeTeamId;
        setHomeTeamId(awayTeamId);
        setAwayTeamId(temp);
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Ngày đá không được trong quá khứ
        if (new Date(matchDate) < new Date()) {
            return alert("⚠️ Ngày thi đấu không thể ở trong quá khứ!");
        }

        if (homeTeamId === awayTeamId) return alert("❌ Đội nhà và Đội khách không được trùng nhau!");

        setLoading(true);
        try {
            const payload = {
                tournamentId: Number(tournamentId),
                homeTeamId: Number(homeTeamId),
                awayTeamId: Number(awayTeamId),
                matchDate,
                stadium,
                roundName
            };

            await matchService.createMatch(payload);
            alert("✅ Lên lịch trận đấu thành công!");

            // Reset form thông minh (Giữ lại giải đấu và vòng để nhập tiếp cho nhanh)
            setHomeTeamId('');
            setAwayTeamId('');
            setIsFormModalOpen(false); // Đóng modal
            // setTournamentId(''); // Không reset giải đấu
            // setRoundName('');    // Không reset vòng đấu
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi lên lịch! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 w-full p-4 animate-fade-in-up">

            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Lên Lịch Thi Đấu</h2>
                    <p className="text-muted-foreground">Tạo lịch thi đấu mới cho các giải đấu.</p>
                </div>
                <Button onClick={() => setIsFormModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Thiết Lập Trận Đấu
                </Button>
            </div>

            {/* LIVE PREVIEW (XEM TRƯỚC) */}
            <div className="w-full">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Info className="w-4 h-4" /> Xem trước hiển thị
                    </h3>

                    {/* THẺ TRẬN ĐẤU (PREVIEW CARD) */}
                    <Card className="overflow-hidden border-2 border-slate-100 shadow-lg">
                        {/* Header của thẻ */}
                        <div className="bg-slate-900 text-white p-4 text-center">
                            <div className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
                                <Trophy className="w-4 h-4" />
                                {selectedTournament ? selectedTournament.name : 'Chưa chọn giải'}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                                {roundName || 'Vòng ?'}
                            </div>
                        </div>

                        {/* Nội dung chính: Đội bóng */}
                        <CardContent className="p-8 relative">
                            {/* Background mờ */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-slate-50/50 pointer-events-none"></div>

                            <div className="flex items-center justify-between relative z-10">
                                {/* Đội Nhà */}
                                <div className="flex flex-col items-center w-1/3 text-center space-y-2">
                                    <div className="w-20 h-20 bg-white rounded-full p-2 shadow-sm flex items-center justify-center border border-slate-100">
                                        <img src={getImageUrl(selectedHomeTeam?.logoUrl || null)} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/60'} />
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm leading-tight">
                                        {selectedHomeTeam ? selectedHomeTeam.name : 'Home Team'}
                                    </div>
                                </div>

                                {/* VS */}
                                <div className="flex flex-col items-center w-1/3 space-y-2">
                                    <div className="text-3xl font-black text-slate-200">VS</div>
                                    {matchDate && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-mono text-[10px]">
                                            {new Date(matchDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </Badge>
                                    )}
                                </div>

                                {/* Đội Khách */}
                                <div className="flex flex-col items-center w-1/3 text-center space-y-2">
                                    <div className="w-20 h-20 bg-white rounded-full p-2 shadow-sm flex items-center justify-center border border-slate-100">
                                        <img src={getImageUrl(selectedAwayTeam?.logoUrl || null)} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/60'} />
                                    </div>
                                    <div className="font-bold text-slate-800 text-sm leading-tight">
                                        {selectedAwayTeam ? selectedAwayTeam.name : 'Away Team'}
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        {/* Footer của thẻ: Thông tin ngày giờ */}
                        <Separator />
                        <CardFooter className="bg-slate-50 p-3 flex justify-center">
                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground font-medium">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {matchDate ? new Date(matchDate).toLocaleDateString('vi-VN') : '--/--/----'}
                                </div>
                                <div className="h-4 w-px bg-slate-200"></div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {stadium || 'Chưa xác định sân'}
                                </div>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Hướng dẫn nhanh */}
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-xs text-blue-900 space-y-2">
                        <p className="font-bold flex items-center gap-2">💡 Mẹo quản trị viên:</p>
                        <ul className="list-disc pl-4 space-y-1 opacity-80">
                            <li>Chọn đội nhà trước, sân vận động sẽ tự điền.</li>
                            <li>Dùng nút <ArrowRightLeft className="w-3 h-3 inline" /> ở giữa để đổi sân nhà/khách nhanh.</li>
                            <li>Kiểm tra kỹ ngày giờ trước khi lưu.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODAL THIẾT LẬP TRẬN ĐẤU */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Thiết Lập Trận Đấu
                        </DialogTitle>
                        <DialogDescription>
                            Tạo lịch thi đấu mới cho các giải đấu.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSchedule} className="space-y-6">
                        {/* 1. Giải Đấu & Vòng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Giải Đấu</Label>
                                <Select value={tournamentId} onValueChange={setTournamentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Chọn giải đấu --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tournaments.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>{t.name} ({t.season})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tên Vòng Đấu</Label>
                                <Input value={roundName} onChange={e => setRoundName(e.target.value)} placeholder="VD: Vòng 1, Chung kết" />
                            </div>
                        </div>

                        {/* 2. Chọn Đội (Khu vực thông minh) */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative">
                            {/* Nút Swap nằm giữa */}
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={handleSwapTeams}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm bg-white hover:bg-slate-50 hover:rotate-180 transition-transform duration-300 z-10"
                                title="Hoán đổi đội nhà/khách"
                            >
                                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                            </Button>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Đội Nhà */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-blue-800">
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span> Đội Nhà (Home)
                                    </Label>
                                    <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                                        <SelectTrigger className="border-blue-200 focus:ring-blue-200 bg-white">
                                            <SelectValue placeholder="-- Chọn đội nhà --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Đội Khách */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-red-800">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Đội Khách (Away)
                                    </Label>
                                    <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                                        <SelectTrigger className="border-red-200 focus:ring-red-200 bg-white">
                                            <SelectValue placeholder="-- Chọn đội khách --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teams.map(t => (
                                                <SelectItem key={t.id} value={String(t.id)} disabled={String(t.id) === homeTeamId}>
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Thời gian & Sân */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Ngày giờ thi đấu</Label>
                                <Input
                                    type="datetime-local"
                                    value={matchDate} onChange={e => setMatchDate(e.target.value)}
                                    required
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sân vận động</Label>
                                <Input
                                    value={stadium} onChange={e => setStadium(e.target.value)}
                                    placeholder="Tự động điền theo đội nhà..."
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Lưu Lịch Thi Đấu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
