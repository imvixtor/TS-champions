import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchService, tournamentService, playerService } from '../../services';
import type { TournamentBasic, Match } from '../../types';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Loader2, Calendar, MapPin } from "lucide-react"

export const AdminMatchPage = () => {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string>("");
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [filterGroup, setFilterGroup] = useState<string>('all');

    // State Modal Sửa Trận Đấu
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [editForm, setEditForm] = useState({ matchDate: '', stadium: '' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // --- MỚI: State Modal Xem Đội Hình ---
    const [squadDialogOpen, setSquadDialogOpen] = useState(false);
    const [selectedTeamName, setSelectedTeamName] = useState('');
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    useEffect(() => {
        tournamentService.getAllTournaments().then(data => {
            setTournaments(data);
            if (data.length > 0) setSelectedTourId(String(data[0].id));
        });
    }, []);

    useEffect(() => {
        if (selectedTourId) fetchMatches();
    }, [selectedTourId, filterGroup]);

    const fetchMatches = async () => {
        if (!selectedTourId) return;
        setLoading(true);
        try {
            const data = await matchService.getMatchesByTournament(
                Number(selectedTourId),
                filterGroup !== 'all' ? filterGroup : undefined
            );
            setMatches(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleGenerateSchedule = async () => {
        if (!selectedTourId || !confirm("Sinh lịch thi đấu tự động?")) return;
        try {
            await matchService.generateSchedule(Number(selectedTourId));
            alert("✅ Đã sinh lịch thành công!");
            fetchMatches();
        } catch (error) { console.error(error); alert("❌ Lỗi sinh lịch!"); }
    };

    const openEditModal = (match: Match) => {
        setEditingMatch(match);
        setEditForm({
            matchDate: match.matchDate,
            stadium: match.stadium || ''
        });
        setEditDialogOpen(true);
    };

    const handleSaveUpdate = async () => {
        if (!editingMatch) return;
        try {
            await matchService.updateMatch(editingMatch.id, {
                matchDate: editForm.matchDate,
                stadium: editForm.stadium,
                status: editingMatch.status
            });
            alert("✅ Cập nhật thành công!");
            setEditDialogOpen(false);
            setEditingMatch(null);
            fetchMatches();
        } catch (e) { console.error(e); alert("❌ Lỗi cập nhật"); }
    };

    // --- MỚI: Hàm xem đội hình ---
    const handleViewTeam = async (teamId: number, teamName: string) => {
        if (!teamId) return;
        setSelectedTeamName(teamName);
        setSquadDialogOpen(true);
        setLoadingPlayers(true);
        setTeamPlayers([]); // Clear dữ liệu cũ

        try {
            const data = await playerService.getPlayersByTeam(teamId);
            setTeamPlayers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingPlayers(false);
        }
    };

    // Gom nhóm theo vòng đấu
    const matchesByRound = matches.reduce((acc, match) => {
        const round = match.roundName || 'Chưa xếp vòng';
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {} as Record<string, Match[]>);

    const sortedRounds = Object.keys(matchesByRound).sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.replace(/\D/g, '')) || 0;
        return numA - numB;
    });

    return (
        <div className="space-y-6 animate-fade-in-up pb-10 max-w-7xl mx-auto p-4">

            {/* Header & Filter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản Lý Lịch Thi Đấu</h2>
                    <p className="text-muted-foreground">Xem, sắp xếp và quản lý các trận đấu trong giải.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Chọn giải đấu" />
                        </SelectTrigger>
                        <SelectContent>
                            {tournaments.map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateSchedule}>
                        ⚡ Sinh Lịch
                    </Button>
                </div>
            </div>

            {/* Filter Group */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <Button
                    variant={filterGroup === 'all' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterGroup('all')}
                    className="rounded-full"
                >
                    Tất cả
                </Button>
                {['Group A', 'Group B', 'Group C', 'Group D'].map(g => (
                    <Button
                        key={g}
                        variant={filterGroup === g ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterGroup(g)}
                        className="rounded-full"
                    >
                        {g}
                    </Button>
                ))}
            </div>

            {/* Danh sách trận đấu */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {sortedRounds.map(round => (
                        <Card key={round} className="overflow-hidden">
                            <CardHeader className="bg-muted/40 py-3">
                                <div className="flex justify-between items-center">
                                    <div className="font-bold text-lg">{round}</div>
                                    <Badge variant="outline" className="bg-background">{matchesByRound[round].length} trận</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {matchesByRound[round].map(match => (
                                        <div key={match.id} className="p-4 hover:bg-muted/30 transition relative group">
                                            {/* Status Labels - Top Right */}
                                            <div className="absolute top-4 right-4 flex gap-2">
                                                {match.status === 'SCHEDULED' && <Badge variant="secondary" className="text-[10px] h-5">SẮP ĐÁ</Badge>}
                                                {match.status === 'IN_PROGRESS' && <Badge variant="destructive" className="text-[10px] h-5 animate-pulse">● LIVE</Badge>}
                                                {match.status === 'FINISHED' && <Badge className="text-[10px] h-5 bg-slate-800">FT</Badge>}
                                            </div>

                                            {/* Meta Info */}
                                            <div className="text-xs text-muted-foreground mb-3 flex flex-wrap gap-2 items-center">
                                                <Badge variant="outline" className="text-xs font-normal bg-blue-50 text-blue-700 border-blue-200 gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(match.matchDate).toLocaleString('vi-VN')}
                                                </Badge>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.stadium || 'Chưa có sân'}</span>
                                                <span className="font-bold text-orange-600">• {match.groupName}</span>
                                            </div>

                                            {/* Match Content */}
                                            <div className="flex justify-between items-center mb-4 mt-2">
                                                {/* Left Team */}
                                                <div
                                                    className="flex items-center gap-3 w-1/3 cursor-pointer p-1 rounded-md hover:bg-muted transition"
                                                    onClick={() => handleViewTeam(match.homeTeamId, match.homeTeam)}
                                                    title="Xem đội hình"
                                                >
                                                    <img
                                                        src={getImageUrl(match.homeLogo)}
                                                        className="w-8 h-8 object-contain"
                                                        alt={match.homeTeam}
                                                        onError={(e) => e.currentTarget.src = 'https://placehold.co/40'}
                                                    />
                                                    <span className="font-bold text-sm leading-tight hover:text-primary hover:underline">{match.homeTeam}</span>
                                                </div>

                                                {/* Score / VS */}
                                                <div className="font-black text-xl bg-muted/50 px-4 py-1.5 rounded-md min-w-[80px] text-center tracking-widest">
                                                    {match.status === 'SCHEDULED' ? 'VS' : `${match.homeScore} - ${match.awayScore}`}
                                                </div>

                                                {/* Right Team */}
                                                <div
                                                    className="flex items-center justify-end gap-3 w-1/3 cursor-pointer p-1 rounded-md hover:bg-muted transition"
                                                    onClick={() => handleViewTeam(match.awayTeamId, match.awayTeam)}
                                                    title="Xem đội hình"
                                                >
                                                    <span className="font-bold text-sm leading-tight text-right hover:text-primary hover:underline">{match.awayTeam}</span>
                                                    <img
                                                        src={getImageUrl(match.awayLogo)}
                                                        className="w-8 h-8 object-contain"
                                                        alt={match.awayTeam}
                                                        onError={(e) => e.currentTarget.src = 'https://placehold.co/40'}
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => openEditModal(match)}
                                                >
                                                    ✏️ Sửa Giờ
                                                </Button>

                                                {match.status !== 'FINISHED' && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => navigate(`/admin/match/${match.id}/console`)}
                                                    >
                                                        💻 Vào Console
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Modal Sửa Trận Đấu */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật trận đấu</DialogTitle>
                        <DialogDescription>
                            Chỉnh sửa thời gian và địa điểm thi đấu.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="date" className="text-right">
                                Thời gian
                            </Label>
                            <Input
                                id="date"
                                type="datetime-local"
                                className="col-span-3"
                                value={editForm.matchDate}
                                onChange={e => setEditForm({ ...editForm, matchDate: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stadium" className="text-right">
                                Sân đấu
                            </Label>
                            <Input
                                id="stadium"
                                placeholder="Nhập tên sân..."
                                className="col-span-3"
                                value={editForm.stadium}
                                onChange={e => setEditForm({ ...editForm, stadium: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveUpdate}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Xem Đội Hình */}
            <Dialog open={squadDialogOpen} onOpenChange={setSquadDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="flex items-center gap-2">
                            🏃 Đội hình: <span className="text-primary uppercase">{selectedTeamName}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto flex-1 p-6 pt-2">
                        {loadingPlayers ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span>Đang tải danh sách...</span>
                            </div>
                        ) : teamPlayers.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                Đội này chưa có cầu thủ nào.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px] text-center">Số áo</TableHead>
                                        <TableHead>Cầu thủ</TableHead>
                                        <TableHead className="text-center">Vị trí</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teamPlayers.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="text-center font-bold text-lg text-muted-foreground">
                                                #{p.shirtNumber}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={getImageUrl(p.avatar)}
                                                        className="w-10 h-10 rounded-full object-cover border"
                                                        alt={p.name}
                                                        onError={(e) => e.currentTarget.src = 'https://placehold.co/40'}
                                                    />
                                                    <div>
                                                        <div className="font-bold">{p.name}</div>
                                                        <div className="text-xs text-muted-foreground">{p.nationality || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`
                                                    ${p.position === 'GK' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        p.position === 'FW' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            p.position === 'MF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}
                                                 `}>
                                                    {p.position}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
