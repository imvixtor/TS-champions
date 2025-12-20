// 1. TẤT CẢ IMPORT PHẢI NẰM Ở ĐẦU FILE
import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { AuthProvider } from './modules/core/context/AuthProvider';
import { useAuth } from './modules/core/context/useAuth';

// Public Pages
import { LoginPage } from './modules/auth/pages/LoginPage';
import { HomePage } from './modules/public/pages/HomePage';
import { StandingPage } from './modules/public/pages/StandingPage';

// Admin Pages
import { AdminLayout } from './modules/admin/layouts/AdminLayout';
import { AdminMatchPage } from './modules/admin/pages/AdminMatchPage'; // Trang Quản lý danh sách
import { MatchConsolePage } from './modules/admin/pages/MatchConsolePage'; // Trang Điều khiển trận đấu
import { AdminTeamPage } from './modules/admin/pages/AdminTeamPage';
import { AdminPlayerPage } from './modules/admin/pages/AdminPlayerPage';
import { AdminTournamentPage } from './modules/admin/pages/AdminTournamentPage';
import { AdminSchedulePage } from './modules/admin/pages/AdminSchedulePage'; // Trang Lên lịch thông minh

// Coach Pages & Layouts
import { CoachLayout } from './modules/coach/layouts/CoachLayout'; // 👈 Import Layout mới
import { CoachMatchList } from './modules/coach/pages/CoachMatchList';
import { CoachLineupPage } from './modules/coach/pages/CoachLineupPage'; 
import { CoachSquadPage } from './modules/coach/pages/CoachSquadPage';


// --- COMPONENT BẢO VỆ ROUTE ---
// Chỉ cho phép user có đúng role truy cập, nếu không sẽ đá về Login hoặc Home
const ProtectedRoute = ({ children, role }: { children: JSX.Element, role: string }) => {
    const { user } = useAuth();
    
    // 1. Chưa đăng nhập -> Về trang Login
    if (!user) return <Navigate to="/login" replace />;
    
    // 2. Đã đăng nhập nhưng sai quyền
    if (user.role !== role && role !== 'ANY') {
        // Nếu là Coach cố vào Admin -> Về Coach Dashboard
        if (user.role === 'COACH') return <Navigate to="/coach/matches" replace />;
        // Nếu là Admin cố vào Coach -> Về Admin Dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/matches" replace />;
        
        return <Navigate to="/" replace />;
    }
    
    return children;
};

// --- APP CHÍNH ---
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<HomePage />} />
          <Route path="/standings" element={<StandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ================= ADMIN ROUTES ================= */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
                {/* AdminLayout sẽ chứa thanh bên (Sidebar) và Header */}
                <AdminLayout />
            </ProtectedRoute>
          }>
              {/* Redirect mặc định: Vào /admin tự nhảy sang /admin/matches */}
              <Route index element={<Navigate to="matches" replace />} />
              
              {/* Quản lý Giải đấu */}
              <Route path="tournaments" element={<AdminTournamentPage />} />
              
              {/* Quản lý Trận đấu & Lên lịch */}
              <Route path="matches" element={<AdminMatchPage />} />
              <Route path="schedule" element={<AdminSchedulePage />} /> {/* Trang lên lịch thông minh */}
              
              {/* Console điều khiển trận đấu */}
              <Route path="match/:id/console" element={<MatchConsolePage />} />
              
              {/* Quản lý Đội bóng & Cầu thủ */}
              <Route path="teams" element={<AdminTeamPage />} />
              <Route path="players" element={<AdminPlayerPage />} />
          </Route>

          {/* ================= COACH ROUTES ================= */}
          <Route path="/coach" element={
             <ProtectedRoute role="COACH">
                 {/* 👇 Sử dụng Layout mới chuyên nghiệp cho HLV */}
                 <CoachLayout />
             </ProtectedRoute>
          }>
              {/* Redirect mặc định: Vào /coach tự nhảy sang /coach/matches */}
              <Route index element={<Navigate to="matches" replace />} />

              <Route path="matches" element={<CoachMatchList />} />
              <Route path="match/:id/lineup" element={<CoachLineupPage />} />
              <Route path="squad" element={<CoachSquadPage />} />
          </Route>
          
          {/* Route 404: Nhập linh tinh sẽ về Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;