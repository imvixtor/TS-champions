import { useEffect, useState } from 'react';
import { publicService } from '../../services';
import { Navbar } from '../../components';
import type { TournamentBasic, StandingWithGroup } from '../../types';
import { getImageUrl } from '../../utils';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"


export const StandingPage = () => {
    const [tournaments, setTournaments] = useState<TournamentBasic[]>([]);
    const [selectedTourId, setSelectedTourId] = useState<string>("");
    const [standings, setStandings] = useState<StandingWithGroup[]>([]);
    const [loading, setLoading] = useState(false);

    // 1. Tải danh sách giải đấu
    useEffect(() => {
        publicService.getTournaments()
            .then(data => {
                setTournaments(data);
                // Chọn giải đấu đầu tiên làm mặc định
                if (data.length > 0) setSelectedTourId(String(data[0].id));
            })
            .catch(err => console.error("Lỗi tải giải đấu:", err));
    }, []);

    // 2. Tải BXH khi chọn giải
    useEffect(() => {
        if (!selectedTourId) return;

        const fetchStandings = async () => {
            setLoading(true);
            try {
                const data = await publicService.getStandings(Number(selectedTourId));
                setStandings(data);
            } catch (err) {
                console.error("Lỗi tải BXH:", err);
                setStandings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStandings();
    }, [selectedTourId]);

    // --- LOGIC GOM NHÓM (GROUP BY) ---
    // Chuyển List phẳng -> Object { "Group A": [...], "Group B": [...] }
    const groupedStandings = standings.reduce((acc, curr) => {
        const group = curr.groupName || 'Chưa Xếp Bảng'; // Nếu chưa chia bảng thì gom vào đây
        if (!acc[group]) acc[group] = [];
        acc[group].push(curr);
        return acc;
    }, {} as Record<string, StandingWithGroup[]>);

    // Sắp xếp tên bảng theo thứ tự A, B, C...
    const sortedGroupNames = Object.keys(groupedStandings).sort();

    return (
        <div className="min-h-screen bg-muted/20 font-sans">
            <Navbar />

            <main className="container mx-auto max-w-6xl px-4 py-8 animate-fade-in-up">

                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Bảng Xếp Hạng</h1>
                        <p className="text-muted-foreground font-medium">Cập nhật liên tục kết quả thi đấu.</p>
                    </div>

                    <div className="w-full md:w-64">
                        <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn giải đấu" />
                            </SelectTrigger>
                            <SelectContent>
                                {tournaments.map(t => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name} ({t.season})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-muted-foreground font-bold animate-pulse">Đang tải dữ liệu...</div>
                ) : standings.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-lg border border-dashed border-muted text-muted-foreground">
                        <p className="text-lg">Chưa có dữ liệu bảng xếp hạng cho giải đấu này.</p>
                    </div>
                ) : (
                    // Grid hiển thị các bảng đấu (2 cột trên màn hình lớn)
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {sortedGroupNames.map((groupName) => (
                            <Card key={groupName} className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all">
                                <CardHeader className="bg-muted/50 py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                    <div className="font-bold text-lg flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        {groupName}
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs">
                                        {groupedStandings[groupName].length} Teams
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-muted/20">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="w-12 text-center">#</TableHead>
                                                <TableHead>Câu lạc bộ</TableHead>
                                                <TableHead className="w-10 text-center text-xs">P</TableHead>
                                                <TableHead className="w-10 text-center text-xs">W</TableHead>
                                                <TableHead className="w-10 text-center text-xs">D</TableHead>
                                                <TableHead className="w-10 text-center text-xs">L</TableHead>
                                                <TableHead className="w-10 text-center text-xs">GD</TableHead>
                                                <TableHead className="w-12 text-center font-bold text-black dark:text-white bg-muted/30">Pts</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedStandings[groupName].map((team, index) => (
                                                <TableRow key={team.teamId} className="group">
                                                    <TableCell className="text-center p-2">
                                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold
                                                             ${index < 2 ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                                                            {index + 1}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="p-2">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={getImageUrl(team.teamLogo)}
                                                                className="w-6 h-6 object-contain"
                                                                alt={team.teamName}
                                                                onError={(e) => e.currentTarget.src = 'https://placehold.co/20'}
                                                            />
                                                            <span className="font-semibold text-sm">{team.teamName}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center p-2 text-muted-foreground">{team.played}</TableCell>
                                                    <TableCell className="text-center p-2 text-muted-foreground">{team.won}</TableCell>
                                                    <TableCell className="text-center p-2 text-muted-foreground">{team.drawn}</TableCell>
                                                    <TableCell className="text-center p-2 text-muted-foreground">{team.lost}</TableCell>
                                                    <TableCell className={`text-center p-2 font-bold ${team.gd > 0 ? 'text-green-600' : team.gd < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                                    </TableCell>
                                                    <TableCell className="text-center p-2 font-black text-base bg-muted/30">
                                                        {team.points}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};
