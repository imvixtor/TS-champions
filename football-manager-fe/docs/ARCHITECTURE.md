# 🏗️ Tài Liệu Kiến Trúc Frontend

**Phiên bản:** 1.0.0  
**Cập nhật:** 2025-01-15  
**Dự án:** Football Manager Frontend

---

## 📑 Mục Lục

1. [Tổng Quan](#tổng-quan)
2. [Kiến Trúc Tổng Thể](#kiến-trúc-tổng-thể)
3. [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
4. [Các Layer Chính](#các-layer-chính)
5. [Patterns & Conventions](#patterns--conventions)
6. [Hướng Dẫn Đọc Code](#hướng-dẫn-đọc-code)
7. [Hướng Dẫn Đóng Góp Code](#hướng-dẫn-đóng-góp-code)
8. [Best Practices](#best-practices)
9. [Ví Dụ Thực Tế](#ví-dụ-thực-tế)

---

## 🎯 Tổng Quan

### Giới Thiệu

Football Manager Frontend là một ứng dụng web quản lý giải đấu bóng đá được xây dựng bằng:
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Router** - Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Styling

### Kiến Trúc

Dự án sử dụng kiến trúc **Feature-Based** với các layer rõ ràng:
- **Presentation Layer** (Components, Pages)
- **Business Logic Layer** (Services, Hooks)
- **Data Layer** (API Services)
- **Infrastructure Layer** (Utils, Config, Types)

---

## 🏛️ Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│  (Pages, Components, Layouts)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              State Management                           │
│  (Contexts, Hooks, Local State)                         │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Business Logic                             │
│  (Services, Custom Hooks)                               │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              API Layer                                  │
│  (Axios Client, Interceptors)                           │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Backend API                                │
│  (REST API - Spring Boot)                               │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu Trúc Thư Mục

```
src/
├── assets/              # Tài nguyên tĩnh (images, icons, fonts)
│   └── react.svg
│
├── components/           # React Components
│   ├── common/          # Components dùng chung (Navbar, Button, etc.)
│   ├── layout/          # Layout components (AdminLayout, CoachLayout)
│   ├── features/        # Feature-specific components (MatchCard, etc.)
│   └── index.ts         # Barrel export
│
├── config/              # Configuration files
│   ├── env.ts          # Environment variables
│   └── index.ts
│
├── contexts/             # React Context Providers
│   ├── AuthContext.tsx
│   ├── AuthProvider.tsx
│   └── index.ts
│
├── hooks/               # Custom React Hooks
│   ├── useAuth.ts
│   └── index.ts
│
├── pages/               # Page Components (Routes)
│   ├── public/         # Public pages (HomePage, StandingPage)
│   ├── auth/           # Auth pages (LoginPage)
│   ├── admin/          # Admin pages (AdminMatchPage, etc.)
│   ├── coach/          # Coach pages (CoachMatchList, etc.)
│   └── index.ts
│
├── routes/              # Routing Configuration
│   ├── index.tsx       # Main route component
│   ├── ProtectedRoute.tsx
│   └── routes.config.ts
│
├── services/             # API Services & Business Logic
│   ├── api/            # API Client setup
│   │   ├── client.ts   # Axios instance
│   │   └── interceptors.ts
│   ├── auth.service.ts
│   ├── match.service.ts
│   ├── team.service.ts
│   ├── player.service.ts
│   ├── tournament.service.ts
│   ├── public.service.ts
│   └── index.ts
│
├── styles/              # Global Styles
│   └── globals.css
│
├── types/               # TypeScript Type Definitions
│   ├── auth.types.ts
│   ├── match.types.ts
│   ├── team.types.ts
│   ├── player.types.ts
│   ├── tournament.types.ts
│   ├── standing.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/               # Utility Functions
│   ├── auth.utils.ts
│   ├── image.utils.ts
│   └── index.ts
│
├── App.tsx              # Root Component
└── main.tsx             # Entry Point
```

---

## 🎨 Các Layer Chính

### 1. Presentation Layer (`components/`, `pages/`)

**Mục đích:** Hiển thị UI và xử lý user interactions

**Cấu trúc:**
- `components/common/` - Components tái sử dụng (Navbar, Button, etc.)
- `components/layout/` - Layout wrappers (AdminLayout, CoachLayout)
- `components/features/` - Components theo feature (MatchCard, MatchDetailModal)
- `pages/` - Page components tương ứng với routes

**Ví dụ:**
```typescript
// components/features/match/MatchCard.tsx
import { getImageUrl } from '../../../utils';
import type { Match } from '../../../types';

export const MatchCard = ({ match }: { match: Match }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm">
            {/* UI content */}
        </div>
    );
};
```

### 2. State Management Layer (`contexts/`, `hooks/`)

**Mục đích:** Quản lý state toàn cục và logic tái sử dụng

**Cấu trúc:**
- `contexts/` - React Context providers (AuthContext)
- `hooks/` - Custom hooks (useAuth)

**Ví dụ:**
```typescript
// hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return ctx;
};
```

### 3. Business Logic Layer (`services/`)

**Mục đích:** Xử lý business logic và API calls

**Cấu trúc:**
- `services/api/` - API client setup
- `services/*.service.ts` - Service classes cho từng domain

**Ví dụ:**
```typescript
// services/match.service.ts
import axiosClient from './api/client';
import type { Match } from '../types';

export const matchService = {
    getMatchesByTournament: async (tournamentId: number): Promise<Match[]> => {
        const response = await axiosClient.get<Match[]>(
            `/champions/match/by-tournament/${tournamentId}`
        );
        return response.data;
    },
};
```

### 4. Infrastructure Layer (`config/`, `utils/`, `types/`)

**Mục đích:** Cung cấp utilities, config và type definitions

**Cấu trúc:**
- `config/` - Configuration (env variables)
- `utils/` - Utility functions (image utils, auth utils)
- `types/` - TypeScript type definitions

**Ví dụ:**
```typescript
// config/env.ts
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
};

// utils/image.utils.ts
import { API_CONFIG } from '../config/env';

export const getImageUrl = (path: string | null, fallback = 'https://placehold.co/40'): string => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    let cleanPath = path.replace(/\\/g, '/');
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    return `${API_CONFIG.BASE_URL}${cleanPath}`;
};
```

---

## 📐 Patterns & Conventions

### 1. Barrel Exports Pattern

**Mục đích:** Giảm số lượng import statements và dễ maintain

**Cách sử dụng:**
```typescript
// ❌ Không tốt
import { useAuth } from '../../hooks/useAuth';
import { getImageUrl } from '../../utils/image.utils';
import type { Match } from '../../types/match.types';

// ✅ Tốt
import { useAuth } from '../../hooks';
import { getImageUrl } from '../../utils';
import type { Match } from '../../types';
```

**Cấu trúc:**
```typescript
// hooks/index.ts
export * from './useAuth';

// utils/index.ts
export * from './auth.utils';
export * from './image.utils';

// types/index.ts
export * from './auth.types';
export * from './match.types';
// ...
```

### 2. Service Pattern

**Mục đích:** Tách biệt API calls khỏi components

**Cấu trúc:**
```typescript
// services/match.service.ts
export const matchService = {
    // Method 1
    getMatchesByTournament: async (id: number): Promise<Match[]> => {
        // Implementation
    },
    
    // Method 2
    createMatch: async (data: CreateMatchRequest): Promise<void> => {
        // Implementation
    },
};
```

**Sử dụng trong component:**
```typescript
import { matchService } from '../../services';

const MyComponent = () => {
    useEffect(() => {
        matchService.getMatchesByTournament(1)
            .then(data => setMatches(data))
            .catch(err => console.error(err));
    }, []);
};
```

### 3. Type Safety Pattern

**Mục đích:** Đảm bảo type safety trong toàn bộ ứng dụng

**Cấu trúc:**
```typescript
// types/match.types.ts
export interface Match {
    id: number;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED';
    matchDate: string;
}

// Sử dụng
import type { Match } from '../types';

const MyComponent = ({ match }: { match: Match }) => {
    // TypeScript sẽ check type
};
```

### 4. Protected Route Pattern

**Mục đích:** Bảo vệ routes theo role

**Cấu trúc:**
```typescript
// routes/ProtectedRoute.tsx
export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
    const { user } = useAuth();
    
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== role && role !== 'ANY') {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

// Sử dụng
<Route path="/admin" element={
    <ProtectedRoute role="ADMIN">
        <AdminLayout />
    </ProtectedRoute>
}>
```

---

## 📖 Hướng Dẫn Đọc Code

### Bước 1: Hiểu Entry Point

Bắt đầu từ `main.tsx` và `App.tsx`:

```typescript
// main.tsx - Entry point
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

// App.tsx - Root component
function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
```

### Bước 2: Hiểu Routing

Xem `routes/index.tsx` để hiểu các routes:

```typescript
// routes/index.tsx
export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={
                <ProtectedRoute role="ADMIN">
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route path="matches" element={<AdminMatchPage />} />
            </Route>
        </Routes>
    );
};
```

### Bước 3: Hiểu Data Flow

**Flow điển hình:**

1. **User Action** → Component event handler
2. **Component** → Gọi service method
3. **Service** → Gọi API qua axiosClient
4. **API Response** → Service trả về data
5. **Component** → Update state với data
6. **UI** → Re-render với data mới

**Ví dụ:**
```typescript
// 1. Component
const AdminMatchPage = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    
    // 2. Load data khi component mount
    useEffect(() => {
        // 3. Gọi service
        matchService.getMatchesByTournament(selectedTourId)
            .then(data => setMatches(data)) // 4. Update state
            .catch(err => console.error(err));
    }, [selectedTourId]);
    
    // 5. Render UI
    return <div>{matches.map(m => <MatchCard key={m.id} match={m} />)}</div>;
};
```

### Bước 4: Tìm Component/Feature Cụ Thể

**Để tìm một feature:**

1. Xem `pages/` để tìm page component
2. Xem `components/features/` để tìm feature components
3. Xem `services/` để tìm API calls liên quan
4. Xem `types/` để tìm type definitions

**Ví dụ: Tìm Match feature**

- Page: `pages/admin/AdminMatchPage.tsx`
- Components: `components/features/match/MatchCard.tsx`
- Service: `services/match.service.ts`
- Types: `types/match.types.ts`

---

## 🚀 Hướng Dẫn Đóng Góp Code

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

### 2. Quy Trình Đóng Góp

#### Bước 1: Tạo Branch Mới

```bash
# Sync với main
git checkout main
git pull upstream main

# Tạo branch mới
git checkout -b feature/ten-tinh-nang-moi
# hoặc
git checkout -b fix/ten-bug-can-fix
```

#### Bước 2: Viết Code

**Quy tắc đặt tên:**
- Components: PascalCase (`MatchCard.tsx`)
- Files: PascalCase cho components, camelCase cho utilities (`image.utils.ts`)
- Variables/Functions: camelCase (`getImageUrl`)
- Constants: UPPER_SNAKE_CASE (`API_CONFIG`)

**Cấu trúc file component:**
```typescript
// 1. Imports
import { useState, useEffect } from 'react';
import { someService } from '../../services';
import type { SomeType } from '../../types';

// 2. Component
export const MyComponent = ({ prop }: Props) => {
    // 3. State
    const [state, setState] = useState<Type>(initialValue);
    
    // 4. Effects
    useEffect(() => {
        // Logic
    }, [dependencies]);
    
    // 5. Handlers
    const handleClick = () => {
        // Handler logic
    };
    
    // 6. Render
    return (
        <div>
            {/* JSX */}
        </div>
    );
};
```

#### Bước 3: Tạo Service (Nếu Cần)

```typescript
// services/my-feature.service.ts
import axiosClient from './api/client';
import type { MyType } from '../types';

export const myFeatureService = {
    getData: async (id: number): Promise<MyType> => {
        const response = await axiosClient.get<MyType>(`/api/endpoint/${id}`);
        return response.data;
    },
    
    createData: async (data: CreateRequest): Promise<void> => {
        await axiosClient.post('/api/endpoint', data);
    },
};
```

**Export trong `services/index.ts`:**
```typescript
export * from './my-feature.service';
```

#### Bước 4: Tạo Types (Nếu Cần)

```typescript
// types/my-feature.types.ts
export interface MyType {
    id: number;
    name: string;
    // ...
}

export interface CreateRequest {
    name: string;
    // ...
}
```

**Export trong `types/index.ts`:**
```typescript
export * from './my-feature.types';
```

#### Bước 5: Test Code

```bash
# Chạy linter
npm run lint

# Kiểm tra TypeScript
npm run build

# Test trên browser
npm run dev
```

#### Bước 6: Commit Code

```bash
# Stage changes
git add .

# Commit với message rõ ràng
git commit -m "feat: thêm tính năng X"
# hoặc
git commit -m "fix: sửa bug Y"
```

**Convention cho commit messages:**
- `feat:` - Tính năng mới
- `fix:` - Sửa bug
- `refactor:` - Refactor code
- `docs:` - Cập nhật documentation
- `style:` - Formatting, không ảnh hưởng logic
- `test:` - Thêm/sửa tests

#### Bước 7: Push và Tạo Pull Request

```bash
# Push branch
git push origin feature/ten-tinh-nang-moi

# Tạo Pull Request trên GitHub
```

---

## ✅ Best Practices

### 1. Component Best Practices

**✅ DO:**
- Sử dụng functional components với hooks
- Tách component nhỏ, tập trung vào một nhiệm vụ
- Sử dụng TypeScript types cho props
- Sử dụng barrel exports cho imports

**❌ DON'T:**
- Không hardcode values (dùng config/env)
- Không duplicate code (tạo utils)
- Không sử dụng `any` type
- Không đặt logic phức tạp trong component

### 2. Service Best Practices

**✅ DO:**
- Tổ chức services theo domain
- Sử dụng TypeScript types cho request/response
- Xử lý errors đúng cách
- Export tất cả services trong `services/index.ts`

**❌ DON'T:**
- Không hardcode API URLs
- Không đặt business logic trong components
- Không duplicate API calls

### 3. State Management Best Practices

**✅ DO:**
- Sử dụng Context cho global state (auth, theme)
- Sử dụng local state cho component-specific state
- Sử dụng custom hooks để tái sử dụng logic

**❌ DON'T:**
- Không overuse Context
- Không đặt state không cần thiết ở global level

### 4. Type Safety Best Practices

**✅ DO:**
- Định nghĩa types cho tất cả data structures
- Sử dụng interfaces cho objects
- Sử dụng union types cho enums
- Export types trong `types/index.ts`

**❌ DON'T:**
- Không sử dụng `any`
- Không bỏ qua type checking

### 5. Code Organization Best Practices

**✅ DO:**
- Đặt file đúng thư mục theo chức năng
- Sử dụng barrel exports
- Giữ file nhỏ (< 300 lines)
- Tách logic phức tạp thành functions/hooks

**❌ DON'T:**
- Không đặt file sai vị trí
- Không tạo file quá lớn
- Không mix concerns (UI + business logic)

---

## 💡 Ví Dụ Thực Tế

### Ví Dụ 1: Tạo Component Mới

**Yêu cầu:** Tạo component `PlayerCard` để hiển thị thông tin cầu thủ

**Bước 1: Tạo component**
```typescript
// components/features/player/PlayerCard.tsx
import { getImageUrl } from '../../../utils';
import type { Player } from '../../../types';

interface PlayerCardProps {
    player: Player;
    onClick?: () => void;
}

export const PlayerCard = ({ player, onClick }: PlayerCardProps) => {
    return (
        <div 
            onClick={onClick}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
        >
            <img 
                src={getImageUrl(player.avatar)} 
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover"
            />
            <h3 className="font-bold mt-2">{player.name}</h3>
            <p className="text-sm text-gray-500">#{player.shirtNumber} • {player.position}</p>
        </div>
    );
};
```

**Bước 2: Export trong barrel**
```typescript
// components/features/player/index.ts
export * from './PlayerCard';

// components/features/index.ts (nếu có)
export * from './player';
```

**Bước 3: Sử dụng**
```typescript
import { PlayerCard } from '../../components';

<PlayerCard player={player} onClick={() => handleClick(player.id)} />
```

### Ví Dụ 2: Tạo Service Mới

**Yêu cầu:** Tạo service để quản lý notifications

**Bước 1: Tạo service**
```typescript
// services/notification.service.ts
import axiosClient from './api/client';
import type { Notification } from '../types';

export const notificationService = {
    getAll: async (): Promise<Notification[]> => {
        const response = await axiosClient.get<Notification[]>('/champions/notifications');
        return response.data;
    },
    
    markAsRead: async (id: number): Promise<void> => {
        await axiosClient.patch(`/champions/notifications/${id}/read`);
    },
};
```

**Bước 2: Export**
```typescript
// services/index.ts
export * from './notification.service';
```

**Bước 3: Tạo types**
```typescript
// types/notification.types.ts
export interface Notification {
    id: number;
    message: string;
    read: boolean;
    createdAt: string;
}
```

**Bước 4: Sử dụng**
```typescript
import { notificationService } from '../../services';

const [notifications, setNotifications] = useState<Notification[]>([]);

useEffect(() => {
    notificationService.getAll()
        .then(data => setNotifications(data))
        .catch(err => console.error(err));
}, []);
```

### Ví Dụ 3: Tạo Custom Hook

**Yêu cầu:** Tạo hook để fetch và quản lý matches

**Bước 1: Tạo hook**
```typescript
// hooks/useMatches.ts
import { useState, useEffect } from 'react';
import { matchService } from '../services';
import type { Match } from '../types';

export const useMatches = (tournamentId: number | null) => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tournamentId) return;

        setLoading(true);
        setError(null);
        
        matchService.getMatchesByTournament(tournamentId)
            .then(data => {
                setMatches(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Không thể tải dữ liệu');
                setLoading(false);
            });
    }, [tournamentId]);

    return { matches, loading, error };
};
```

**Bước 2: Export**
```typescript
// hooks/index.ts
export * from './useMatches';
```

**Bước 3: Sử dụng**
```typescript
import { useMatches } from '../../hooks';

const MyComponent = () => {
    const { matches, loading, error } = useMatches(selectedTournamentId);
    
    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;
    
    return <div>{matches.map(m => <MatchCard key={m.id} match={m} />)}</div>;
};
```

---

## 📚 Tài Liệu Tham Khảo

### Internal Documents
- [Refactor Plan](./REFACTOR_PLAN.md) - Kế hoạch refactor dự án
- [Collaboration Guide](../COLLABORATION_GUIDE.md) - Quy trình cộng tác

### External Resources
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## ❓ FAQ

### Q: Tôi nên đặt component ở đâu?
**A:** 
- `components/common/` - Components dùng chung (Button, Input, etc.)
- `components/features/[feature-name]/` - Components theo feature (MatchCard, PlayerCard)
- `components/layout/` - Layout components (AdminLayout, CoachLayout)

### Q: Khi nào nên tạo service mới?
**A:** Khi bạn cần gọi API cho một domain mới (ví dụ: notifications, comments). Mỗi domain nên có một service riêng.

### Q: Khi nào nên tạo custom hook?
**A:** Khi bạn có logic tái sử dụng giữa nhiều components (ví dụ: fetching data, form handling).

### Q: Làm sao để thêm route mới?
**A:** 
1. Tạo page component trong `pages/`
2. Thêm route vào `routes/index.tsx`
3. Nếu cần protected, wrap với `ProtectedRoute`

### Q: Làm sao để sử dụng environment variables?
**A:** 
1. Tạo file `.env.local` với `VITE_API_URL=...`
2. Import từ `config/env.ts`: `import { API_CONFIG } from '@/config/env'`

---

## 📝 Changelog

### Version 1.0.0 (2025-01-15)
- Tạo tài liệu kiến trúc ban đầu
- Mô tả cấu trúc thư mục và patterns
- Thêm hướng dẫn đọc code và đóng góp code

---

**Cập nhật cuối:** 2025-01-15  
**Người duy trì:** Development Team
