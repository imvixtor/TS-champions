import { useEffect, useState } from 'react';
import { playerService, teamService } from '../../services';
import type { Team, Player } from '../../types';
import { getImageUrl, exportToCSV, readCSVFile } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
import { Loader2, Trash2, UserPlus, Pencil, Download, Upload, ClipboardList, Lightbulb, Users, Info } from "lucide-react"

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
    
    // State Import CSV
    const [showImportModal, setShowImportModal] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

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

    // 6. Export CSV
    const handleExportCSV = () => {
        const currentTeam = teams.find(t => String(t.id) === selectedTeamId);
        const data = players.map(player => ({
            'Tên Cầu Thủ': player.name,
            'Số Áo': player.shirtNumber.toString(),
            'Vị Trí': player.position,
            'Đội Bóng': currentTeam?.name || ''
        }));
        const teamName = currentTeam?.shortName || 'all';
        exportToCSV(data, `danh_sach_cau_thu_${teamName}_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // 7. Import CSV
    const handleImportCSV = async (file: File) => {
        if (!selectedTeamId) {
            alert('❌ Vui lòng chọn đội bóng trước khi import!');
            return;
        }

        setImportLoading(true);
        try {
            const csvData = await readCSVFile(file);
            
            // Validate CSV format
            const requiredFields = ['Tên Cầu Thủ', 'Số Áo'];
            const missingFields = requiredFields.filter(field => !csvData[0] || !(field in csvData[0]));
            if (missingFields.length > 0) {
                alert(`❌ File CSV thiếu các cột: ${missingFields.join(', ')}\n\nCác cột bắt buộc: ${requiredFields.join(', ')}`);
                setImportLoading(false);
                return;
            }

            // Import từng cầu thủ
            let successCount = 0;
            let errorCount = 0;
            
            for (const row of csvData) {
                try {
                    const shirtNumber = parseInt(row['Số Áo'] || '0');
                    if (isNaN(shirtNumber) || shirtNumber <= 0) {
                        console.error(`Số áo không hợp lệ: ${row['Số Áo']}`);
                        errorCount++;
                        continue;
                    }

                    // Vị trí là tùy chọn, có thể blank
                    let position = (row['Vị Trí'] || '').trim().toUpperCase();
                    
                    // Nếu vị trí không rỗng, validate nó phải là một trong các giá trị hợp lệ
                    if (position && !['GK', 'DF', 'MF', 'FW'].includes(position)) {
                        console.warn(`Vị trí không hợp lệ: ${row['Vị Trí']}. Sẽ để vị trí trống.`);
                        position = ''; // Đặt về rỗng nếu không hợp lệ
                    }

                    // Xây dựng request data - position có thể null nếu để trống
                    const playerData: {
                        name: string;
                        shirtNumber: number;
                        position: string | null;
                        teamId: number;
                    } = {
                        name: row['Tên Cầu Thủ'] || '',
                        shirtNumber,
                        position: (position && ['GK', 'DF', 'MF', 'FW'].includes(position)) ? position : null,
                        teamId: Number(selectedTeamId)
                    };

                    await playerService.createPlayer(playerData);
                    successCount++;
                } catch (error) {
                    console.error(`Lỗi import cầu thủ ${row['Tên Cầu Thủ']}:`, error);
                    errorCount++;
                }
            }

            alert(`✅ Import hoàn tất!\n- Thành công: ${successCount}\n- Lỗi: ${errorCount}`);
            setShowImportModal(false);
            fetchPlayers(selectedTeamId);
        } catch (error) {
            console.error(error);
            alert('❌ Lỗi đọc file CSV! Vui lòng kiểm tra định dạng file.');
        } finally {
            setImportLoading(false);
        }
    };

    // 8. Xử lý Xóa Cầu Thủ
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
        <div className="min-h-screen w-full p-3 sm:p-4 md:p-6 animate-fade-in-up pb-10 max-w-[1920px] mx-auto">

            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Quản Lý Cầu Thủ</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Xem và quản lý danh sách cầu thủ theo đội bóng.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                        <SelectTrigger className="w-full sm:w-[200px] lg:w-[240px]">
                            <SelectValue placeholder="Chọn đội..." />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(t => (
                                <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExportCSV} disabled={!selectedTeamId || players.length === 0} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Xuất CSV</span>
                        <span className="sm:hidden">Xuất</span>
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportModal(true)} disabled={!selectedTeamId} size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Nhập CSV</span>
                        <span className="sm:hidden">Nhập</span>
                    </Button>
                    <Button onClick={() => setIsFormModalOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                        <UserPlus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Thêm Cầu Thủ</span>
                        <span className="sm:hidden">Thêm</span>
                    </Button>
                </div>
            </div>

            {/* DANH SÁCH CẦU THỦ */}
            {loadingPlayers ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : !selectedTeamId ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">Vui lòng chọn đội bóng để xem danh sách cầu thủ</p>
                </div>
            ) : players.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Đội này chưa có cầu thủ nào</p>
                    <p className="text-sm mt-2">Hãy thêm cầu thủ hoặc import từ CSV</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {players.map((p) => (
                        <Card key={p.id} className="transition-all hover:shadow-md group">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-slate-100 text-slate-700 font-black text-lg h-12 w-12 flex items-center justify-center rounded border border-slate-200 shadow-sm font-mono flex-shrink-0">
                                            {p.shirtNumber}
                                        </div>
                                        <img
                                            src={getImageUrl(p.avatar)}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0"
                                            alt={p.name}
                                            onError={(e) => e.currentTarget.src = 'https://placehold.co/48'}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="font-bold text-base">{p.name}</div>
                                            <Badge variant="secondary" className={`mt-1 text-[10px] pointer-events-none
                                                ${p.position === 'GK' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    p.position === 'FW' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        p.position === 'MF' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}
                                            `}>
                                                {p.position}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 pl-16 md:pl-0">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => handleEditClick(p)}
                                        >
                                            <Pencil className="w-3 h-3 mr-1" />
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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

            {/* MODAL IMPORT CSV */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Nhập Cầu Thủ từ CSV
                        </DialogTitle>
                        <DialogDescription>
                            Chọn file CSV để import danh sách cầu thủ vào đội <span className="font-bold">{teams.find(t => String(t.id) === selectedTeamId)?.name}</span>. File CSV cần có các cột: Tên Cầu Thủ, Số Áo (bắt buộc), Vị Trí (tùy chọn: GK/DF/MF/FW hoặc để trống).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Chọn file CSV</Label>
                            <Input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleImportCSV(file);
                                    }
                                }}
                                disabled={importLoading || !selectedTeamId}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="text-xs text-muted-foreground bg-green-50 p-3 rounded border border-green-100">
                            <p className="font-bold mb-1 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" />
                                Định dạng CSV mẫu:
                            </p>
                            <pre className="whitespace-pre-wrap font-mono text-xs">
Tên Cầu Thủ,Số Áo,Vị Trí{'\n'}
Nguyễn Văn A,10,FW{'\n'}
Trần Văn B,1,GK{'\n'}
Lê Văn C,4,{'\n'}
Phạm Văn D,5,
                            </pre>
                            <p className="mt-2 text-xs flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span><strong>Vị Trí:</strong> GK (Thủ môn), DF (Hậu vệ), MF (Tiền vệ), FW (Tiền đạo). <span className="text-orange-600">Có thể để trống.</span></span>
                            </p>
                        </div>
                    </div>
                    {importLoading && (
                        <div className="flex items-center justify-center py-2">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span className="text-sm">Đang import...</span>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowImportModal(false)} disabled={importLoading}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
