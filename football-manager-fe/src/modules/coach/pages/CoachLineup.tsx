import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../core/api/axiosClient';

export const CoachLineup = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teamId, setTeamId] = useState('');
    const [starterIds, setStarterIds] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if(!teamId || !starterIds) return alert("Vui lòng nhập ID Đội và Danh sách cầu thủ!");
        
        setLoading(true);
        try {
            // Chuyển chuỗi "1, 2, 3" thành mảng [1, 2, 3]
            const starters = starterIds.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
            
            if (starters.length !== 11) {
                // Cảnh báo nhẹ nhưng vẫn cho gửi để test
                if(!confirm(`Bạn đang đăng ký ${starters.length} cầu thủ (Khuyên dùng: 11). Tiếp tục?`)) {
                    setLoading(false);
                    return;
                }
            }

            await axiosClient.post(`/champions/match/${id}/lineup`, {
                teamId: Number(teamId),
                starterIds: starters,
                subIds: [] // Tạm thời để trống
            });
            alert("✅ Đăng ký đội hình thành công!");
            navigate('/coach/matches');
        } catch (e) {
            console.error(e);
            alert("❌ Lỗi gửi đội hình (Kiểm tra lại ID đội hoặc cầu thủ)");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full">
                <button onClick={() => navigate('/coach/matches')} className="text-gray-500 text-sm mb-4 hover:text-black">← Quay lại</button>
                <h1 className="text-2xl font-bold text-slate-800 mb-6">ĐĂNG KÝ ĐỘI HÌNH</h1>
                <p className="mb-4 text-sm text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
                    Trận đấu ID: <strong>#{id}</strong>
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block font-bold text-slate-700 mb-1">ID Đội bóng của bạn</label>
                        <input type="number" className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="Nhập ID đội..."
                            value={teamId}
                            onChange={e => setTeamId(e.target.value)} />
                    </div>
                    <div>
                        <label className="block font-bold text-slate-700 mb-1">Danh sách ID Cầu thủ Đá chính</label>
                        <p className="text-xs text-gray-400 mb-2">Nhập ID cách nhau bằng dấu phẩy (Ví dụ: 101, 102, 103...)</p>
                        <textarea className="w-full border border-gray-300 p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
                            placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11"
                            value={starterIds}
                            onChange={e => setStarterIds(e.target.value)} />
                    </div>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
                        {loading ? 'Đang gửi...' : 'XÁC NHẬN GỬI'}
                    </button>
                </div>
            </div>
        </div>
    );
};