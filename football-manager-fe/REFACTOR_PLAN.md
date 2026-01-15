# 📋 Kế Hoạch Refactor Dự Án Frontend

## 🎯 Mục Tiêu

Refactor dự án từ cấu trúc **modules-based** sang cấu trúc **feature-based hiện đại** với các thư mục chuẩn:
- `assets/` - Tài nguyên tĩnh (images, icons, fonts)
- `components/` - Components tái sử dụng
- `contexts/` - React Context providers
- `hooks/` - Custom React hooks
- `pages/` - Các trang (pages/routes)
- `routes/` - Cấu hình routing
- `services/` - API services và business logic
- `styles/` - Global styles, themes
- `utils/` - Utility functions

---

## 📊 Phân Tích Cấu Trúc Hiện Tại

### Cấu trúc hiện tại:
```
src/
├── assets/
│   └── react.svg
├── modules/
│   ├── admin/
│   │   ├── layouts/AdminLayout.tsx
│   │   └── pages/ (6 pages)
│   ├── auth/
│   │   └── pages/LoginPage.tsx
│   ├── coach/
│   │   ├── layouts/CoachLayout.tsx
│   │   └── pages/ (3 pages)
│   ├── core/
│   │   ├── api/axiosClient.ts
│   │   └── context/ (AuthContext, AuthProvider, useAuth)
│   └── public/
│       ├── components/ (3 components)
│       └── pages/ (2 pages)
├── App.tsx
├── main.tsx
└── index.css
```

### Vấn đề:
- ❌ Cấu trúc modules phân tán logic
- ❌ Components nằm rải rác trong từng module
- ❌ API calls chưa được tổ chức thành services
- ❌ Hooks và utils chưa được tách riêng
- ❌ Routes được định nghĩa trực tiếp trong App.tsx

---

## 🏗️ Cấu Trúc Mục Tiêu

```
src/
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── components/
│   ├── common/          # Components dùng chung
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   ├── layout/          # Layout components
│   │   ├── AdminLayout/
│   │   ├── CoachLayout/
│   │   └── PublicLayout/
│   └── features/        # Feature-specific components
│       ├── match/
│       ├── team/
│       └── tournament/
├── contexts/
│   ├── AuthContext.tsx
│   └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── index.ts
├── pages/
│   ├── public/
│   │   ├── HomePage.tsx
│   │   └── StandingPage.tsx
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── admin/
│   │   ├── AdminMatchPage.tsx
│   │   ├── AdminTeamPage.tsx
│   │   ├── AdminPlayerPage.tsx
│   │   ├── AdminTournamentPage.tsx
│   │   ├── AdminSchedulePage.tsx
│   │   └── MatchConsolePage.tsx
│   └── coach/
│       ├── CoachMatchList.tsx
│       ├── CoachLineupPage.tsx
│       └── CoachSquadPage.tsx
├── routes/
│   ├── index.tsx        # Route configuration
│   ├── ProtectedRoute.tsx
│   └── routes.config.ts
├── services/
│   ├── api/
│   │   ├── client.ts    # axiosClient
│   │   └── interceptors.ts
│   ├── auth.service.ts
│   ├── match.service.ts
│   ├── team.service.ts
│   ├── player.service.ts
│   ├── tournament.service.ts
│   └── index.ts
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── themes.css
├── utils/
│   ├── auth.utils.ts
│   ├── date.utils.ts
│   ├── format.utils.ts
│   └── index.ts
├── App.tsx
├── main.tsx
└── types/
    └── index.ts         # TypeScript types/interfaces
```

---

## 📅 Kế Hoạch Refactor Theo Giai Đoạn

### ✅ Giai Đoạn 1: Chuẩn Bị & Setup Cấu Trúc Cơ Bản
**Thời gian ước tính: 1-2 giờ**  
**Mức độ rủi ro: Thấp**

#### Mục tiêu:
- Tạo cấu trúc thư mục mới
- Di chuyển các file cơ bản
- Đảm bảo app vẫn chạy được

#### Các bước thực hiện:

1. **Tạo cấu trúc thư mục mới**
   ```bash
   mkdir -p src/components/{common,layout,features}
   mkdir -p src/contexts
   mkdir -p src/hooks
   mkdir -p src/pages/{public,auth,admin,coach}
   mkdir -p src/routes
   mkdir -p src/services/api
   mkdir -p src/styles
   mkdir -p src/utils
   mkdir -p src/types
   ```

2. **Di chuyển assets**
   - Di chuyển `src/assets/react.svg` → giữ nguyên hoặc tổ chức lại
   - Tạo thư mục con: `images/`, `icons/`, `fonts/` nếu cần

3. **Di chuyển contexts**
   - Di chuyển `src/modules/core/context/*` → `src/contexts/`
   - Cập nhật imports trong các file sử dụng

4. **Di chuyển hooks**
   - Di chuyển `src/modules/core/context/useAuth.ts` → `src/hooks/useAuth.ts`
   - Tạo `src/hooks/index.ts` để export

5. **Di chuyển utils**
   - Di chuyển `src/modules/core/context/auth.utils.ts` → `src/utils/auth.utils.ts`
   - Tạo `src/utils/index.ts`

6. **Di chuyển styles**
   - Di chuyển `src/index.css` → `src/styles/globals.css`
   - Cập nhật import trong `main.tsx`

7. **Kiểm tra và test**
   - Chạy `npm run dev` để đảm bảo không có lỗi
   - Test các chức năng cơ bản

#### Checklist:
- [ ] Cấu trúc thư mục mới đã được tạo
- [ ] Assets đã được di chuyển
- [ ] Contexts đã được di chuyển và imports đã cập nhật
- [ ] Hooks đã được di chuyển và imports đã cập nhật
- [ ] Utils đã được di chuyển và imports đã cập nhật
- [ ] Styles đã được di chuyển và imports đã cập nhật
- [ ] App vẫn chạy được sau khi di chuyển

---

### ✅ Giai Đoạn 2: Tổ Chức Services & API
**Thời gian ước tính: 2-3 giờ**  
**Mức độ rủi ro: Trung bình**

#### Mục tiêu:
- Tách API client thành services
- Tổ chức các API calls theo domain
- Tạo service layer chuẩn

#### Các bước thực hiện:

1. **Di chuyển API client**
   - Di chuyển `src/modules/core/api/axiosClient.ts` → `src/services/api/client.ts`
   - Tách interceptors ra file riêng: `src/services/api/interceptors.ts`
   - Refactor để dễ maintain hơn

2. **Tạo các service files**
   - `src/services/auth.service.ts` - Authentication APIs
   - `src/services/match.service.ts` - Match APIs
   - `src/services/team.service.ts` - Team APIs
   - `src/services/player.service.ts` - Player APIs
   - `src/services/tournament.service.ts` - Tournament APIs

3. **Implement các service methods**
   - Xem các API calls hiện tại trong pages
   - Extract thành service methods
   - Sử dụng TypeScript types cho request/response

4. **Tạo service index**
   - `src/services/index.ts` - Export tất cả services

5. **Cập nhật imports trong pages**
   - Thay thế direct API calls bằng service calls
   - Test từng page sau khi refactor

#### Checklist:
- [ ] API client đã được di chuyển và refactor
- [ ] Interceptors đã được tách riêng
- [ ] Auth service đã được tạo và implement
- [ ] Match service đã được tạo và implement
- [ ] Team service đã được tạo và implement
- [ ] Player service đã được tạo và implement
- [ ] Tournament service đã được tạo và implement
- [ ] Tất cả pages đã được cập nhật để dùng services
- [ ] Test các chức năng API

---

### ✅ Giai Đoạn 3: Tổ Chức Components
**Thời gian ước tính: 3-4 giờ**  
**Mức độ rủi ro: Trung bình**

#### Mục tiêu:
- Di chuyển và tổ chức lại components
- Tách common components
- Tổ chức feature-specific components

#### Các bước thực hiện:

1. **Di chuyển layout components**
   - `src/modules/admin/layouts/AdminLayout.tsx` → `src/components/layout/AdminLayout/AdminLayout.tsx`
   - `src/modules/coach/layouts/CoachLayout.tsx` → `src/components/layout/CoachLayout/CoachLayout.tsx`
   - Tạo PublicLayout nếu cần

2. **Di chuyển public components**
   - `src/modules/public/components/*` → `src/components/features/match/` hoặc `src/components/common/`
   - Phân loại: MatchCard, MatchDetailModal → features/match
   - Navbar → components/common hoặc layout

3. **Tạo common components (nếu chưa có)**
   - Button, Input, Modal, Card, etc.
   - Hoặc giữ lại để refactor sau

4. **Tổ chức feature components**
   - Tạo thư mục theo feature: `match/`, `team/`, `tournament/`
   - Di chuyển components liên quan vào đúng feature

5. **Cập nhật imports**
   - Cập nhật tất cả imports trong pages và components khác
   - Sử dụng barrel exports (index.ts) nếu cần

#### Checklist:
- [ ] Layout components đã được di chuyển
- [ ] Public components đã được di chuyển và phân loại
- [ ] Common components đã được tổ chức
- [ ] Feature components đã được tổ chức
- [ ] Tất cả imports đã được cập nhật
- [ ] Test UI/UX sau khi di chuyển

---

### ✅ Giai Đoạn 4: Tổ Chức Pages & Routes
**Thời gian ước tính: 2-3 giờ**  
**Mức độ rủi ro: Trung bình**

#### Mục tiêu:
- Di chuyển tất cả pages vào thư mục pages/
- Tách routing logic ra khỏi App.tsx
- Tạo ProtectedRoute component riêng

#### Các bước thực hiện:

1. **Di chuyển pages**
   - `src/modules/public/pages/*` → `src/pages/public/`
   - `src/modules/auth/pages/*` → `src/pages/auth/`
   - `src/modules/admin/pages/*` → `src/pages/admin/`
   - `src/modules/coach/pages/*` → `src/pages/coach/`

2. **Tạo ProtectedRoute component**
   - Extract logic từ App.tsx
   - `src/routes/ProtectedRoute.tsx`
   - Cải thiện logic nếu cần

3. **Tạo routes configuration**
   - `src/routes/routes.config.ts` - Định nghĩa route config
   - `src/routes/index.tsx` - Route component chính

4. **Refactor App.tsx**
   - Import routes từ `src/routes/index.tsx`
   - Giữ logic tối thiểu trong App.tsx

5. **Cập nhật imports**
   - Cập nhật tất cả imports liên quan đến pages và routes

#### Checklist:
- [ ] Tất cả pages đã được di chuyển
- [ ] ProtectedRoute đã được tách riêng
- [ ] Routes configuration đã được tạo
- [ ] App.tsx đã được refactor
- [ ] Tất cả imports đã được cập nhật
- [ ] Test routing và navigation

---

### ✅ Giai Đoạn 5: Tổ Chức Types & Interfaces
**Thời gian ước tính: 1-2 giờ**  
**Mức độ rủi ro: Thấp**

#### Mục tiêu:
- Tập trung tất cả types/interfaces vào một nơi
- Tổ chức types theo domain
- Cải thiện type safety

#### Các bước thực hiện:

1. **Tạo thư mục types**
   - `src/types/index.ts` - Export tất cả types
   - Hoặc tổ chức theo domain:
     - `src/types/auth.types.ts`
     - `src/types/match.types.ts`
     - `src/types/team.types.ts`
     - etc.

2. **Extract types từ các files**
   - Tìm tất cả interface/type definitions trong pages, components
   - Di chuyển vào `src/types/`
   - Cập nhật imports

3. **Tạo shared types**
   - User, Role, ApiResponse, etc.
   - Types dùng chung

4. **Cập nhật services**
   - Sử dụng types từ `src/types/` trong services
   - Cải thiện type safety

#### Checklist:
- [ ] Thư mục types đã được tạo
- [ ] Types đã được extract và tổ chức
- [ ] Shared types đã được tạo
- [ ] Services đã sử dụng types
- [ ] Tất cả imports đã được cập nhật

---

### ✅ Giai Đoạn 6: Tối Ưu Hóa & Cleanup
**Thời gian ước tính: 2-3 giờ**  
**Mức độ rủi ro: Thấp**

#### Mục tiêu:
- Xóa thư mục modules cũ
- Tối ưu imports với barrel exports
- Code cleanup và refactor nhỏ

#### Các bước thực hiện:

1. **Tạo barrel exports**
   - `src/components/index.ts`
   - `src/hooks/index.ts`
   - `src/services/index.ts`
   - `src/utils/index.ts`
   - `src/types/index.ts`

2. **Tối ưu imports**
   - Sử dụng barrel exports thay vì import trực tiếp
   - Giảm số lượng import statements

3. **Xóa thư mục cũ**
   - Xóa `src/modules/` sau khi đã di chuyển hết
   - Đảm bảo không còn file nào tham chiếu đến modules/

4. **Code cleanup**
   - Xóa unused imports
   - Format code
   - Fix linter warnings

5. **Final testing**
   - Test toàn bộ ứng dụng
   - Test các chức năng chính
   - Test routing
   - Test API calls

#### Checklist:
- [ ] Barrel exports đã được tạo
- [ ] Imports đã được tối ưu
- [ ] Thư mục modules/ đã được xóa
- [ ] Code đã được cleanup
- [ ] Linter không còn warnings
- [ ] Toàn bộ ứng dụng đã được test

---

## 🔄 Quy Trình Refactor An Toàn

### Trước mỗi giai đoạn:
1. ✅ Commit code hiện tại
2. ✅ Tạo branch mới: `git checkout -b refactor/phase-X`
3. ✅ Đảm bảo app đang chạy ổn định

### Trong quá trình refactor:
1. ✅ Refactor từng phần nhỏ
2. ✅ Test sau mỗi thay đổi lớn
3. ✅ Commit thường xuyên với message rõ ràng

### Sau mỗi giai đoạn:
1. ✅ Test toàn bộ ứng dụng
2. ✅ Fix bugs nếu có
3. ✅ Commit và merge vào main (hoặc tạo PR)

---

## 📝 Lưu Ý Quan Trọng

### ⚠️ Rủi ro và cách xử lý:

1. **Import errors**
   - Sử dụng IDE để tự động refactor imports
   - Tìm và thay thế: `src/modules/` → `src/`
   - Test ngay sau khi thay đổi imports

2. **Circular dependencies**
   - Tránh import vòng tròn giữa components/services
   - Sử dụng barrel exports cẩn thận

3. **Breaking changes**
   - Giữ nguyên API của components/services trong giai đoạn đầu
   - Refactor internal implementation trước
   - Thay đổi API sau khi đã ổn định

4. **Git conflicts**
   - Refactor trên branch riêng
   - Merge thường xuyên từ main
   - Resolve conflicts sớm

### 💡 Best Practices:

1. **Từng bước một**
   - Không refactor tất cả cùng lúc
   - Hoàn thành từng giai đoạn trước khi chuyển sang giai đoạn tiếp theo

2. **Test thường xuyên**
   - Test sau mỗi thay đổi lớn
   - Sử dụng browser DevTools để debug

3. **Documentation**
   - Cập nhật README nếu cần
   - Comment code phức tạp

4. **Code review**
   - Nếu làm việc nhóm, review code sau mỗi giai đoạn
   - Đảm bảo code quality

---

## 📊 Tiến Độ

### Giai đoạn 1: Chuẩn bị & Setup
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

### Giai đoạn 2: Services & API
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

### Giai đoạn 3: Components
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

### Giai đoạn 4: Pages & Routes
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

### Giai đoạn 5: Types & Interfaces
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

### Giai đoạn 6: Tối ưu hóa & Cleanup
- [ ] Chưa bắt đầu
- [ ] Đang thực hiện
- [ ] Hoàn thành

---

## 🎉 Kết Quả Mong Đợi

Sau khi hoàn thành refactor:

✅ **Cấu trúc rõ ràng, dễ maintain**
- Mỗi thư mục có mục đích rõ ràng
- Dễ tìm file và code

✅ **Code organization tốt hơn**
- Services tách biệt khỏi components
- Reusable components dễ tìm
- Utils và hooks tập trung

✅ **Scalability**
- Dễ thêm features mới
- Dễ thêm components mới
- Dễ maintain và extend

✅ **Developer experience tốt hơn**
- Imports rõ ràng
- Code dễ đọc và hiểu
- Dễ onboard developer mới

---

## 📚 Tài Liệu Tham Khảo

- [React Project Structure Best Practices](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Folder Structure](https://www.robinwieruch.de/react-folder-structure/)

---

**Ngày tạo:** $(date)  
**Phiên bản:** 1.0.0  
**Tác giả:** Development Team
