# 🚀 Quick Start Guide

Hướng dẫn nhanh để bắt đầu đọc và đóng góp code vào Frontend project.

---

## ⚡ Bắt Đầu Nhanh

### 1. Setup Môi Trường

```bash
# Clone repository
git clone <repository-url>
cd football-manager-fe

# Install dependencies
npm install

# Tạo file .env.local
echo "VITE_API_URL=http://localhost:8080" > .env.local

# Chạy dev server
npm run dev
```

### 2. Cấu Trúc Nhanh

```
src/
├── pages/          → Các trang (HomePage, LoginPage, AdminMatchPage, etc.)
├── components/     → React components (Navbar, MatchCard, etc.)
├── services/       → API calls (matchService, teamService, etc.)
├── hooks/          → Custom hooks (useAuth)
├── types/          → TypeScript types
├── utils/          → Utility functions
└── routes/         → Routing configuration
```

### 3. Luồng Code Cơ Bản

```
User Action → Component → Service → API → Response → State Update → UI Re-render
```

**Ví dụ:**
```typescript
// 1. Component nhận user action
const handleClick = () => {
    // 2. Gọi service
    matchService.getMatchesByTournament(1)
        .then(data => setMatches(data)) // 3. Update state
        .catch(err => console.error(err));
};

// 4. UI tự động re-render khi state thay đổi
return <div>{matches.map(m => <MatchCard match={m} />)}</div>;
```

---

## 📖 Đọc Code - 5 Bước

### Bước 1: Tìm Feature Bạn Muốn Hiểu

**Ví dụ:** Muốn hiểu tính năng Match

1. **Page:** `pages/admin/AdminMatchPage.tsx` - Trang quản lý trận đấu
2. **Components:** `components/features/match/MatchCard.tsx` - Card hiển thị trận đấu
3. **Service:** `services/match.service.ts` - API calls liên quan match
4. **Types:** `types/match.types.ts` - Type definitions

### Bước 2: Đọc Page Component

```typescript
// pages/admin/AdminMatchPage.tsx
export const AdminMatchPage = () => {
    // State management
    const [matches, setMatches] = useState<Match[]>([]);
    
    // Load data khi component mount
    useEffect(() => {
        matchService.getMatchesByTournament(selectedTourId)
            .then(data => setMatches(data));
    }, [selectedTourId]);
    
    // Render UI
    return <div>{matches.map(m => <MatchCard match={m} />)}</div>;
};
```

### Bước 3: Đọc Service

```typescript
// services/match.service.ts
export const matchService = {
    getMatchesByTournament: async (id: number): Promise<Match[]> => {
        const response = await axiosClient.get(`/api/matches/${id}`);
        return response.data;
    },
};
```

### Bước 4: Đọc Types

```typescript
// types/match.types.ts
export interface Match {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
}
```

### Bước 5: Đọc Component

```typescript
// components/features/match/MatchCard.tsx
export const MatchCard = ({ match }: { match: Match }) => {
    return (
        <div>
            <h3>{match.homeTeam} vs {match.awayTeam}</h3>
            <p>{match.homeScore} - {match.awayScore}</p>
        </div>
    );
};
```

---

## ✍️ Đóng Góp Code - Checklist

### Trước Khi Bắt Đầu

- [ ] Đọc [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Sync với main branch: `git pull upstream main`
- [ ] Tạo branch mới: `git checkout -b feature/ten-tinh-nang`

### Khi Viết Code

- [ ] Tuân thủ naming conventions
- [ ] Sử dụng TypeScript types
- [ ] Sử dụng barrel exports cho imports
- [ ] Không hardcode values (dùng config/env)
- [ ] Không duplicate code (tạo utils nếu cần)

### Trước Khi Commit

- [ ] Chạy linter: `npm run lint`
- [ ] Test trên browser: `npm run dev`
- [ ] Kiểm tra TypeScript: `npm run build`
- [ ] Commit với message rõ ràng

### Tạo Pull Request

- [ ] Push branch: `git push origin feature/ten-tinh-nang`
- [ ] Tạo PR trên GitHub
- [ ] Mô tả rõ ràng những gì đã thay đổi
- [ ] Đợi code review

---

## 🎯 Common Tasks

### Thêm Component Mới

```typescript
// 1. Tạo file
// components/features/my-feature/MyComponent.tsx
import type { MyType } from '../../../types';

export const MyComponent = ({ data }: { data: MyType }) => {
    return <div>{/* UI */}</div>;
};

// 2. Export trong barrel
// components/features/my-feature/index.ts
export * from './MyComponent';

// 3. Sử dụng
import { MyComponent } from '../../components';
```

### Thêm Service Mới

```typescript
// 1. Tạo service
// services/my-feature.service.ts
import axiosClient from './api/client';

export const myFeatureService = {
    getData: async (id: number) => {
        const response = await axiosClient.get(`/api/endpoint/${id}`);
        return response.data;
    },
};

// 2. Export
// services/index.ts
export * from './my-feature.service';

// 3. Sử dụng
import { myFeatureService } from '../../services';
```

### Thêm Route Mới

```typescript
// 1. Tạo page
// pages/my-feature/MyPage.tsx
export const MyPage = () => {
    return <div>My Page</div>;
};

// 2. Thêm route
// routes/index.tsx
import { MyPage } from '../pages/my-feature/MyPage';

<Route path="/my-feature" element={<MyPage />} />
```

---

## 🔍 Tìm Kiếm Code

### Tìm Component
```
components/features/[feature-name]/
components/common/
components/layout/
```

### Tìm API Call
```
services/[feature].service.ts
```

### Tìm Type Definition
```
types/[feature].types.ts
```

### Tìm Utility Function
```
utils/[feature].utils.ts
```

---

## 📞 Cần Giúp Đỡ?

1. Đọc [ARCHITECTURE.md](./ARCHITECTURE.md) để hiểu chi tiết
2. Xem code examples trong các files hiện có
3. Hỏi team qua GitHub Discussions hoặc Slack

---

**Happy Coding! 🎉**
