import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider} from './modules/core/context/AuthProvider';
import { useAuth } from './modules/core/context/useAuth';
import { LoginPage } from './modules/auth/pages/LoginPage';
import { HomePage } from './modules/public/pages/HomePage';
import { StandingPage } from './modules/public/pages/StandingPage';
// Import Admin
import { AdminLayout } from './modules/admin/layouts/AdminLayout';
import { AdminMatchList } from './modules/admin/pages/AdminMatchList';
import { MatchConsole } from './modules/admin/pages/MatchConsole';
// Import Coach
import { CoachMatchList } from './modules/coach/pages/CoachMatchList';
import { CoachLineup } from './modules/coach/pages/CoachLineup';

import { AdminTeamPage } from './modules/admin/pages/AdminTeamPage'
import { AdminPlayerPage } from './modules/admin/pages/AdminPlayerPage'

// Bảo vệ Route (Chặn người lạ vào trang Admin/Coach)
const ProtectedRoute = ({ children, role }: { children: JSX.Element, role: string }) => {
    const { user } = useAuth();
    // Nếu chưa đăng nhập hoặc sai quyền -> Đá về login hoặc trang chủ
    if (!user) return <Navigate to="/login" />;
    if (user.role !== role && role !== 'ANY') return <Navigate to="/" />;
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<HomePage />} />
          <Route path="/standings" element={<StandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* ADMIN AREA */}
          <Route path="/admin" element={
            <ProtectedRoute role="ADMIN">
                <AdminLayout />
            </ProtectedRoute>
          }>
              <Route path="matches" element={<AdminMatchList />} />
              <Route path="matches/:id/console" element={<MatchConsole />} />
              <Route path="teams" element={<AdminTeamPage />} />
              <Route path="players" element={<AdminPlayerPage />} />
              <Route path="tournaments" element={<AdminTournamentPage />} />
              <Route path="schedule" element={<AdminSchedulePage />} />
          </Route>

          {/* COACH AREA */}
          <Route path="/coach" element={
             <ProtectedRoute role="COACH">
                 {/* Coach không cần Layout phức tạp, bọc div đơn giản */}
                 <div className="font-sans"><Outlet /></div>
             </ProtectedRoute>
          }>
              <Route path="matches" element={<CoachMatchList />} />
              <Route path="match/:id/lineup" element={<CoachLineup />} />
          </Route>
          
          {/* Cần thêm import Outlet ở đầu file nếu dùng Layout lồng nhau cho Coach */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { Outlet } from 'react-router-dom'; // Nhớ dòng này
import type { JSX } from 'react';
import { AdminTournamentPage } from './modules/admin/pages/AdminTournamentPage';
import { AdminSchedulePage } from './modules/admin/pages/AdminSchedulePage';
export default App;