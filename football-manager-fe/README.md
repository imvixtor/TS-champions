# ⚽ Football Manager Frontend

Ứng dụng web quản lý giải đấu bóng đá được xây dựng với React, TypeScript và Vite.

## 🚀 Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool & Dev Server
- **React Router** - Client-side Routing
- **Axios** - HTTP Client
- **Tailwind CSS** - Utility-first CSS Framework

## 📁 Cấu Trúc Dự Án

```
src/
├── components/     # React Components
├── pages/          # Page Components
├── services/       # API Services
├── hooks/          # Custom Hooks
├── types/          # TypeScript Types
├── utils/          # Utility Functions
├── routes/         # Routing Configuration
├── contexts/       # React Contexts
└── config/         # Configuration
```

## 🏃 Bắt Đầu Nhanh

### Prerequisites

- Node.js >= 18.x
- npm hoặc yarn

### Installation

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

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📚 Tài Liệu

### Cho Người Mới

- **[Quick Start Guide](./docs/QUICK_START.md)** - Hướng dẫn nhanh để bắt đầu
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Tài liệu kiến trúc chi tiết

### Cho Developers

- **[Refactor Plan](./docs/REFACTOR_PLAN.md)** - Kế hoạch refactor dự án
- **[Collaboration Guide](../COLLABORATION_GUIDE.md)** - Quy trình cộng tác

## 🛠️ Scripts

```bash
# Development
npm run dev          # Chạy dev server

# Build
npm run build        # Build cho production

# Linting
npm run lint         # Chạy ESLint

# Preview
npm run preview      # Preview production build
```

## 🏗️ Kiến Trúc

Dự án sử dụng kiến trúc **Feature-Based** với các layer rõ ràng:

- **Presentation Layer** - Components và Pages
- **Business Logic Layer** - Services và Hooks
- **Data Layer** - API Services
- **Infrastructure Layer** - Utils, Config, Types

Xem chi tiết tại [ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## 📖 Hướng Dẫn Đọc Code

### Tìm Feature

1. **Pages** → `pages/[feature]/` - Trang chính của feature
2. **Components** → `components/features/[feature]/` - Components của feature
3. **Services** → `services/[feature].service.ts` - API calls
4. **Types** → `types/[feature].types.ts` - Type definitions

### Luồng Code

```
User Action → Component → Service → API → Response → State → UI Re-render
```

Xem chi tiết tại [QUICK_START.md](./docs/QUICK_START.md)

## 🤝 Đóng Góp

### Quy Trình

1. Fork repository
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: thêm tính năng X"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

### Code Style

- Sử dụng TypeScript types
- Tuân thủ ESLint rules
- Sử dụng barrel exports
- Không hardcode values
- Không duplicate code

Xem chi tiết tại [ARCHITECTURE.md](./docs/ARCHITECTURE.md#best-practices)

## 📝 Environment Variables

Tạo file `.env.local`:

```env
VITE_API_URL=http://localhost:8080
```

## 🧪 Testing

```bash
# Chạy linter
npm run lint

# Kiểm tra TypeScript
npm run build
```

## 📦 Build

```bash
# Build cho production
npm run build

# Output sẽ ở thư mục dist/
```

## 🐛 Troubleshooting

### Lỗi Import

- Đảm bảo sử dụng barrel exports: `import { X } from '@/components'`
- Kiểm tra đường dẫn import có đúng không

### Lỗi TypeScript

- Chạy `npm run build` để xem lỗi chi tiết
- Đảm bảo đã định nghĩa types trong `types/`

### API không kết nối được

- Kiểm tra `VITE_API_URL` trong `.env.local`
- Đảm bảo backend đang chạy

## 📄 License

[License information]

## 👥 Team

Development Team

---

**Cần giúp đỡ?** Xem [ARCHITECTURE.md](./docs/ARCHITECTURE.md) hoặc [QUICK_START.md](./docs/QUICK_START.md)
