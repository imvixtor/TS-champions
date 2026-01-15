# HƯỚNG DẪN QUY TRÌNH CỘNG TÁC PHÁT TRIỂN PHẦN MỀM

**Phiên bản:** 1.0  
**Ngày ban hành:** 2025-01-15  
**Phạm vi áp dụng:** Toàn bộ thành viên tham gia phát triển dự án TS-champions

---

## MỤC LỤC

1. [Tổng quan](#tổng-quan)
2. [Kiến trúc Repository](#kiến-trúc-repository)
3. [Quy trình làm việc với Fork](#quy-trình-làm-việc-với-fork)
4. [Chiến lược Branching](#chiến-lược-branching)
5. [Quy tắc Commit Message](#quy-tắc-commit-message)
6. [Quy trình Pull Request](#quy-trình-pull-request)
7. [Code Review Guidelines](#code-review-guidelines)
8. [Quy tắc Coding Standards](#quy-tắc-coding-standards)
9. [Xử lý Conflicts](#xử-lý-conflicts)
10. [Troubleshooting](#troubleshooting)
11. [Phụ lục](#phụ-lục)

---

## TỔNG QUAN

### 1.1. Mục đích

Tài liệu này quy định quy trình cộng tác phát triển phần mềm cho dự án TS-champions, đảm bảo:
- **Tính nhất quán**: Tất cả thành viên tuân thủ cùng một quy trình làm việc
- **Chất lượng mã nguồn**: Code được review kỹ lưỡng trước khi merge
- **Truy vết**: Lịch sử commit rõ ràng, dễ theo dõi
- **Hiệu quả**: Tránh conflicts và các vấn đề kỹ thuật không cần thiết

### 1.2. Đối tượng áp dụng

- Tất cả thành viên tham gia phát triển dự án
- Code reviewers
- Project maintainers

### 1.3. Nguyên tắc cơ bản

1. **Luôn làm việc trên Fork của riêng bạn**, không commit trực tiếp vào repository chính
2. **Một feature = một branch**, không mix nhiều tính năng trong cùng một branch
3. **Commit thường xuyên** với message rõ ràng, mô tả đầy đủ
4. **Luôn sync với upstream** trước khi tạo Pull Request
5. **Code review là bắt buộc** trước khi merge vào main branch

---

## KIẾN TRÚC REPOSITORY

### 2.1. Cấu trúc Repository

Dự án TS-champions bao gồm hai module chính:

```
TS-champions/
├── football-manager/          # Backend (Java Spring Boot)
│   ├── src/
│   └── pom.xml
└── football-manager-fe/        # Frontend (React + TypeScript)
    ├── src/
    └── package.json
```

### 2.2. Remote Repositories

- **Upstream**: Repository gốc mà bạn đã fork (repository của người khác)
- **Origin**: Fork của bạn trên GitHub
- **Local**: Repository trên máy tính của bạn

---

## QUY TRÌNH LÀM VIỆC VỚI FORK

### 3.1. Thiết lập ban đầu

#### Bước 1: Fork Repository

1. Truy cập repository gốc trên GitHub
2. Click nút **"Fork"** ở góc trên bên phải
3. Chọn tài khoản hoặc organization để fork về

#### Bước 2: Clone Fork về máy local

```bash
git clone https://github.com/YOUR_USERNAME/TS-champions.git
cd TS-champions
```

#### Bước 3: Thêm Upstream Remote

```bash
# Thêm upstream remote (repository gốc)
git remote add upstream https://github.com/ORIGINAL_OWNER/TS-champions.git

# Kiểm tra các remote đã cấu hình
git remote -v
```

Kết quả mong đợi:
```
origin    https://github.com/YOUR_USERNAME/TS-champions.git (fetch)
origin    https://github.com/YOUR_USERNAME/TS-champions.git (push)
upstream  https://github.com/ORIGINAL_OWNER/TS-champions.git (fetch)
upstream  https://github.com/ORIGINAL_OWNER/TS-champions.git (push)
```

### 3.2. Quy trình làm việc hàng ngày

#### Bước 1: Đồng bộ với Upstream

**QUAN TRỌNG**: Luôn sync với upstream trước khi bắt đầu làm việc mới hoặc tạo PR.

```bash
# Chuyển về branch main
git checkout main

# Fetch các thay đổi từ upstream
git fetch upstream

# Merge các thay đổi từ upstream/main vào main local
git merge upstream/main

# Push các thay đổi đã sync lên origin (fork của bạn)
git push origin main
```

#### Bước 2: Tạo Feature Branch

```bash
# Đảm bảo bạn đang ở main và đã sync với upstream
git checkout main
git pull upstream main

# Tạo và chuyển sang branch mới
git checkout -b feature/ten-tinh-nang-moi

# Hoặc sử dụng prefix khác tùy loại công việc:
# git checkout -b feature/user-authentication
# git checkout -b bugfix/fix-login-error
# git checkout -b hotfix/critical-security-patch
```

#### Bước 3: Phát triển tính năng

- Commit thường xuyên với message rõ ràng
- Không commit code chưa hoàn thiện hoặc có lỗi
- Không commit file cấu hình cá nhân (.env, IDE settings, etc.)

#### Bước 4: Push lên Origin

```bash
# Push branch lên fork của bạn
git push origin feature/ten-tinh-nang-moi

# Nếu branch chưa tồn tại trên remote, set upstream
git push -u origin feature/ten-tinh-nang-moi
```

#### Bước 5: Tạo Pull Request

1. Truy cập repository fork của bạn trên GitHub
2. Click **"Compare & pull request"** khi GitHub hiển thị thông báo
3. Hoặc vào tab **"Pull requests"** → **"New pull request"**
4. Chọn:
   - **Base repository**: Repository gốc (upstream)
   - **Base branch**: `main`
   - **Head repository**: Fork của bạn
   - **Compare branch**: `feature/ten-tinh-nang-moi`

#### Bước 6: Đồng bộ lại nếu Upstream có thay đổi

Nếu trong quá trình review, upstream có commit mới:

```bash
# Trên branch feature của bạn
git checkout feature/ten-tinh-nang-moi

# Fetch và merge từ upstream/main
git fetch upstream
git merge upstream/main

# Resolve conflicts nếu có (xem mục 9)
# Sau đó push lại
git push origin feature/ten-tinh-nang-moi
```

---

## CHIẾN LƯỢC BRANCHING

### 4.1. Quy tắc đặt tên Branch

Sử dụng prefix để phân loại branch:

| Prefix | Mục đích | Ví dụ |
|--------|----------|-------|
| `feature/` | Tính năng mới | `feature/user-profile-page` |
| `bugfix/` | Sửa lỗi | `bugfix/fix-login-validation` |
| `hotfix/` | Sửa lỗi khẩn cấp | `hotfix/security-vulnerability` |
| `refactor/` | Refactor code | `refactor/optimize-database-query` |
| `docs/` | Cập nhật tài liệu | `docs/update-api-documentation` |
| `test/` | Thêm test cases | `test/add-unit-tests-auth` |

### 4.2. Cấu trúc Branch

```
main (upstream)
  ├── feature/user-authentication
  ├── feature/match-scheduling
  ├── bugfix/fix-score-calculation
  └── hotfix/critical-api-error
```

### 4.3. Quy tắc Branch

1. **main branch**: Luôn ở trạng thái stable, chỉ merge từ PR đã được approve
2. **Feature branch**: Tạo từ main, phát triển tính năng, merge về main qua PR
3. **Hotfix branch**: Tạo từ main, sửa lỗi khẩn cấp, merge ngay sau khi fix
4. **Không bao giờ** force push lên main branch
5. **Xóa branch** sau khi PR đã được merge thành công

---

## QUY TẮC COMMIT MESSAGE

### 5.1. Format chuẩn

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 5.2. Các loại Type

| Type | Mô tả | Ví dụ |
|------|-------|-------|
| `feat` | Tính năng mới | `feat(auth): add JWT token refresh` |
| `fix` | Sửa lỗi | `fix(api): resolve null pointer exception` |
| `docs` | Cập nhật tài liệu | `docs(readme): update installation guide` |
| `style` | Formatting, không ảnh hưởng logic | `style: format code with prettier` |
| `refactor` | Refactor code | `refactor(service): extract common logic` |
| `test` | Thêm/sửa test | `test(auth): add login unit tests` |
| `chore` | Công việc bảo trì | `chore(deps): update dependencies` |
| `perf` | Cải thiện hiệu năng | `perf(db): optimize query performance` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

### 5.3. Scope (Tùy chọn)

Scope chỉ định module/component bị ảnh hưởng:
- `auth`, `user`, `match`, `tournament`, `team`, `player`
- `api`, `service`, `controller`, `repository`
- `frontend`, `backend`

### 5.4. Subject

- Viết ở thì hiện tại, mệnh lệnh cách: "add" không phải "added" hay "adds"
- Không viết hoa chữ cái đầu (trừ tên riêng)
- Không kết thúc bằng dấu chấm
- Giới hạn 50 ký tự
- Mô tả ngắn gọn "what" và "why", không cần "how"

### 5.5. Body (Tùy chọn)

- Giải thích chi tiết hơn về "what" và "why"
- So sánh với cách làm cũ nếu có
- Mỗi dòng không quá 72 ký tự
- Cách subject một dòng trống

### 5.6. Footer (Tùy chọn)

- Reference đến issue: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`

### 5.7. Ví dụ Commit Message

**Ví dụ 1: Commit đơn giản**
```
feat(auth): add user login functionality
```

**Ví dụ 2: Commit với body**
```
fix(api): resolve null pointer in match service

The service was throwing NullPointerException when 
retrieving matches for teams without players. Added 
null check before accessing player list.

Fixes #123
```

**Ví dụ 3: Commit với breaking change**
```
refactor(auth): migrate to JWT token authentication

BREAKING CHANGE: Old session-based authentication 
is no longer supported. All clients must update 
to use JWT tokens.
```

### 5.8. Lưu ý

- **Không commit** code có lỗi compile hoặc test fail
- **Không commit** file tạm, log, hoặc file cấu hình cá nhân
- **Commit thường xuyên** nhưng mỗi commit phải là một đơn vị logic hoàn chỉnh
- **Squash commits** nếu có nhiều commit nhỏ không cần thiết trước khi tạo PR

---

## QUY TRÌNH PULL REQUEST

### 6.1. Trước khi tạo PR

#### Checklist bắt buộc:

- [ ] Code đã được test kỹ lưỡng (unit test, integration test)
- [ ] Không có lỗi compile hoặc linter errors
- [ ] Đã sync với upstream/main mới nhất
- [ ] Commit messages tuân thủ quy tắc
- [ ] Code tuân thủ coding standards của dự án
- [ ] Đã tự review code của chính mình
- [ ] Đã cập nhật tài liệu nếu cần (README, API docs, etc.)

### 6.2. Tạo Pull Request

#### 6.2.1. Tiêu đề PR

Format: `<type>(<scope>): <mô tả ngắn gọn>`

Ví dụ:
- `feat(auth): implement user registration`
- `fix(api): resolve match score calculation error`
- `docs: update collaboration guide`

#### 6.2.2. Mô tả PR

Template mẫu:

```markdown
## Mô tả
<!-- Mô tả ngắn gọn về thay đổi này -->

## Loại thay đổi
<!-- Đánh dấu loại thay đổi -->
- [ ] Tính năng mới (feature)
- [ ] Sửa lỗi (bug fix)
- [ ] Refactor
- [ ] Cập nhật tài liệu
- [ ] Cải thiện hiệu năng
- [ ] Khác: <!-- Mô tả -->

## Cách test
<!-- Hướng dẫn cách test thay đổi này -->
1. Bước 1
2. Bước 2
3. Kết quả mong đợi

## Screenshots (nếu có)
<!-- Thêm screenshots cho UI changes -->

## Checklist
- [ ] Code đã được test
- [ ] Không có lỗi linter
- [ ] Đã cập nhật tài liệu
- [ ] Đã sync với upstream/main
- [ ] Commit messages tuân thủ quy tắc

## Related Issues
<!-- Reference đến issue liên quan -->
Closes #123
Fixes #456
```

### 6.3. Quy trình Review

1. **Tự động**: CI/CD sẽ chạy tests và linter
2. **Code Review**: Ít nhất 1 reviewer phải approve
3. **Approval**: Maintainer sẽ review và approve/request changes
4. **Merge**: Sau khi được approve, PR sẽ được merge vào main

### 6.4. Xử lý Review Comments

Khi nhận được review comments:

1. Đọc kỹ và hiểu rõ feedback
2. Thảo luận nếu cần làm rõ
3. Commit các thay đổi theo feedback
4. Push lên cùng branch (PR sẽ tự động update)
5. Comment "Đã cập nhật" hoặc "Resolved" trên comment của reviewer

### 6.5. Sau khi PR được Merge

```bash
# Xóa branch local
git checkout main
git pull upstream main
git branch -d feature/ten-tinh-nang-moi

# Xóa branch trên remote (nếu chưa tự động)
git push origin --delete feature/ten-tinh-nang-moi
```

---

## CODE REVIEW GUIDELINES

### 7.1. Nguyên tắc Review

1. **Tôn trọng**: Phản hồi mang tính xây dựng, không chỉ trích cá nhân
2. **Rõ ràng**: Giải thích tại sao cần thay đổi, không chỉ nói "sai"
3. **Kịp thời**: Review trong vòng 24-48 giờ
4. **Toàn diện**: Kiểm tra logic, performance, security, maintainability

### 7.2. Checklist cho Reviewer

#### Functionality
- [ ] Code hoạt động đúng như mô tả trong PR
- [ ] Edge cases đã được xử lý
- [ ] Error handling phù hợp
- [ ] Không có hardcoded values không cần thiết

#### Code Quality
- [ ] Code dễ đọc và dễ hiểu
- [ ] Đặt tên biến/hàm rõ ràng, có ý nghĩa
- [ ] Không có code duplicate
- [ ] Tuân thủ coding standards của dự án

#### Performance
- [ ] Không có N+1 queries
- [ ] Database queries được optimize
- [ ] Không có memory leaks tiềm ẩn
- [ ] API response time hợp lý

#### Security
- [ ] Input validation đầy đủ
- [ ] Không có SQL injection, XSS vulnerabilities
- [ ] Authentication/Authorization được xử lý đúng
- [ ] Không commit secrets, API keys

#### Testing
- [ ] Có test coverage cho code mới
- [ ] Tests có ý nghĩa và dễ maintain
- [ ] Edge cases đã được test

#### Documentation
- [ ] Code có comments khi cần thiết
- [ ] API documentation đã được cập nhật
- [ ] README đã được cập nhật nếu cần

### 7.3. Cách đưa ra Feedback

**Tốt:**
```
Suggestion: Có thể extract logic này thành một method riêng 
để tái sử dụng. Ví dụ: `calculateMatchScore(match)` 
sẽ giúp code dễ đọc hơn.
```

**Không tốt:**
```
Code này sai rồi, phải viết lại.
```

### 7.4. Approval Criteria

PR được approve khi:
- ✅ Tất cả comments đã được giải quyết
- ✅ CI/CD checks pass
- ✅ Ít nhất 1 reviewer approve
- ✅ Maintainer approve (nếu có thay đổi lớn)

---

## QUY TẮC CODING STANDARDS

### 8.1. Backend (Java)

#### 8.1.1. Code Style
- Tuân thủ Java Code Conventions
- Sử dụng 4 spaces cho indentation
- Tên class: PascalCase (`UserService`)
- Tên method/variable: camelCase (`getUserById`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)

#### 8.1.2. Best Practices
- Sử dụng dependency injection
- Service layer xử lý business logic
- Repository layer chỉ truy cập database
- Controller layer chỉ xử lý HTTP requests/responses
- Validate input ở controller hoặc sử dụng `@Valid`
- Xử lý exceptions bằng `@ControllerAdvice`

#### 8.1.3. Documentation
- Javadoc cho public methods
- Comments giải thích logic phức tạp

### 8.2. Frontend (TypeScript/React)

#### 8.2.1. Code Style
- Tuân thủ ESLint và Prettier config
- Sử dụng 2 spaces cho indentation
- Tên component: PascalCase (`UserProfile`)
- Tên function/variable: camelCase (`getUserData`)
- Tên constant: UPPER_SNAKE_CASE (`API_BASE_URL`)

#### 8.2.2. Best Practices
- Functional components với hooks
- TypeScript types/interfaces rõ ràng
- Tách logic ra custom hooks khi cần
- Component nhỏ, tập trung vào một nhiệm vụ
- Sử dụng Context API cho state management toàn cục
- Error boundaries cho error handling

#### 8.2.3. File Organization
```
src/
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── types/
│   └── ...
├── core/
│   ├── api/
│   ├── context/
│   └── utils/
└── ...
```

### 8.3. General Rules

- **Không commit** file cấu hình cá nhân (`.env.local`, `.idea/`, `.vscode/`)
- **Không commit** file build (`dist/`, `target/`, `node_modules/`)
- **Không commit** file log hoặc database dumps
- Luôn check `.gitignore` trước khi commit

---

## XỬ LÝ CONFLICTS

### 9.1. Khi nào xảy ra Conflict?

Conflict xảy ra khi:
- Nhiều người cùng sửa một file tại cùng vị trí
- Upstream có thay đổi trong khi bạn đang phát triển feature
- Merge branch có thay đổi conflict với branch khác

### 9.2. Cách xử lý Conflict

#### Bước 1: Sync với Upstream

```bash
git checkout feature/ten-tinh-nang-moi
git fetch upstream
git merge upstream/main
```

#### Bước 2: Xác định files bị conflict

```bash
git status
```

Git sẽ liệt kê các file có conflict:
```
Unmerged paths:
  (use "git add <file>..." to mark as resolved)
        both modified:   src/main/java/.../UserService.java
```

#### Bước 3: Mở file và resolve conflict

Git sẽ đánh dấu conflict như sau:

```java
<<<<<<< HEAD
// Code của bạn
public User getUserById(Long id) {
    return userRepository.findById(id);
}
=======
// Code từ upstream
public User getUserById(Long id) {
    return userRepository.findById(id).orElseThrow();
}
>>>>>>> upstream/main
```

#### Bước 4: Quyết định giữ code nào

Có 3 lựa chọn:
1. **Giữ code của bạn**: Xóa dòng `=======` và `>>>>>>> upstream/main`
2. **Giữ code từ upstream**: Xóa từ `<<<<<<< HEAD` đến `=======`
3. **Giữ cả hai**: Giữ cả hai phần code và sắp xếp lại logic

#### Bước 5: Xóa conflict markers

Sau khi quyết định, xóa tất cả các dòng:
- `<<<<<<< HEAD`
- `=======`
- `>>>>>>> upstream/main`

#### Bước 6: Mark conflict đã resolved

```bash
# Sau khi sửa tất cả conflicts
git add <file-đã-sửa>

# Hoặc add tất cả
git add .
```

#### Bước 7: Hoàn tất merge

```bash
# Nếu đang merge
git commit

# Push lên origin
git push origin feature/ten-tinh-nang-moi
```

### 9.3. Lưu ý khi Resolve Conflict

1. **Đọc kỹ cả hai phần code** trước khi quyết định
2. **Test lại** sau khi resolve conflict
3. **Không chỉ giữ code của mình**, có thể code từ upstream tốt hơn
4. **Liên hệ với người tạo PR khác** nếu không chắc chắn
5. **Commit message** nên mô tả cách bạn đã resolve conflict

### 9.4. Tránh Conflict

- **Sync thường xuyên** với upstream
- **Giao tiếp** với team về phần code bạn đang làm
- **Tách nhỏ PR** thay vì một PR lớn
- **Làm việc trên các file khác nhau** khi có thể

---

## TROUBLESHOOTING

### 10.1. Lỗi thường gặp

#### Lỗi: "Your branch is behind 'origin/main'"

**Nguyên nhân**: Fork của bạn chưa sync với upstream.

**Giải pháp**:
```bash
git fetch upstream
git merge upstream/main
git push origin main
```

#### Lỗi: "Permission denied" khi push

**Nguyên nhân**: Chưa cấu hình SSH key hoặc credentials.

**Giải pháp**:
- Cấu hình SSH key trên GitHub
- Hoặc sử dụng Personal Access Token thay vì password

#### Lỗi: "Branch already exists" khi tạo branch

**Nguyên nhân**: Branch đã tồn tại trên remote.

**Giải pháp**:
```bash
# Xóa branch local và remote cũ
git branch -D feature/ten-tinh-nang-moi
git push origin --delete feature/ten-tinh-nang-moi

# Tạo lại branch mới
git checkout -b feature/ten-tinh-nang-moi
```

#### Lỗi: "Merge conflict" khi pull

**Giuyên nhân**: Local có thay đổi conflict với remote.

**Giải pháp**: Xem mục [9. Xử lý Conflicts](#xử-lý-conflicts)

#### Lỗi: "Detached HEAD"

**Nguyên nhân**: Đang ở trạng thái không có branch.

**Giải pháp**:
```bash
# Tạo branch mới từ HEAD hiện tại
git checkout -b temp-branch

# Hoặc quay về branch chính
git checkout main
```

### 10.2. Các lệnh Git hữu ích

```bash
# Xem lịch sử commit
git log --oneline --graph --all

# Xem thay đổi chưa commit
git diff

# Xem thay đổi đã staged
git diff --staged

# Undo file về trạng thái trước đó
git checkout -- <file>

# Undo commit (giữ thay đổi)
git reset --soft HEAD~1

# Undo commit (xóa thay đổi)
git reset --hard HEAD~1

# Xem các remote đã cấu hình
git remote -v

# Xem branch local và remote
git branch -a

# Xóa branch local
git branch -d <branch-name>

# Xóa branch remote
git push origin --delete <branch-name>
```

---

## PHỤ LỤC

### A. Git Workflow Diagram

```
[Upstream Repo]
     |
     | Fork
     v
[Your Fork]
     |
     | Clone
     v
[Local Repo]
     |
     | Create Branch
     v
[Feature Branch]
     |
     | Develop & Commit
     v
[Push to Fork]
     |
     | Create PR
     v
[Pull Request]
     |
     | Review & Approve
     v
[Merge to Upstream/main]
```

### B. Quick Reference Commands

#### Setup
```bash
git clone https://github.com/YOUR_USERNAME/TS-champions.git
cd TS-champions
git remote add upstream https://github.com/ORIGINAL_OWNER/TS-champions.git
```

#### Daily Workflow
```bash
# Sync với upstream
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# Tạo feature branch
git checkout -b feature/new-feature

# Develop và commit
git add .
git commit -m "feat(scope): description"

# Push và tạo PR
git push origin feature/new-feature
```

#### After PR Merged
```bash
git checkout main
git pull upstream main
git branch -d feature/new-feature
git push origin --delete feature/new-feature
```

### C. Commit Message Template

Tạo file `.gitmessage` trong home directory:

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
```

Sử dụng:
```bash
git config --global commit.template ~/.gitmessage
```

### D. Useful Git Aliases

Thêm vào `~/.gitconfig`:

```ini
[alias]
    co = checkout
    br = branch
    ci = commit
    st = status
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    sync = !git fetch upstream && git merge upstream/main
```

### E. Resources

- [Git Official Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Pull Request Best Practices](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)

---

## LIÊN HỆ VÀ HỖ TRỢ

Nếu có thắc mắc hoặc cần hỗ trợ về quy trình cộng tác:

1. Tạo issue trên GitHub repository
2. Liên hệ qua team chat/channel
3. Tham khảo tài liệu này và các resources trong Phụ lục E

---

**Lưu ý**: Tài liệu này sẽ được cập nhật định kỳ dựa trên feedback và thực tế sử dụng. Mọi đề xuất cải thiện đều được hoan nghênh.

---

*Tài liệu này được tạo và duy trì bởi team phát triển TS-champions.*
