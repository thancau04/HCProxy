# 📜 AGENT.md — Quy chuẩn Vận hành Hệ thống HCProxy

> **Phiên bản:** 1.0.0  
> **Cập nhật lần cuối:** 2026-10-05  
> **Vai trò:** Tệp này là **hiến pháp bất khả xâm phạm** chỉ huy toàn bộ hành vi xử lý mã nguồn của AI Agent trong dự án HCProxy. Mọi thao tác sinh mã, chỉnh sửa, xóa, di chuyển file hay tương tác với hệ thống đều **bắt buộc** tuân thủ các điều khoản dưới đây.

---

## 1. Tổng quan Dự án & Cấu trúc Monorepo

### 1.1 Định danh Dự án

| Thuộc tính        | Giá trị                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| **Tên dự án**      | HCProxy                                                                 |
| **Mô tả**          | Hệ thống điều phối, quản trị và kiểm soát proxy đa giao thức           |
| **Kiến trúc**      | Monorepo — Frontend SPA + Backend API + Database migrations             |
| **Thư mục gốc**    | `C:\Users\Administrator\Desktop\HCProxy\`                               |

### 1.2 Cấu trúc Thư mục Chuẩn

```
HCProxy/                          ← Thư mục gốc Monorepo (chứa .git duy nhất)
│
├── ProxyApp/                     ← Client SPA & Hybrid Mobile App
│   ├── src/
│   │   ├── assets/               ← Tài nguyên tĩnh (hình ảnh, icon, font)
│   │   ├── components/           ← Vue 3 components tái sử dụng
│   │   ├── composables/          ← Composition API hooks chia sẻ logic
│   │   ├── layouts/              ← Layout wrappers (MainLayout, AuthLayout)
│   │   ├── pages/                ← Page-level components (ánh xạ route)
│   │   ├── router/               ← Vue Router — định tuyến & navigation guards
│   │   ├── stores/               ← Pinia stores — quản lý trạng thái tập trung
│   │   ├── utils/                ← Tiện ích dùng chung (api.js, formatters, helpers)
│   │   └── App.vue               ← Root component
│   ├── public/                   ← Tài nguyên công khai (favicon, manifest)
│   ├── index.html                ← Entry point HTML
│   ├── vite.config.js            ← Cấu hình Vite bundler
│   ├── tailwind.config.js        ← Cấu hình Tailwind CSS
│   └── package.json              ← Dependencies & scripts
│
├── ProxyServer/                  ← Core Engine & RESTful API Backend
│   ├── Controllers/              ← API Controllers (REST endpoints)
│   ├── Models/                   ← Entity models & DTOs
│   ├── Services/                 ← Business logic layer
│   ├── Middleware/               ← Custom middleware (Auth, Logging, ErrorHandling)
│   ├── Helpers/                  ← Utility classes (JWT generator, Hasher)
│   ├── Program.cs                ← Application entry point & DI container
│   ├── appsettings.json          ← Cấu hình runtime (non-secret)
│   ├── appsettings.Example.json  ← Mẫu cấu hình (commit-safe)
│   └── ProxyServer.csproj        ← Project file (.NET)
│
├── database/                     ← Quản lý lược đồ PostgreSQL
│   ├── migrations/               ← Tệp SQL migration đánh số thứ tự
│   ├── schema.sql                ← Full schema snapshot hiện tại
│   └── seed.sql                  ← Dữ liệu mẫu khởi tạo
│
├── docs/                         ← Tài liệu kỹ thuật & thiết kế
│   ├── architecture/             ← Sơ đồ kiến trúc hệ thống
│   ├── mockups/                  ← Mockup giao diện UI/UX
│   └── specs/                    ← Đặc tả tính năng chi tiết
│
├── skills/                       ← Quy trình SOP chuẩn cho tác vụ chuyên biệt
│   └── <tên-skill>/
│       └── skill.md              ← Hướng dẫn thực thi skill
│
├── .gitignore                    ← Quy tắc loại trừ file khỏi Git
├── .env.example                  ← Mẫu biến môi trường (commit-safe)
├── AGENT.md                      ← ⭐ TỆP NÀY — Quy chuẩn vận hành
└── README.md                     ← Giới thiệu tổng quan dự án
```

### 1.3 Technology Stack

| Tầng          | Công nghệ                                                                          |
| ------------- | ----------------------------------------------------------------------------------- |
| **Frontend**  | Vue 3 (Composition API, `<script setup>`), Vite, Tailwind CSS, Pinia, Vue Router    |
| **Backend**   | ASP.NET Core, Kestrel (port `5243`), ngrok tunnel (test ngoại mạng)                 |
| **Database**  | PostgreSQL, SQL migration thủ công                                                  |
| **Auth**      | JWT Bearer (stateless), BCrypt/Argon2 password hashing                              |

---

## 2. Nguyên tắc An toàn & Giới hạn Quyền hạn

### 2.1 Kiểm soát Git — An toàn Tuyệt đối

| Quy tắc | Mô tả |
| -------- | ------ |
| **Kho Git duy nhất** | Thư mục `.git/` chỉ được phép tồn tại tại gốc `HCProxy/`. **Nghiêm cấm** khởi tạo hoặc để tồn tại `.git` bên trong `ProxyApp/`, `ProxyServer/`, `database/` hay bất kỳ thư mục con nào. |
| **Cấm force push** | Không được sử dụng `git push --force` hoặc `git reset --hard` trừ khi người dùng **chỉ định rõ ràng bằng văn bản**. |
| **Conventional Commits** | Mọi thông điệp commit phải tuân thủ định dạng chuẩn. |

**Định dạng Conventional Commits bắt buộc:**

```
<type>(<scope>): <mô tả ngắn gọn>

[body — tùy chọn]
[footer — tùy chọn]
```

Các `type` hợp lệ:

| Type         | Ngữ cảnh sử dụng                                    |
| ------------ | ---------------------------------------------------- |
| `feat`       | Tính năng mới                                        |
| `fix`        | Sửa lỗi                                             |
| `refactor`   | Tái cấu trúc mã (không thay đổi hành vi)            |
| `docs`       | Cập nhật tài liệu                                   |
| `chore`      | Bảo trì, cập nhật dependencies, cấu hình CI/CD      |
| `style`      | Định dạng mã (không ảnh hưởng logic)                 |
| `test`       | Thêm hoặc sửa test cases                            |
| `perf`       | Cải thiện hiệu năng                                 |

Ví dụ:
```
feat(proxy-app): thêm trang quản lý danh sách proxy node
fix(proxy-server): xử lý race condition khi forward request đồng thời
docs(agent): cập nhật quy chuẩn Conventional Commits
```

### 2.2 Bảo mật & Biến Môi trường

> **⚠️ CẢNH BÁO TUYỆT ĐỐI:** Các quy tắc dưới đây không có ngoại lệ.

- **KHÔNG BAO GIỜ** commit các tệp hoặc giá trị sau vào Git:
  - `.env` (tệp biến môi trường thật)
  - Khóa bí mật JWT (`JwtSecret`, `SigningKey`)
  - Chuỗi kết nối Database production (`ConnectionStrings`)
  - ngrok authtoken
  - API keys, tokens của bên thứ ba

- **Khai báo mẫu bắt buộc:**
  - Frontend: `.env.example` với các biến mẫu (giá trị placeholder)
  - Backend: `appsettings.Example.json` với cấu trúc JSON mẫu (giá trị giả)

- **Kiểm tra trước commit:**
  - Rà soát `.gitignore` đảm bảo đã loại trừ: `.env`, `appsettings.Development.json`, `*.pfx`, `*.key`

### 2.3 Ranh giới Thực thi — Vùng Cấm

Các thư mục và tệp sau **KHÔNG ĐƯỢC chỉnh sửa trực tiếp** bởi Agent:

| Đường dẫn                  | Lý do                                         |
| -------------------------- | ---------------------------------------------- |
| `node_modules/`            | Tự động sinh bởi npm/yarn — quản lý qua `package.json` |
| `dist/`, `build/`          | Output của Vite build — tái tạo qua `npm run build`    |
| `bin/`, `obj/`             | Output của .NET compiler — tái tạo qua `dotnet build`  |
| `.git/`                    | Nội bộ Git — chỉ tương tác qua lệnh `git`             |
| `package-lock.json`        | Chỉ cập nhật gián tiếp qua `npm install`               |

---

## 3. Quy chuẩn Kỹ thuật Frontend — `ProxyApp/`

### 3.1 Coding Style

| Quy tắc                        | Chi tiết                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------- |
| **Component API**               | Bắt buộc sử dụng Vue 3 Composition API với cú pháp `<script setup>`                  |
| **State Management**            | Quản lý trạng thái tập trung qua **Pinia store** (`src/stores/`)                     |
| **Routing**                     | Định tuyến qua **Vue Router** (`src/router/`), bao gồm navigation guards cho auth    |
| **Composables**                 | Logic tái sử dụng đặt trong `src/composables/` theo naming `use<Feature>.js`          |
| **Naming Convention**           | Components: `PascalCase` — Files: `PascalCase.vue` — Stores: `use<Name>Store.js`     |

**Ví dụ cấu trúc component chuẩn:**

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProxyStore } from '@/stores/useProxyStore'

const proxyStore = useProxyStore()
const searchQuery = ref('')

const filteredNodes = computed(() =>
  proxyStore.nodes.filter(node =>
    node.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

onMounted(() => {
  proxyStore.fetchNodes()
})
</script>

<template>
  <!-- Template với Tailwind CSS classes -->
</template>

<style scoped>
/* Chỉ dùng khi cần override hoặc animation phức tạp */
</style>
```

### 3.2 Styling — Tailwind CSS & Biến Ngữ nghĩa

- Sử dụng **Tailwind CSS** làm framework styling chính.
- Định nghĩa biến màu ngữ nghĩa trong `src/assets/theme.css`:

```css
:root {
  --color-primary: /* ... */;
  --color-secondary: /* ... */;
  --color-danger: /* ... */;
  --color-success: /* ... */;
  --color-bg-main: /* ... */;
  --color-bg-card: /* ... */;
  --color-text-primary: /* ... */;
  --color-text-secondary: /* ... */;
}
```

- Đảm bảo **responsive hoàn toàn** trên mobile viewport (min-width: 320px).
- Ưu tiên thiết kế **Mobile-First**, mở rộng dần lên desktop.

### 3.3 Kết nối Mạng & API

**Axios Instance tập trung — `src/utils/api.js`:**

Mọi request HTTP đến backend **bắt buộc** đi qua Axios instance được cấu hình sẵn tại `src/utils/api.js`. Không được tạo Axios instance rời rạc trong component.

**Headers bắt buộc trên mọi request:**

| Header                          | Giá trị                | Mục đích                                            |
| -------------------------------- | ---------------------- | --------------------------------------------------- |
| `Authorization`                  | `Bearer <token>`       | Xác thực JWT cho các endpoint yêu cầu đăng nhập     |
| `ngrok-skip-browser-warning`     | `"true"`               | Bỏ qua trang cảnh báo HTML của ngrok tunnel         |
| `Content-Type`                   | `application/json`     | Định dạng payload chuẩn                             |

**Cấu trúc mẫu `api.js`:**

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

// Request interceptor — tự động gắn JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor — xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý token hết hạn — redirect đến trang login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

---

## 4. Quy chuẩn Kỹ thuật Backend & Database

### 4.1 Backend Architecture — `ProxyServer/`

| Nguyên tắc                   | Chi tiết                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| **Framework**                 | ASP.NET Core với Kestrel server, lắng nghe tại port `5243`                              |
| **Kiến trúc API**             | RESTful — tổ chức theo resource, sử dụng HTTP verbs đúng ngữ nghĩa                     |
| **Dependency Injection**      | Đăng ký services trong `Program.cs` qua DI container tích hợp                          |
| **Bất đồng bộ**              | Triệt để sử dụng `async/await` cho mọi I/O operation (DB queries, HTTP calls)           |
| **Error Handling**            | Middleware xử lý lỗi tập trung, trả về response chuẩn hóa (`{ message, statusCode }`)  |
| **Logging**                   | Sử dụng `ILogger<T>` tích hợp, không dùng `Console.WriteLine` trong production code    |

**Cấu trúc Controller mẫu:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class ProxyNodesController : ControllerBase
{
    private readonly IProxyNodeService _service;
    private readonly ILogger<ProxyNodesController> _logger;

    public ProxyNodesController(
        IProxyNodeService service,
        ILogger<ProxyNodesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var nodes = await _service.GetAllNodesAsync();
        return Ok(nodes);
    }
}
```

### 4.2 Xác thực & Phân quyền

| Thành phần            | Đặc tả                                                                         |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Cơ chế xác thực**   | Stateless — JSON Web Token (JWT Bearer)                                         |
| **Token lifetime**     | Access token: cấu hình qua `appsettings.json` (khuyến nghị 60–120 phút)        |
| **Password hashing**   | Bắt buộc sử dụng **BCrypt** hoặc **Argon2** — **NGHIÊM CẤM** lưu mật khẩu bản rõ |
| **Token validation**   | Kiểm tra `issuer`, `audience`, `expiration` trên mọi request authenticated      |

**Quy tắc bảo mật bổ sung:**
- Endpoint công khai (login, register) phải được đánh dấu rõ ràng `[AllowAnonymous]`.
- Mọi endpoint còn lại mặc định yêu cầu `[Authorize]`.
- Không trả về thông tin nhạy cảm (password hash, internal error stack trace) trong API response.

### 4.3 PostgreSQL Database — `database/`

**Quy tắc đặt tên:**

| Đối tượng   | Quy tắc                  | Ví dụ                                      |
| ----------- | ------------------------- | ------------------------------------------- |
| Tên bảng    | `snake_case`, số nhiều    | `proxy_nodes`, `user_sessions`              |
| Tên cột     | `snake_case`              | `created_at`, `is_active`, `node_address`   |
| Khóa chính  | `id` (kiểu `SERIAL` hoặc `UUID`) | `id SERIAL PRIMARY KEY`              |
| Khóa ngoại  | `<bảng_đơn>_id`          | `user_id`, `proxy_node_id`                  |
| Index       | `idx_<bảng>_<cột>`       | `idx_proxy_nodes_is_active`                 |

**Quy trình Migration:**

1. Mọi thay đổi cấu trúc bảng **bắt buộc** viết dưới dạng tệp SQL migration.
2. Tệp migration đặt trong `database/migrations/` với định dạng đánh số:
   ```
   database/migrations/
   ├── 001_create_users_table.sql
   ├── 002_create_proxy_nodes_table.sql
   ├── 003_add_last_health_check_to_proxy_nodes.sql
   └── ...
   ```
3. Mỗi tệp migration phải chứa cả lệnh `-- UP` (áp dụng) và `-- DOWN` (rollback):
   ```sql
   -- UP
   ALTER TABLE proxy_nodes ADD COLUMN last_health_check TIMESTAMPTZ;

   -- DOWN
   ALTER TABLE proxy_nodes DROP COLUMN last_health_check;
   ```
4. **KHÔNG BAO GIỜ** chỉnh sửa trực tiếp `schema.sql` mà không tạo migration tương ứng.

---

## 5. Phân quyền và Kích hoạt Subagents

### 5.1 Subagent Routing Protocol

Khi tác vụ yêu cầu chuyên môn sâu hoặc phạm vi rõ ràng, Agent chính phải **ủy quyền** cho Subagent phù hợp theo bảng định tuyến sau:

#### 🎨 Frontend Specialist

| Thuộc tính              | Giá trị                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Phạm vi thư mục**    | `ProxyApp/` — chỉ được đọc/ghi file trong thư mục này                                |
| **Trách nhiệm chính**  | UI/UX components, Vue SFC, Pinia stores, Vue Router config, Tailwind styling          |
| **Kích hoạt khi**       | Tác vụ liên quan đến giao diện, component mới, sửa layout, thêm trang, animation     |
| **Hạn chế**            | Không được chỉnh sửa backend code, database schema, hoặc cấu hình server             |

#### ⚙️ Backend Specialist

| Thuộc tính              | Giá trị                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Phạm vi thư mục**    | `ProxyServer/` và `database/`                                                         |
| **Trách nhiệm chính**  | Controller API, Services, Middleware, JWT auth, password hashing, PostgreSQL queries   |
| **Kích hoạt khi**       | Tác vụ liên quan đến API endpoint, business logic, proxy forwarding, SOCKS5, DB migration |
| **Hạn chế**            | Không được chỉnh sửa frontend components, Tailwind config, hoặc Vue Router            |

#### 🔧 DevOps & QA Specialist

| Thuộc tính              | Giá trị                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Phạm vi thư mục**    | Toàn bộ Monorepo (chỉ đọc) + `.gitignore`, CI/CD config, tệp môi trường             |
| **Trách nhiệm chính**  | Quản lý Git repository, kiểm soát ngrok tunnel, bảo mật biến môi trường, kịch bản test API |
| **Kích hoạt khi**       | Tác vụ liên quan đến Git workflow, deployment, environment setup, API testing, security audit |
| **Hạn chế**            | Không được chỉnh sửa business logic trong Services hoặc UI components                |

### 5.2 Quy tắc Ủy quyền

```
1. Agent chính PHẢI xác định đúng Subagent trước khi bắt đầu tác vụ.
2. Nếu tác vụ liên quan đến ≥ 2 Subagent, Agent chính phối hợp tuần tự,
   đảm bảo không có xung đột file giữa các Subagent.
3. Subagent KHÔNG ĐƯỢC vượt ra ngoài phạm vi thư mục được phân quyền.
4. Mọi output của Subagent phải được Agent chính rà soát
   trước khi xác nhận hoàn tất với người dùng.
```

---

## 6. Quy trình Kiểm thử & Xác nhận

### 6.1 Quality Verification Checklist

> **Bắt buộc:** Agent phải tự rà soát **toàn bộ** checklist dưới đây trước khi thông báo hoàn tất **bất kỳ** tác vụ nào. Không được bỏ qua bước nào.

#### Chất lượng Mã nguồn

- [ ] Code không chứa cú pháp thừa, biến không sử dụng, hoặc import dư thừa.
- [ ] Không tồn tại debug log nhạy cảm (`console.log` chứa token, password, secret key).
- [ ] Comment code rõ ràng cho logic phức tạp; không để comment vô nghĩa hoặc TODO quên xử lý.

#### Build & Compilation

- [ ] Frontend: Không phát sinh lỗi build Vite/TypeScript/JavaScript (`npm run build` thành công).
- [ ] Backend: Không phát sinh lỗi biên dịch hoặc cảnh báo C# (`dotnet build` thành công).
- [ ] Không có warning mới được tạo ra bởi thay đổi vừa thực hiện.

#### Bảo mật

- [ ] Không commit giá trị nhạy cảm (secrets, tokens, connection strings thật) vào mã nguồn.
- [ ] Mật khẩu được hash đúng chuẩn, không lưu bản rõ ở bất kỳ đâu.
- [ ] API endpoints yêu cầu xác thực đều có `[Authorize]` attribute.

#### Cấu trúc Monorepo

- [ ] Tính toàn vẹn cấu trúc thư mục Monorepo được bảo đảm (không tạo file ngoài vị trí quy định).
- [ ] Không khởi tạo `.git` trong thư mục con.
- [ ] `.gitignore` được cập nhật nếu có loại file mới cần loại trừ.

#### Tương thích & Trải nghiệm

- [ ] Giao diện hiển thị đúng trên mobile viewport (≥ 320px).
- [ ] API response trả về đúng format chuẩn hóa.
- [ ] Navigation guards hoạt động chính xác (redirect về login khi chưa xác thực).

---

## Phụ lục: Tham chiếu Nhanh

### Lệnh Thường dùng

```bash
# Frontend — ProxyApp
cd ProxyApp && npm install          # Cài đặt dependencies
cd ProxyApp && npm run dev          # Chạy dev server (Vite)
cd ProxyApp && npm run build        # Build production bundle

# Backend — ProxyServer
cd ProxyServer && dotnet restore    # Khôi phục NuGet packages
cd ProxyServer && dotnet run        # Chạy server (port 5243)
cd ProxyServer && dotnet build      # Biên dịch kiểm tra lỗi

# Git — tại thư mục gốc HCProxy/
git add .                           # Stage toàn bộ thay đổi
git commit -m "feat(scope): mô tả" # Commit theo Conventional Commits
git push origin <branch>           # Push lên remote (KHÔNG dùng --force)
```

### Biến Môi trường Mẫu (`.env.example`)

```env
# Frontend
VITE_API_BASE_URL=https://your-ngrok-url.ngrok-free.app

# Backend (appsettings.Example.json)
# ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=hcproxy_db;Username=xxx;Password=xxx
# Jwt__Secret=your-256-bit-secret-key-here
# Jwt__Issuer=HCProxy
# Jwt__Audience=HCProxyApp
# Jwt__ExpiryMinutes=120
# Ngrok__AuthToken=your-ngrok-authtoken-here
```

---

> **📌 Ghi nhớ cuối cùng:** Tệp `AGENT.md` này là nguồn sự thật duy nhất (Single Source of Truth) cho mọi quyết định kỹ thuật và quy trình vận hành của AI Agent trong dự án HCProxy. Khi có xung đột giữa hướng dẫn tạm thời và nội dung tệp này, **nội dung tệp này được ưu tiên tuyệt đối**.
