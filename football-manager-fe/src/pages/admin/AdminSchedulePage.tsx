import { useEffect, useState, useMemo } from 'react';
import { teamService, matchService, tournamentService } from '../../services';
import type { TournamentBasic, Team, Match } from '../../types';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { Loader2, Calendar, MapPin, ArrowRightLeft, Trash2, Edit, Gamepad2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useNavigate } from 'react-router-dom';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export const AdminSchedulePage = () => {
    const navigate = useNavigate();
    
    // Data List
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(false);

    // Filter State
    const [selectedTourId, setSelectedTourId] = useState<string>("");
    const [filterGroup, setFilterGroup] = useState<string>('all');
    
    // Sort State
    type SortField = 'date' | 'round' | 'status' | 'homeTeam' | 'awayTeam';
    type SortDirection = 'asc' | 'desc';
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Form State (Tạo mới)
    const [tournamentId, setTournamentId] = useState('');
    const [homeTeamId, setHomeTeamId] = useState('');
    const [awayTeamId, setAwayTeamId] = useState('');
    const [matchDate, setMatchDate] = useState('');
    const [stadium, setStadium] = useState('');
    const [roundName, setRoundName] = useState('Vòng 1');
    const [loading, setLoading] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    
    // State cho nút Sinh Lịch
    const [generatingSchedule, setGeneratingSchedule] = useState(false);

    // State cho Sửa trận đấu
    const [editingMatch, setEditingMatch] = useState<Match | null>(null);
    const [editForm, setEditForm] = useState({ matchDate: '', stadium: '', roundName: '' });
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // Load dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tourData, teamData] = await Promise.all([
                    tournamentService.getAllTournaments(),
                    teamService.getAllTeams()
                ]);
                setTournaments(tourData);
                setTeams(teamData);
                if (tourData.length > 0) {
                    setSelectedTourId(String(tourData[0].id));
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    // Load danh sách trận đấu khi chọn giải hoặc thay đổi filter
    useEffect(() => {
        if (selectedTourId) fetchMatches();
    }, [selectedTourId, filterGroup]);

    const fetchMatches = async () => {
        if (!selectedTourId) return;
        setLoadingMatches(true);
        try {
            const data = await matchService.getMatchesByTournament(
                Number(selectedTourId),
                filterGroup !== 'all' ? filterGroup : undefined
            );
            setMatches(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingMatches(false);
        }
    };

    // LOGIC THÔNG MINH 1: Tự động điền sân vận động khi chọn Đội Nhà
    useEffect(() => {
        if (homeTeamId && teams.length > 0) {
            const homeTeam = teams.find(t => t.id === Number(homeTeamId));
            if (homeTeam) setStadium(homeTeam.stadium);
        }
    }, [homeTeamId, teams]);

    // LOGIC THÔNG MINH 3: Hoán đổi Đội Nhà <-> Đội Khách
    const handleSwapTeams = () => {
        if (!homeTeamId && !awayTeamId) return;
        const temp = homeTeamId;
        setHomeTeamId(awayTeamId);
        setAwayTeamId(temp);
    };

    // Hàm sinh lịch tự động
    const handleGenerateSchedule = async () => {
        if (!selectedTourId || !confirm("Sinh lịch thi đấu tự động cho giải đã chọn?")) return;
        setGeneratingSchedule(true);
        try {
            await matchService.generateSchedule(Number(selectedTourId));
            alert("✅ Đã sinh lịch thành công!");
            fetchMatches(); // Refresh danh sách
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi sinh lịch!");
        } finally {
            setGeneratingSchedule(false);
        }
    };

    // Tạo trận đấu mới
    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

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

            setHomeTeamId('');
            setAwayTeamId('');
            setMatchDate('');
            setStadium('');
            setIsFormModalOpen(false);
            fetchMatches(); // Refresh danh sách
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi lên lịch! Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Mở modal sửa trận đấu
    const openEditModal = (match: Match) => {
        setEditingMatch(match);
        setEditForm({
            matchDate: match.matchDate ? new Date(match.matchDate).toISOString().slice(0, 16) : '',
            stadium: match.stadium || '',
            roundName: match.roundName || ''
        });
        setEditDialogOpen(true);
    };

    // Lưu sửa trận đấu
    const handleSaveUpdate = async () => {
        if (!editingMatch) return;
        try {
            await matchService.updateMatch(editingMatch.id, {
                matchDate: editForm.matchDate,
                stadium: editForm.stadium,
                status: editingMatch.status,
                roundName: editForm.roundName
            });
            alert("✅ Cập nhật thành công!");
            setEditDialogOpen(false);
            setEditingMatch(null);
            fetchMatches();
        } catch (e) {
            console.error(e);
            alert("❌ Lỗi cập nhật");
        }
    };

    // Xóa trận đấu
    const handleDeleteMatch = async (matchId: number) => {
        if (!confirm("⚠️ Xác nhận xóa trận đấu này?")) return;
        // TODO: Thêm API xóa trận đấu nếu có
        alert("⚠️ Chức năng xóa trận đấu chưa được implement!");
    };

    // Sắp xếp matches
    const sortedMatches = useMemo(() => {
        const sorted = [...matches].sort((a, b) => {
            let compareResult = 0;
            
            switch (sortField) {
                case 'date':
                    const dateA = new Date(a.matchDate).getTime();
                    const dateB = new Date(b.matchDate).getTime();
                    compareResult = dateA - dateB;
                    break;
                case 'round':
                    const roundA = a.roundName || 'Chưa xếp vòng';
                    const roundB = b.roundName || 'Chưa xếp vòng';
                    compareResult = roundA.localeCompare(roundB);
                    break;
                case 'status':
                    compareResult = a.status.localeCompare(b.status);
                    break;
                case 'homeTeam':
                    compareResult = a.homeTeam.localeCompare(b.homeTeam);
                    break;
                case 'awayTeam':
                    compareResult = a.awayTeam.localeCompare(b.awayTeam);
                    break;
                default:
                    compareResult = 0;
            }
            
            return sortDirection === 'asc' ? compareResult : -compareResult;
        });
        
        return sorted;
    }, [matches, sortField, sortDirection]);

    // Hàm xử lý sort
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Icon sort
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) {
            return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
        }
        return sortDirection === 'asc' 
            ? <ArrowUp className="w-3 h-3 ml-1" />
            : <ArrowDown className="w-3 h-3 ml-1" />;
    };

    return (
        <div className="min-h-screen w-full p-3 sm:p-4 md:p-6 animate-fade-in-up pb-10 max-w-[1920px] mx-auto">

            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Quản Lý Lịch Thi Đấu</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Xem, sắp xếp và quản lý các trận đấu trong giải.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                        <SelectTrigger className="w-full sm:w-[200px] lg:w-[240px]">
                            <SelectValue placeholder="Chọn giải đấu" />
                        </SelectTrigger>
                        <SelectContent>
                            {tournaments.map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                        onClick={handleGenerateSchedule} 
                        disabled={generatingSchedule || !selectedTourId}
                        variant="outline"
                        size="sm"
                        className="bg-purple-50 hover:bg-purple-100 border-purple-300 text-purple-700 whitespace-nowrap"
                    >
                        {generatingSchedule ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                <span className="hidden sm:inline">Đang sinh...</span>
                            </>
                        ) : (
                            <>⚡ Sinh Lịch</>
                        )}
                    </Button>
                    <Button 
                        onClick={() => setIsFormModalOpen(true)} 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Tạo Trận Đấu</span>
                        <span className="sm:hidden">Tạo</span>
                    </Button>
                </div>
            </div>

            {/* Filter Group & Sort Controls */}
            {selectedTourId && matches.length > 0 && (
                <div className="space-y-3 mb-4">
                    {/* Filter Group */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        <Button
                            variant={filterGroup === 'all' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterGroup('all')}
                            className="rounded-full flex-shrink-0"
                        >
                            Tất cả
                        </Button>
                        {['Group A', 'Group B', 'Group C', 'Group D'].map(g => (
                            <Button
                                key={g}
                                variant={filterGroup === g ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterGroup(g)}
                                className="rounded-full flex-shrink-0"
                            >
                                {g}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Sort Info */}
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>Sắp xếp theo:</span>
                        <Badge variant="outline" className="text-xs">
                            {sortField === 'date' && 'Ngày giờ'}
                            {sortField === 'round' && 'Vòng đấu'}
                            {sortField === 'status' && 'Trạng thái'}
                            {sortField === 'homeTeam' && 'Đội nhà'}
                            {sortField === 'awayTeam' && 'Đội khách'}
                            {' '}
                            {sortDirection === 'asc' ? '(Tăng dần)' : '(Giảm dần)'}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Danh sách trận đấu */}
            {loadingMatches ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : !selectedTourId ? (
                <div className="text-center py-20 text-muted-foreground">
                    👆 Vui lòng chọn giải đấu để xem lịch thi đấu
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Chưa có trận đấu nào được lên lịch</p>
                    <p className="text-sm mt-2">Hãy tạo trận đấu thủ công hoặc sinh lịch tự động</p>
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead 
                                        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                                        onClick={() => handleSort('date')}
                                    >
                                        <div className="flex items-center">
                                            Ngày giờ
                                            {getSortIcon('date')}
                                        </div>
                                    </TableHead>
                                    <TableHead 
                                        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                                        onClick={() => handleSort('round')}
                                    >
                                        <div className="flex items-center">
                                            Vòng đấu
                                            {getSortIcon('round')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Đội nhà</TableHead>
                                    <TableHead className="text-center w-16">VS</TableHead>
                                    <TableHead>Đội khách</TableHead>
                                    <TableHead 
                                        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                                        onClick={() => handleSort('status')}
                                    >
                                        <div className="flex items-center">
                                            Trạng thái
                                            {getSortIcon('status')}
                                        </div>
                                    </TableHead>
                                    <TableHead>Sân đấu</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedMatches.map((match) => (
                                    <TableRow key={match.id} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm">
                                                    {new Date(match.matchDate).toLocaleDateString('vi-VN', { 
                                                        day: '2-digit', 
                                                        month: '2-digit', 
                                                        year: 'numeric' 
                                                    })}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(match.matchDate).toLocaleTimeString('vi-VN', { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium">{match.roundName || 'Chưa xếp vòng'}</span>
                                                {match.groupName && (
                                                    <Badge variant="outline" className="text-[10px] w-fit text-orange-600 border-orange-300">
                                                        {match.groupName}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={getImageUrl(match.homeLogo)}
                                                    className="w-8 h-8 object-contain flex-shrink-0"
                                                    alt={match.homeTeam}
                                                    onError={(e) => e.currentTarget.src = 'https://placehold.co/32'}
                                                />
                                                <span className="font-medium text-sm">{match.homeTeam}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="font-black text-base">
                                                {match.status === 'SCHEDULED' ? (
                                                    <span className="text-muted-foreground">VS</span>
                                                ) : (
                                                    <span>{match.homeScore} - {match.awayScore}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="font-medium text-sm">{match.awayTeam}</span>
                                                <img
                                                    src={getImageUrl(match.awayLogo)}
                                                    className="w-8 h-8 object-contain flex-shrink-0"
                                                    alt={match.awayTeam}
                                                    onError={(e) => e.currentTarget.src = 'https://placehold.co/32'}
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {match.status === 'SCHEDULED' && (
                                                <Badge variant="secondary" className="text-xs">SẮP ĐÁ</Badge>
                                            )}
                                            {match.status === 'IN_PROGRESS' && (
                                                <Badge variant="destructive" className="text-xs animate-pulse">● LIVE</Badge>
                                            )}
                                            {match.status === 'FINISHED' && (
                                                <Badge className="text-xs bg-slate-800">FT</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{match.stadium || 'Chưa có sân'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                {match.status !== 'FINISHED' && (
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                        onClick={() => navigate('/admin/matches', { state: { matchId: match.id } })}
                                                    >
                                                        <Gamepad2 className="w-3 h-3 mr-1" />
                                                        Console
                                                    </Button>
                                                )}
                                                {match.status === 'SCHEDULED' && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => openEditModal(match)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteMatch(match.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* MODAL TẠO TRẬN ĐẤU MỚI */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Tạo Trận Đấu Mới
                        </DialogTitle>
                        <DialogDescription>
                            Thiết lập trận đấu mới cho giải đấu.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSchedule} className="space-y-6">
                        {/* 1. Giải Đấu & Vòng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Giải Đấu *</Label>
                                <Select value={tournamentId} onValueChange={setTournamentId} required>
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
                                <Label>Tên Vòng Đấu *</Label>
                                <Input value={roundName} onChange={e => setRoundName(e.target.value)} placeholder="VD: Vòng 1, Chung kết" required />
                            </div>
                        </div>

                        {/* 2. Chọn Đội */}
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 relative">
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
                                        <span className="w-2 h-2 rounded-full bg-blue-600"></span> Đội Nhà (Home) *
                                    </Label>
                                    <Select value={homeTeamId} onValueChange={setHomeTeamId} required>
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
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Đội Khách (Away) *
                                    </Label>
                                    <Select value={awayTeamId} onValueChange={setAwayTeamId} required>
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
                                <Label>Ngày giờ thi đấu *</Label>
                                <Input
                                    type="datetime-local"
                                    value={matchDate} onChange={e => setMatchDate(e.target.value)}
                                    required
                                    className="font-mono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sân vận động *</Label>
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
                                Lưu Trận Đấu
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL SỬA TRẬN ĐẤU */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cập nhật trận đấu</DialogTitle>
                        <DialogDescription>
                            Chỉnh sửa thông tin lịch thi đấu (chỉ áp dụng cho trận chưa bắt đầu).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="round" className="text-right">
                                Vòng đấu
                            </Label>
                            <Input
                                id="round"
                                className="col-span-3"
                                value={editForm.roundName}
                                onChange={e => setEditForm({ ...editForm, roundName: e.target.value })}
                            />
                        </div>
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
                        <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit" onClick={handleSaveUpdate}>Lưu thay đổi</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
