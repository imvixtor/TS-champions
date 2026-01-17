import { useEffect, useState } from 'react';
import { teamService, playerService } from '../../services';
import { getImageUrl, exportToCSV, readCSVFile } from '../../utils';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Pencil, Trash2, Users, UserPlus, Download, Upload, ClipboardList, Info, Building2, User } from "lucide-react"

export const AdminTeamPage = () => {
    // State Form & List
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [stadium, setStadium] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [coachName, setCoachName] = useState('');

    const [teams, setTeams] = useState<any[]>([]);
    const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // State Modal Xem Cầu Thủ
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);

    // State Modal Cấp Tài Khoản HLV
    const [showCoachModal, setShowCoachModal] = useState(false);
    const [selectedTeamForCoach, setSelectedTeamForCoach] = useState<any>(null);
    const [coachUsername, setCoachUsername] = useState('');
    const [coachPassword, setCoachPassword] = useState('');

    // State Modal Import CSV
    const [showImportModal, setShowImportModal] = useState(false);
    const [importLoading, setImportLoading] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const data = await teamService.getAllTeams();
            setTeams(data);
        } catch (e) { console.error(e); }
    };

    const handleViewPlayers = async (team: any) => {
        setSelectedTeam(team);
        setShowPlayerModal(true);
        setTeamPlayers([]);
        setLoadingPlayers(true);
        try {
            const data = await playerService.getPlayersByTeam(team.id);
            setTeamPlayers(data);
        } catch (error) {
            console.error("Lỗi tải cầu thủ:", error);
        } finally {
            setLoadingPlayers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            const teamData = { name, shortName, stadium, coachName };
            const jsonBlob = new Blob([JSON.stringify(teamData)], { type: 'application/json' });
            formData.append('team', jsonBlob);

            if (logo) formData.append('logo', logo);

            if (editingTeamId) {
                await teamService.updateTeam(editingTeamId, { name, shortName, stadium, coachName }, logo || undefined);
                alert("✅ Cập nhật thành công!");
            } else {
                await teamService.createTeam({ name, shortName, stadium, coachName }, logo || undefined);
                alert("✅ Tạo đội mới thành công!");
            }
            handleCancelEdit();
            setIsFormModalOpen(false);
            fetchTeams();
        } catch (error) {
            console.error(error);
            alert("❌ Lỗi xử lý! Kiểm tra lại thông tin.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ CẢNH BÁO: Xóa đội bóng sẽ XÓA LUÔN tất cả cầu thủ thuộc đội đó.\nBạn có chắc chắn không?")) return;
        try {
            await teamService.deleteTeam(id);
            alert("🗑️ Đã xóa đội bóng!");
            fetchTeams();
            if (editingTeamId === id) handleCancelEdit();
        } catch (error) {
            console.error(error);
            alert("❌ Không thể xóa! (Có thể đội này đã đá giải, dính líu đến trận đấu).");
        }
    };

    const handleEditClick = (team: any) => {
        setEditingTeamId(team.id);
        setName(team.name);
        setShortName(team.shortName);
        setStadium(team.stadium);
        setCoachName(team.coachName || '');
        setLogo(null);
        setIsFormModalOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingTeamId(null);
        setName(''); setShortName(''); setStadium(''); setCoachName(''); setLogo(null);
        const fileInput = document.getElementById('logoInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setIsFormModalOpen(false);
    };

    const handleOpenCoachModal = (team: any) => {
        setSelectedTeamForCoach(team);
        setCoachUsername('');
        setCoachPassword('');
        setShowCoachModal(true);
    };

    const handleCreateCoach = async () => {
        if (!coachUsername || !coachPassword) return alert("Vui lòng nhập Username và Password!");

        try {
            await teamService.createCoach({
                username: coachUsername,
                password: coachPassword,
                teamId: selectedTeamForCoach.id
            });
            alert(`✅ Đã cấp tài khoản HLV cho đội ${selectedTeamForCoach.name}`);
            setShowCoachModal(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data || "Có lỗi xảy ra (Check quyền Admin/Server)";
            alert(`❌ Lỗi: ${msg}`);
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        const data = teams.map(team => ({
            'Tên Đội': team.name,
            'Mã (Short)': team.shortName,
            'Sân Vận Động': team.stadium,
            'HLV Trưởng': team.coachName || ''
        }));
        exportToCSV(data, `danh_sach_doi_bong_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Import CSV
    const handleImportCSV = async (file: File) => {
        setImportLoading(true);
        try {
            const csvData = await readCSVFile(file);
            
            // Validate CSV format
            const requiredFields = ['Tên Đội', 'Mã (Short)', 'Sân Vận Động'];
            const missingFields = requiredFields.filter(field => !csvData[0] || !(field in csvData[0]));
            if (missingFields.length > 0) {
                alert(`❌ File CSV thiếu các cột: ${missingFields.join(', ')}\n\nCác cột bắt buộc: ${requiredFields.join(', ')}`);
                setImportLoading(false);
                return;
            }

            // Import từng đội
            let successCount = 0;
            let errorCount = 0;
            
            for (const row of csvData) {
                try {
                    await teamService.createTeam({
                        name: row['Tên Đội'] || '',
                        shortName: row['Mã (Short)'] || '',
                        stadium: row['Sân Vận Động'] || '',
                        coachName: row['HLV Trưởng'] || undefined
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Lỗi import đội ${row['Tên Đội']}:`, error);
                    errorCount++;
                }
            }

            alert(`✅ Import hoàn tất!\n- Thành công: ${successCount}\n- Lỗi: ${errorCount}`);
            setShowImportModal(false);
            fetchTeams();
        } catch (error) {
            console.error(error);
            alert('❌ Lỗi đọc file CSV! Vui lòng kiểm tra định dạng file.');
        } finally {
            setImportLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full p-3 sm:p-4 md:p-6 animate-fade-in-up pb-10 max-w-[1920px] mx-auto">

            {/* HEADER VÀ NÚT THÊM MỚI */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 pb-4 border-b">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Quản Lý Đội Bóng</h2>
                    <p className="text-sm sm:text-base text-muted-foreground">Quản lý tất cả các đội bóng trong hệ thống.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                    <Button variant="outline" onClick={handleExportCSV} size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Xuất CSV</span>
                        <span className="sm:hidden">Xuất</span>
                    </Button>
                    <Button variant="outline" onClick={() => setShowImportModal(true)} size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Nhập CSV</span>
                        <span className="sm:hidden">Nhập</span>
                    </Button>
                    <Button onClick={() => {
                        handleCancelEdit();
                        setIsFormModalOpen(true);
                    }} size="sm" className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Thêm Đội Mới</span>
                        <span className="sm:hidden">Thêm</span>
                    </Button>
                </div>
            </div>

            {/* DANH SÁCH ĐỘI BÓNG */}
            {teams.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">Chưa có đội bóng nào</p>
                    <p className="text-sm mt-2">Hãy thêm đội bóng hoặc import từ CSV</p>
                </div>
            ) : (
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[80px] text-center">Logo</TableHead>
                                    <TableHead>Thông tin đội bóng</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((team) => (
                                    <TableRow key={team.id} className="hover:bg-muted/30">
                                        <TableCell className="text-center p-2">
                                            <img
                                                src={getImageUrl(team.logo)}
                                                className="w-12 h-12 object-contain mx-auto"
                                                alt={team.name}
                                                onError={(e) => e.currentTarget.src = 'https://placehold.co/50'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-base flex items-center gap-2">
                                                {team.name}
                                                <Badge variant="secondary" className="text-xs font-normal">{team.shortName}</Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1 flex flex-col sm:flex-row gap-1 sm:gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />
                                                    {team.stadium}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {team.coachName || 'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2 flex-wrap">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs"
                                                    onClick={() => handleViewPlayers(team)}
                                                >
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Squad
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
                                                    onClick={() => handleOpenCoachModal(team)}
                                                >
                                                    <UserPlus className="w-3 h-3 mr-1" />
                                                    Cấp HLV
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs"
                                                    onClick={() => handleEditClick(team)}
                                                >
                                                    <Pencil className="w-3 h-3 mr-1" />
                                                    Sửa
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(team.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* --- MODAL XEM CẦU THỦ --- */}
            <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Đội hình: <span className="text-primary uppercase">{selectedTeam?.name}</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="overflow-y-auto flex-1 p-0">
                        {loadingPlayers ? (
                            <div className="py-20 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-muted-foreground" /></div>
                        ) : teamPlayers.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground italic">Đội này chưa có cầu thủ nào.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10">
                                        <TableHead className="w-16 text-center">#</TableHead>
                                        <TableHead className="w-16">Ảnh</TableHead>
                                        <TableHead>Tên cầu thủ</TableHead>
                                        <TableHead>Vị trí</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {teamPlayers.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell className="text-center font-bold text-muted-foreground">#{p.shirtNumber}</TableCell>
                                            <TableCell>
                                                <img src={getImageUrl(p.avatar)} className="w-9 h-9 rounded-full object-cover border" alt={p.name} onError={(e) => e.currentTarget.src = 'https://placehold.co/40'} />
                                            </TableCell>
                                            <TableCell className="font-medium">{p.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal bg-slate-50">{p.position}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- MODAL CẤP TÀI KHOẢN HLV --- */}
            <Dialog open={showCoachModal} onOpenChange={setShowCoachModal}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Cấp TK Huấn Luyện Viên</DialogTitle>
                        <DialogDescription>
                            Cho đội: <span className="font-bold text-foreground">{selectedTeamForCoach?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input
                                value={coachUsername}
                                onChange={e => setCoachUsername(e.target.value)}
                                placeholder="VD: coach_hagl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                value={coachPassword}
                                onChange={e => setCoachPassword(e.target.value)}
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCoachModal(false)}>Hủy</Button>
                        <Button onClick={handleCreateCoach}>Xác nhận</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL THÊM/SỬA ĐỘI BÓNG */}
            <Dialog open={isFormModalOpen} onOpenChange={(open) => {
                setIsFormModalOpen(open);
                if (!open) handleCancelEdit();
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingTeamId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {editingTeamId ? 'Sửa Đội Bóng' : 'Thêm Đội Mới'}
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin chi tiết về đội bóng của bạn.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tên Đội</Label>
                            <Input required value={name} onChange={e => setName(e.target.value)} placeholder="VD: Liverpool FC" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Mã (Short)</Label>
                                <Input required value={shortName} onChange={e => setShortName(e.target.value)} placeholder="LIV" />
                            </div>
                            <div className="space-y-2">
                                <Label>HLV Trưởng</Label>
                                <Input value={coachName} onChange={e => setCoachName(e.target.value)} placeholder="Arne Slot" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Sân Vận Động</Label>
                            <Input required value={stadium} onChange={e => setStadium(e.target.value)} placeholder="Anfield" />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo CLB</Label>
                            <Input id="logoInput" type="file" accept="image/*" onChange={e => setLogo(e.target.files ? e.target.files[0] : null)} className="cursor-pointer" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {editingTeamId ? 'Cập Nhật' : 'Thêm Mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* --- MODAL IMPORT CSV --- */}
            <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Nhập Đội Bóng từ CSV
                        </DialogTitle>
                        <DialogDescription>
                            Chọn file CSV để import danh sách đội bóng. File CSV cần có các cột: Tên Đội, Mã (Short), Sân Vận Động, HLV Trưởng (tùy chọn).
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
                                disabled={importLoading}
                                className="cursor-pointer"
                            />
                        </div>
                        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100">
                            <p className="font-bold mb-1 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" />
                                Định dạng CSV mẫu:
                            </p>
                            <pre className="whitespace-pre-wrap font-mono text-xs">
Tên Đội,Mã (Short),Sân Vận Động,HLV Trưởng{'\n'}
Liverpool FC,LIV,Anfield,Arne Slot{'\n'}
Manchester United,MANU,Old Trafford,Erik ten Hag
                            </pre>
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
