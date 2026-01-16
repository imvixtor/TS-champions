import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { StandingPage } from '../pages/public/StandingPage';
import { LoginPage } from '../pages/auth/LoginPage';

// Admin Pages
import { AdminLayout } from '../components/layout/AdminLayout';
import { AdminMatchPage } from '../pages/admin/AdminMatchPage';
import { MatchConsolePage } from '../pages/admin/MatchConsolePage';
import { AdminTeamPage } from '../pages/admin/AdminTeamPage';
import { AdminPlayerPage } from '../pages/admin/AdminPlayerPage';
import { AdminTournamentPage } from '../pages/admin/AdminTournamentPage';
import { AdminSchedulePage } from '../pages/admin/AdminSchedulePage';

// Coach Pages & Layouts
import { CoachLayout } from '../components/layout/CoachLayout';
import { CoachMatchList } from '../pages/coach/CoachMatchList';
import { CoachLineupPage } from '../pages/coach/CoachLineupPage';
import { CoachSquadPage } from '../pages/coach/CoachSquadPage';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<HomePage />} />
            <Route path="/standings" element={<StandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* ================= ADMIN ROUTES ================= */}
            <Route path="/admin" element={
                <ProtectedRoute role="ADMIN">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                {/* Redirect mặc định: Vào /admin tự nhảy sang /admin/matches */}
                <Route index element={<Navigate to="matches" replace />} />
                
                {/* Quản lý Giải đấu */}
                <Route path="tournaments" element={<AdminTournamentPage />} />
                
                {/* Quản lý Trận đấu & Lên lịch */}
                <Route path="matches" element={<AdminMatchPage />} />
                <Route path="schedule" element={<AdminSchedulePage />} />
                
                {/* Console điều khiển trận đấu */}
                <Route path="match/:id/console" element={<MatchConsolePage />} />
                
                {/* Quản lý Đội bóng & Cầu thủ */}
                <Route path="teams" element={<AdminTeamPage />} />
                <Route path="players" element={<AdminPlayerPage />} />
            </Route>

            {/* ================= COACH ROUTES ================= */}
            <Route path="/coach" element={
                <ProtectedRoute role="COACH">
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
    );
};
