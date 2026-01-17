import { useEffect, useState } from 'react';
import { playerService, teamService } from '../../services';
import type { Team, Player } from '../../types';
import { getImageUrl } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2, UserPlus, Pencil } from "lucide-react"

export const AdminPlayerPage = () => {
    // State Form
    const [name, setName] = useState('');
    const [shirtNumber, setShirtNumber] = useState('');
    const [position, setPosition] = useState('FW');
    const [avatar, setAvatar] = useState<File | null>(null);

    // State Data
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>(''); // Đội đang chọn để xem/thêm
    const [players, setPlayers] = useState<Player[]>([]); // List cầu thủ của đội đó
    const [loading, setLoading] = useState(false);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);

    // 1. Load danh sách Đội bóng (để bỏ vào Dropdown)
    useEffect(() => {
        teamService.getAllTeams()
            .then(data => {
                setTeams(data);
                if (data.length > 0) {
                    setSelectedTeamId(data[0].id.toString()); // Mặc định chọn đội đầu tiên
                }
            })
            .catch(err => console.error("Lỗi tải đội:", err));
    }, []);

    // 2. Khi selectedTeamId thay đổi -> Load danh sách cầu thủ của đội đó
    useEffect(() => {
        if (selectedTeamId) {
            fetchPlayers(selectedTeamId);
        }
    }, [selectedTeamId]);

    const fetchPlayers = async (teamId: string) => {
        setLoadingPlayers(true);
        try {
            const data = await playerService.getPlayersByTeam(Number(teamId));
            setPlayers(data);
        } catch (error) {
            console.error("Lỗi tải cầu thủ:", error);
            setPlayers([]); // Nếu lỗi thì reset list
        } finally {
            setLoadingPlayers(false);
        }
    };

    // 3. Xử lý Thêm/Sửa Cầu Thủ
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeamId) return alert("Vui lòng chọn đội bóng trước!");
        setLoading(true);

        try {
            const playerData = {
                name,
                shirtNumber: Number(shirtNumber),
                position,
                teamId: Number(selectedTeamId)
            };

            if (editingPlayerId) {
                await playerService.updatePlayer(editingPlayerId, playerData, avatar || undefined);
                alert("✅ Cập nhật cầu thủ thành công!");
            } else {
                await playerService.createPlayer(playerData, avatar || undefined);
                alert("✅ Thêm cầu thủ thành công!");
            }

            handleCancelEdit(); // Reset form và đóng modal
            fetchPlayers(selectedTeamId); // Load lại danh sách ngay

        } catch (error: unknown) {
            console.error("Lỗi:", error);
            if ((error as { response?: { status?: number } })?.response?.status === 403) {
                alert("❌ Lỗi quyền hạn (403). Hãy logout và login lại!");
            } else {
                alert(`❌ Lỗi ${editingPlayerId ? 'cập nhật' : 'thêm'} cầu thủ! Kiểm tra console.`);
            }
        } finally {
            setLoading(false);
        }
    };

    // 4. Xử lý Chỉnh sửa Cầu Thủ
    const handleEditClick = (player: Player) => {
        setEditingPlayerId(player.id);
        setName(player.name);
        setShirtNumber(player.shirtNumber.toString());
        setPosition(player.position);
        setAvatar(null); // Reset avatar file, giữ avatar hiện tại
        setSelectedTeamId(player.teamId.toString());
        setIsFormModalOpen(true);
    };

    // 5. Hủy chế độ Sửa -> Về chế độ Tạo
    const handleCancelEdit = () => {
        setEditingPlayerId(null);
        setName('');
        setShirtNumber('');
        setPosition('FW');
        setAvatar(null);
        const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setIsFormModalOpen(false);
    };

    // 6. Xử lý Xóa Cầu Thủ
    const handleDelete = async (playerId: number) => {
        if (!confirm("Bạn có chắc chắn muốn xóa cầu thủ này?")) return;

        try {
            await playerService.deletePlayer(playerId);
            alert("🗑️ Đã xóa thành công!");
            fetchPlayers(selectedTeamId); // Load lại list
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa (Có thể cầu thủ này đã có thống kê bàn thắng/thẻ phạt).");
        }
    };

    return (
        <div className="space-y-6 w-full p-4 animate-fade-in-up">

            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Quản Lý Cầu Thủ</h2>
                    <p className="text-muted-foreground">Xem và quản lý danh sách cầu thủ theo đội bóng.</p>
                </div>
                <div className="flex gap-3">
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Chọn đội..." />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setIsFormModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Thêm Cầu Thủ
                    </Button>
                </div>
            </div>

            {/* DANH SÁCH CẦU THỦ */}
            <div className="w-full">
                <Card className="w-full h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle>Danh Sách Cầu Thủ</CardTitle>
                            <CardDescription>
                                Đang xem đội hình của <span className="font-bold text-primary">{teams.find(t => String(t.id) === selectedTeamId)?.name}</span>.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-sm px-3 py-1">Tổng: {players.length}</Badge>
                    </CardHeader>
                    <CardContent>
                        {loadingPlayers ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px] text-center">Số</TableHead>
                                            <TableHead className="w-[80px]">Avatar</TableHead>
                                            <TableHead>Thông tin</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {players.length > 0 ? (
                                            players.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="text-center">
                                                        <div className="bg-slate-100 text-slate-700 font-black text-lg h-10 w-8 mx-auto flex items-center justify-center rounded border border-slate-200 shadow-sm font-mono">
                                                            {p.shirtNumber}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <img
                                                            src={getImageUrl(p.avatar)}
                                                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                            alt={p.name}
                                                            onError={(e) => e.currentTarget.src = 'https://placehold.co/40'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold text-base">{p.name}</div>
                                                        <Badge variant="secondary" className={`mt-1 text-[10px] pointer-events-none
                                                            ${p.position === 'GK' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                p.position === 'FW' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    p.position === 'MF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}
                                                        `}>
                                                            {p.position}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                                                                onClick={() => handleEditClick(p)}
                                                                title="Sửa cầu thủ"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => handleDelete(p.id)}
                                                                title="Xóa cầu thủ"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-40 text-muted-foreground italic">
                                                    Đội này chưa có cầu thủ nào.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* MODAL THÊM/SỬA CẦU THỦ */}
            <Dialog open={isFormModalOpen} onOpenChange={(open) => {
                setIsFormModalOpen(open);
                if (!open) handleCancelEdit();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingPlayerId ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                            {editingPlayerId ? 'Sửa Cầu Thủ' : 'Thêm Cầu Thủ'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPlayerId ? 'Chỉnh sửa thông tin cầu thủ.' : 'Tạo hồ sơ cầu thủ mới cho đội bóng.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Chọn đội để thêm vào */}
                        <div className="space-y-2">
                            <Label>Chọn Đội Bóng</Label>
                            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn đội..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map(t => (
                                        <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tên Cầu Thủ</Label>
                            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Nguyễn Văn A" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Số Áo</Label>
                                <Input type="number" required value={shirtNumber} onChange={e => setShirtNumber(e.target.value)} placeholder="10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Vị Trí</Label>
                                <Select value={position} onValueChange={setPosition}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GK">Thủ môn</SelectItem>
                                        <SelectItem value="DF">Hậu vệ</SelectItem>
                                        <SelectItem value="MF">Tiền vệ</SelectItem>
                                        <SelectItem value="FW">Tiền đạo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Avatar</Label>
                            <Input id="avatarInput" type="file" accept="image/*" onChange={e => setAvatar(e.target.files ? e.target.files[0] : null)} className="cursor-pointer" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingPlayerId ? 'Cập Nhật' : 'Lưu Cầu Thủ'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
