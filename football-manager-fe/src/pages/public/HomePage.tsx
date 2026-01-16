import { useEffect, useState } from 'react';
import { publicService } from '../../services';
import { Navbar } from '../../components';
import { MatchCard, MatchDetailModal } from '../../components';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, FilterX } from "lucide-react"

// Helper: Lấy ngày hôm nay định dạng YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];

export const HomePage = () => {
    const [matches, setMatches] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]); // List giải đấu để chọn
    const [loading, setLoading] = useState(false);

    // --- STATE CHO FILTER ---
    const [filterDate, setFilterDate] = useState(getTodayString()); // Mặc định là hôm nay
    const [filterTourId, setFilterTourId] = useState<string>("all"); // Mặc định chọn tất cả

    // State Modal
    const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

    // 1. Load danh sách giải đấu (cho Dropdown)
    useEffect(() => {
        publicService.getTournaments()
            .then(data => setTournaments(data))
            .catch(e => console.error(e));
    }, []);

    // 2. Load danh sách trận đấu khi Filter thay đổi
    useEffect(() => {
        const fetchMatches = async () => {
            setLoading(true);
            try {
                const data = await publicService.searchMatches({
                    date: filterDate,
                    tournamentId: filterTourId !== "all" ? Number(filterTourId) : null
                });
                setMatches(data);
            } catch (err) {
                console.error("Lỗi tải lịch:", err);
                setMatches([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [filterDate, filterTourId]); // Chạy lại khi Date hoặc TourId thay đổi

    return (
        <div className="min-h-screen bg-muted/20 font-sans pb-10">
            <Navbar />

            <main className="container mx-auto max-w-5xl px-4 py-8 animate-fade-in-up">

                {/* --- HEADER & FILTER BAR --- */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 uppercase text-xl">
                            <CalendarIcon className="w-6 h-6" />
                            Lịch Thi Đấu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* 1. Chọn Giải Đấu */}
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Giải đấu
                                </label>
                                <Select value={filterTourId} onValueChange={setFilterTourId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn giải đấu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">🏆 Tất cả giải đấu</SelectItem>
                                        {tournaments.map(t => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name} ({t.season})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 2. Chọn Ngày */}
                            <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Ngày thi đấu
                                </label>
                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={e => setFilterDate(e.target.value)}
                                />
                            </div>

                            {/* 3. Nút "Hôm nay" nhanh */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setFilterDate(getTodayString())}
                                >
                                    Hôm nay
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* --- KẾT QUẢ TÌM KIẾM --- */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Đang tìm trận đấu...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-lg border border-dashed text-muted-foreground">
                        <FilterX className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Không có trận đấu nào vào ngày <b>{new Date(filterDate).toLocaleDateString('vi-VN')}</b></p>
                        {filterTourId !== "all" && <p className="text-sm mt-1">(Thuộc giải đấu bạn chọn)</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-muted-foreground text-sm font-medium">Tìm thấy {matches.length} trận đấu</span>
                            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                                {new Date(filterDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                            </span>
                        </div>

                        <div className="grid gap-4">
                            {matches.map(match => (
                                <div
                                    key={match.id}
                                    onClick={() => setSelectedMatchId(match.id)}
                                    className="cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                >
                                    <MatchCard match={match} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal Chi Tiết */}
            {selectedMatchId && (
                <MatchDetailModal
                    matchId={selectedMatchId}
                    onClose={() => setSelectedMatchId(null)}
                />
            )}
        </div>
    );
};
