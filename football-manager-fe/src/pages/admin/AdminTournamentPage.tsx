import { useEffect, useState } from 'react';
import { tournamentService, teamService } from '../../services';
import type { TeamBasic, Tournament, TournamentStanding } from '../../types';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Loader2,
    Plus,
    Trash2,
    Pencil,
    Trophy,
    Calendar,
    ChevronRight,
    ArrowLeft,
    Settings2,
    Dices,
    Star
} from "lucide-react"

export const AdminTournamentPage = () => {
    // --- STATE DATA ---
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [allTeams, setAllTeams] = useState<TeamBasic[]>([]); // Kho đội bóng
    const [standings, setStandings] = useState<TournamentStanding[]>([]); // Đội ĐÃ tham gia giải

    // --- STATE UI ---
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL'>('LIST');
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

    // --- FORM INPUTS (DÙNG CHUNG CHO TẠO VÀ SỬA) ---
    const [form, setForm] = useState({ name: '', season: '', startDate: '', endDate: '' });
    const [editingId, setEditingId] = useState<number | null>(null); // ID giải đang sửa (null = mode tạo)
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // --- STATE CHO CHỨC NĂNG CHI TIẾT ---
    const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]); // Đội được tích chọn để thêm
    const [groupCount, setGroupCount] = useState(4); // Số bảng muốn chia
    const [manualTeamId, setManualTeamId] = useState(''); // ID đội muốn chỉnh thủ công
    const [manualGroupName, setManualGroupName] = useState('Group A'); // Bảng đích

    // ================== 1. LOAD DỮ LIỆU BAN ĐẦU ==================
    useEffect(() => {
        fetchTournaments();
        fetchAllTeams();
    }, []);

    const fetchTournaments = async () => {
        try {
            const data = await tournamentService.getAllTournaments();
            setTournaments(data);
        } catch (e) { console.error("Lỗi tải giải đấu", e); }
    };

    const fetchAllTeams = async () => {
        try {
            const data = await teamService.getAllTeams();
            setAllTeams(data);
        } catch (e) { console.error("Lỗi tải đội bóng", e); }
    };

    const fetchStandings = async (tourId: number) => {
        try {
            const data = await tournamentService.getStandings(tourId);
            setStandings(data);
        } catch (error) {
            console.error("Lỗi tải bảng xếp hạng", error);
            setStandings([]);
        }
    };

    // ================== 2. CRUD GIẢI ĐẤU (CREATE / UPDATE / DELETE) ==================

    // 2.1. Xử lý Submit (Tạo mới HOẶC Cập nhật)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                // --- LOGIC CẬP NHẬT ---
                await tournamentService.updateTournament(editingId, form);
                alert("✅ Cập nhật giải đấu thành công!");
                handleCancelEdit(); // Reset form
            } else {
                // --- LOGIC TẠO MỚI ---
                await tournamentService.createTournament(form);
                alert("✅ Tạo giải đấu thành công!");
                setForm({ name: '', season: '', startDate: '', endDate: '' });
            }
            setIsFormModalOpen(false);
            fetchTournaments();
        } catch (error) {
            console.error(error);
            alert("❌ Đã có lỗi xảy ra! Kiểm tra console.");
        } finally {
            setLoading(false);
        }
    };

    // 2.2. Chuyển sang chế độ Sửa (Điền dữ liệu vào form)
    const handleEditClick = (tour: Tournament, e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn ko cho nhảy vào trang chi tiết
        setEditingId(tour.id);
        setForm({
            name: tour.name,
            season: tour.season,
            startDate: tour.startDate,
            endDate: tour.endDate
        });
        setIsFormModalOpen(true);
    };

    // 2.3. Hủy chế độ Sửa -> Về chế độ Tạo
    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({ name: '', season: '', startDate: '', endDate: '' });
        setIsFormModalOpen(false);
    };

    // 2.4. Xóa giải đấu
    const handleDeleteClick = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Chặn ko cho nhảy vào trang chi tiết
        if (!confirm("⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa giải đấu này?\nTất cả dữ liệu bảng đấu, lịch thi đấu liên quan sẽ bị mất vĩnh viễn!")) return;

        try {
            await tournamentService.deleteTournament(id);
            alert("🗑️ Đã xóa giải đấu!");
            fetchTournaments();
            if (editingId === id) handleCancelEdit(); // Nếu đang sửa giải bị xóa thì reset form
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa (Có thể do lỗi server hoặc quyền hạn).");
        }
    };

    // ================== 3. CÁC CHỨC NĂNG CHI TIẾT (QUẢN LÝ BÊN TRONG) ==================

    // 3.1. Chuyển sang màn hình quản lý chi tiết
    const handleManage = (tour: Tournament) => {
        setSelectedTournament(tour);
        setViewMode('DETAIL');
        fetchStandings(tour.id);
        setSelectedTeamIds([]);
        setManualTeamId('');
    };

    // 3.2. Thêm đội vào giải
    const toggleTeamSelection = (teamId: number) => {
        setSelectedTeamIds(prev =>
            prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
        );
    };

    const handleAddTeams = async () => {
        if (!selectedTournament || selectedTeamIds.length === 0) return alert("Chưa chọn đội nào!");
        try {
            await tournamentService.addTeams(selectedTournament.id, {
                teamIds: selectedTeamIds
            });
            alert(`✅ Đã thêm ${selectedTeamIds.length} đội vào giải!`);
            fetchStandings(selectedTournament.id);
            setSelectedTeamIds([]);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi thêm đội (Có thể đội đã tồn tại trong giải).");
        }
    };

    // 3.3. Đánh dấu Hạt Giống (Seeding)
    const handleToggleSeed = async (teamId: number) => {
        if (!selectedTournament) return;
        try {
            await tournamentService.toggleSeed(selectedTournament.id, teamId);
            fetchStandings(selectedTournament.id);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi cập nhật hạt giống. Kiểm tra Backend API.");
        }
    };

    // 3.4. Chia bảng TỰ ĐỘNG (Auto Draw)
    const handleAutoDraw = async () => {
        if (!selectedTournament) return;
        const seedCount = standings.filter(s => s.isSeeded).length;
        if (!confirm(`Bạn có chắc muốn chia bảng?\n- Số bảng: ${groupCount}\n- Số hạt giống: ${seedCount}\n⚠️ Dữ liệu bảng cũ sẽ bị RESET.`)) return;

        try {
            await tournamentService.autoDraw(selectedTournament.id);
            alert("✅ Đã chia bảng thành công!");
            fetchStandings(selectedTournament.id);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi chia bảng. Hãy đảm bảo đã thêm đội vào giải.");
        }
    };

    // 3.5. Chia bảng THỦ CÔNG (Manual Draw)
    const handleManualDraw = async () => {
        if (!selectedTournament || !manualTeamId) return alert("Vui lòng chọn đội bóng!");
        try {
            await tournamentService.manualDraw(selectedTournament.id, {
                groups: [{
                    groupName: manualGroupName,
                    teamIds: [Number(manualTeamId)]
                }]
            });
            alert(`✅ Đã chuyển đội sang ${manualGroupName}`);
            fetchStandings(selectedTournament.id);
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi cập nhật bảng đấu!");
        }
    };

    // --- UI HELPER: Gom nhóm đội theo tên bảng ---
    const groupedStandings = standings.reduce((acc, curr) => {
        const group = curr.groupName || 'Chưa chia bảng';
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, TournamentStanding[]>);


    // ================== GIAO DIỆN CHI TIẾT (VIEW MODE = DETAIL) ==================
    if (viewMode === 'DETAIL' && selectedTournament) {
        return (
            <div className="space-y-6 max-w-[1600px] mx-auto p-4 animate-fade-in-up">
                {/* Header Info */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setViewMode('LIST')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </Button>
                    <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
                        <div>
                            <h1 className="text-2xl font-bold uppercase text-yellow-400 tracking-wider flex items-center gap-2">
                                <Trophy className="w-6 h-6" />
                                {selectedTournament.name}
                            </h1>
                            <p className="opacity-80 text-sm flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3" /> Mùa giải: {selectedTournament.season} | {selectedTournament.startDate} - {selectedTournament.endDate}
                            </p>
                        </div>
                        <Badge className="bg-blue-600 hover:bg-blue-700 font-mono">ID: {selectedTournament.id}</Badge>
                    </div>
                </div>

                {/* --- 3 CỘT CHỨC NĂNG --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* CỘT 1: THÊM ĐỘI TỪ KHO */}
                    <Card className="flex flex-col h-full border-blue-100 shadow-sm">
                        <CardHeader className="pb-3 border-b bg-blue-50/50">
                            <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 bg-blue-100 border-blue-200 text-blue-700 rounded-full">1</Badge>
                                Kho Đội Bóng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 flex flex-col">
                            <ScrollArea className="flex-1 h-[300px] p-4">
                                <div className="space-y-2">
                                    {allTeams.map(team => {
                                        const isAlreadyIn = standings.some(s => s.teamId === team.id || s.teamName === team.name);
                                        return (
                                            <div key={team.id} className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${isAlreadyIn ? 'bg-gray-100 opacity-60' : 'hover:bg-slate-50'}`}>
                                                <Checkbox
                                                    id={`team-${team.id}`}
                                                    checked={selectedTeamIds.includes(team.id)}
                                                    onCheckedChange={() => !isAlreadyIn && toggleTeamSelection(team.id)}
                                                    disabled={isAlreadyIn}
                                                />
                                                <div className="flex flex-1 items-center gap-2">
                                                    <img src={getImageUrl(team.logo)} className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/20'} alt={team.name} />
                                                    <Label htmlFor={`team-${team.id}`} className="font-medium cursor-pointer flex-1">
                                                        {team.name}
                                                    </Label>
                                                </div>
                                                {isAlreadyIn && <Badge variant="secondary" className="text-[10px]">Đã có</Badge>}
                                            </div>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-gray-50">
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={selectedTeamIds.length === 0}
                                    onClick={handleAddTeams}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm {selectedTeamIds.length} đội đã chọn
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* CỘT 2: CHIA TỰ ĐỘNG & HẠT GIỐNG */}
                    <Card className="flex flex-col h-full border-orange-100 shadow-sm">
                        <CardHeader className="pb-3 border-b bg-orange-50/50">
                            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 bg-orange-100 border-orange-200 text-orange-700 rounded-full">2</Badge>
                                Chia Tự Động
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 space-y-4">
                            <div>
                                <Label className="text-xs uppercase text-muted-foreground font-bold mb-2 block">
                                    ★ Chọn Hạt Giống
                                </Label>
                                <ScrollArea className="h-[200px] border rounded-md bg-slate-50 p-2">
                                    {standings.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                            Chưa có đội nào tham gia giải.
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            {standings.map(s => (
                                                <div key={s.teamId} className="flex justify-between items-center p-2 rounded-md bg-white border border-slate-100 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <img src={getImageUrl(s.teamLogo)} className="w-5 h-5 object-contain" alt={s.teamName} />
                                                        <span className="text-sm font-medium">{s.teamName}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-6 w-6"
                                                        onClick={() => handleToggleSeed(s.teamId)}
                                                        title={s.isSeeded ? "Bỏ hạt giống" : "Đặt làm hạt giống"}
                                                    >
                                                        <Star className={`w-4 h-4 ${s.isSeeded ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            <div className="space-y-2">
                                <Label>Số lượng bảng đấu</Label>
                                <Input
                                    type="number" min="1" max="8"
                                    value={groupCount} onChange={e => setGroupCount(Number(e.target.value))}
                                    className="font-bold text-center"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-orange-50/30 p-4 border-t">
                            <Button
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                onClick={handleAutoDraw}
                                disabled={standings.length === 0}
                            >
                                <Dices className="w-4 h-4 mr-2" />
                                TRỘN & CHIA BẢNG
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* CỘT 3: THỦ CÔNG */}
                    <Card className="flex flex-col h-fit border-purple-100 shadow-sm">
                        <CardHeader className="pb-3 border-b bg-purple-50/50">
                            <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                                <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 bg-purple-100 border-purple-200 text-purple-700 rounded-full">3</Badge>
                                Điều Chỉnh Thủ Công
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="text-sm text-muted-foreground bg-purple-50 p-3 rounded border border-purple-100">
                                Di chuyển đội bóng sang bảng khác theo ý muốn.
                            </div>

                            <div className="space-y-2">
                                <Label>Chọn Đội Bóng</Label>
                                <Select value={manualTeamId} onValueChange={setManualTeamId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="-- Chọn đội --" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {standings.map(s => (
                                            <SelectItem key={s.teamId} value={String(s.teamId)}>
                                                {s.teamName} [{s.groupName || 'Chưa xếp'}]
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Chuyển tới Bảng</Label>
                                <Select value={manualGroupName} onValueChange={setManualGroupName}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'].map(g => (
                                            <SelectItem key={g} value={g}>{g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 border-t bg-purple-50/20">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={handleManualDraw}>
                                <Settings2 className="w-4 h-4 mr-2" />
                                Cập Nhật Vị Trí
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* --- HIỂN THỊ KẾT QUẢ CHIA BẢNG --- */}
                <div className="mt-8 space-y-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            Kết Quả Bốc Thăm
                        </h2>
                        <Badge variant="secondary" className="font-bold">{standings.length} Teams</Badge>
                        <Separator className="flex-1" />
                    </div>

                    {Object.keys(groupedStandings).length === 0 ? (
                        <Card className="border-dashed border-2">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                                <Dices className="w-12 h-12 mb-4 opacity-20" />
                                <p className="text-lg font-medium">Chưa có dữ liệu bảng đấu</p>
                                <p className="text-sm">Hãy thêm đội ở Cột 1 và bấm Chia bảng ở Cột 2.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 pb-10">
                            {Object.entries(groupedStandings).sort().map(([groupName, teams]) => (
                                <Card key={groupName} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="bg-slate-800 text-white p-3 font-bold flex justify-between items-center">
                                        <span className="flex items-center gap-2 text-lg">🏆 {groupName}</span>
                                        <Badge variant="secondary" className="bg-slate-600 text-slate-100 border-none">
                                            {teams.length} Teams
                                        </Badge>
                                    </div>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50">
                                                <TableRow>
                                                    <TableHead className="pl-4">Club</TableHead>
                                                    <TableHead className="text-center w-12">P</TableHead>
                                                    <TableHead className="text-center w-12">GD</TableHead>
                                                    <TableHead className="text-center w-12 font-bold text-slate-900">Pts</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {teams.map((t, idx) => (
                                                    <TableRow key={idx} className={idx < 2 ? 'bg-green-50/40 hover:bg-green-50/60' : ''}>
                                                        <TableCell className="pl-4 py-2">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`font-mono text-xs w-5 h-5 flex items-center justify-center rounded ${idx < 2 ? 'bg-green-600 text-white font-bold' : 'text-gray-400 bg-gray-100'}`}>
                                                                    {idx + 1}
                                                                </span>
                                                                <img src={getImageUrl(t.teamLogo)} className="w-6 h-6 object-contain" onError={(e) => e.currentTarget.src = 'https://placehold.co/20'} alt={t.teamName} />
                                                                <div className="font-bold text-slate-700 text-sm flex items-center gap-1">
                                                                    {t.teamName}
                                                                    {t.isSeeded && <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-center py-2 text-muted-foreground">{t.played}</TableCell>
                                                        <TableCell className="text-center py-2 text-muted-foreground">{t.gd}</TableCell>
                                                        <TableCell className="text-center py-2 font-bold text-blue-700">{t.points}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ================== GIAO DIỆN DANH SÁCH (MẶC ĐỊNH = LIST) ==================
    return (
        <div className="space-y-6 max-w-[1600px] mx-auto p-4 animate-fade-in-up">
            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản Lý Giải Đấu</h2>
                    <p className="text-muted-foreground">Quản lý các giải đấu đang diễn ra.</p>
                </div>
                <Button onClick={() => {
                    handleCancelEdit();
                    setIsFormModalOpen(true);
                }} className="bg-blue-600 hover:bg-blue-700">
                    <Trophy className="w-4 h-4 mr-2" />
                    Tạo Giải Đấu Mới
                </Button>
            </div>

            {/* DANH SÁCH GIẢI ĐẤU */}
            <div>
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Danh Sách Giải Đấu</CardTitle>
                            <CardDescription>Quản lý các giải đấu đang diễn ra.</CardDescription>
                        </div>
                        <Badge variant="outline">Total: {tournaments.length}</Badge>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px] pr-4">
                            {tournaments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Trophy className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Chưa có giải đấu nào.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tournaments.map(t => (
                                        <div key={t.id} onClick={() => handleManage(t)}
                                            className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group
                                        ${editingId === t.id ? 'border-orange-400 bg-orange-50/50 ring-1 ring-orange-200' : 'hover:border-blue-300 hover:shadow-md bg-white'}`}
                                        >
                                            <div className="flex items-center gap-4 mb-3 md:mb-0">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border
                                                ${editingId === t.id ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {t.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-lg transition ${editingId === t.id ? 'text-orange-700' : 'text-slate-800 group-hover:text-blue-600'}`}>
                                                        {t.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                        <Badge variant="secondary" className="font-normal text-[10px] h-5">Mùa {t.season}</Badge>
                                                        <span>{t.startDate} ➝ {t.endDate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 pl-16 md:pl-0">
                                                <Button
                                                    size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={(e) => handleEditClick(t, e)} title="Sửa"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDeleteClick(t.id, e)} title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" className="ml-2 bg-blue-600 hover:bg-blue-700">
                                                    Quản lý <ChevronRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* MODAL TẠO/SỬA GIẢI ĐẤU */}
            <Dialog open={isFormModalOpen} onOpenChange={(open) => {
                setIsFormModalOpen(open);
                if (!open) handleCancelEdit();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingId ? <Pencil className="w-5 h-5 text-orange-500" /> : <Trophy className="w-5 h-5 text-blue-500" />}
                            {editingId ? 'Cập Nhật Giải Đấu' : 'Tạo Giải Đấu Mới'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Chỉnh sửa thông tin giải đấu hiện tại.' : 'Nhập thông tin để tổ chức giải đấu mới.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tên Giải Đấu</Label>
                            <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="VD: Premier League 2025" />
                        </div>
                        <div className="space-y-2">
                            <Label>Mùa Giải</Label>
                            <Input required value={form.season} onChange={e => setForm({ ...form, season: e.target.value })} placeholder="VD: 2024-2025" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Ngày Bắt đầu</Label>
                                <Input type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Ngày Kết thúc</Label>
                                <Input type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}
                                className={editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                {editingId ? 'Lưu Cập Nhật' : 'Tạo Giải Đấu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
