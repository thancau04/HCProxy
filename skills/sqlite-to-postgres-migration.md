---
name: "sqlite-to-postgres-migration"
description: "Chuyển đổi cơ sở dữ liệu từ SQLite (proxy.db) sang PostgreSQL cho hệ thống HCProxy"
triggers:
  - "chuyển database"
  - "migrate sqlite to postgres"
  - "tạo schema postgres"
  - "chuyển đổi cơ sở dữ liệu"
  - "migration postgresql"
  - "thay thế sqlite"
subagent: "backend-specialist"
inputs:
  - name: "sqlite_db_path"
    type: "file"
    required: true
    description: "Đường dẫn đến file SQLite cũ (mặc định: ProxyServer/proxy.db)"
  - name: "postgres_connection_string"
    type: "config"
    required: true
    description: "Chuỗi kết nối PostgreSQL đích (Host, Port, Database, Username, Password)"
  - name: "seed_admin"
    type: "config"
    required: false
    description: "Thông tin tài khoản Admin mặc định để seed (username, email, password)"
outputs:
  - "File migration: database/migrations/001_initial_schema.sql"
  - "File seed data: database/seed.sql"
  - "Schema snapshot: database/schema.sql (cập nhật)"
  - "ProxyServer cập nhật Npgsql dependency và connection string"
  - "Kết nối PostgreSQL hoạt động, dữ liệu đã được migrate"
---

# 🔄 Skill: SQLite → PostgreSQL Migration

## Tổng quan

Skill này thực hiện quy trình chuyển đổi toàn bộ cơ sở dữ liệu từ SQLite (`proxy.db`) sang PostgreSQL cho hệ thống HCProxy. Phạm vi tác động bao gồm `database/`, `ProxyServer/` (cấu hình kết nối và NuGet packages). Skill được kích hoạt khi người dùng yêu cầu chuyển đổi database, tạo schema PostgreSQL mới, hoặc thay thế SQLite bằng PostgreSQL.

---

## Điều kiện Tiên quyết

### Môi trường & Công cụ

- [ ] .NET SDK đã cài đặt — kiểm tra: `dotnet --version` (yêu cầu ≥ 8.0)
- [ ] PostgreSQL server đang chạy — kiểm tra: `pg_isready -h localhost -p 5432`
- [ ] PostgreSQL client (`psql`) khả dụng — kiểm tra: `psql --version`
- [ ] Git repository sạch, không có thay đổi chưa commit — kiểm tra: `git status`

### File & Cấu hình Phụ thuộc

- [ ] File SQLite nguồn tồn tại: `ProxyServer/proxy.db`
- [ ] File `ProxyServer/ProxyServer.csproj` tồn tại và có thể đọc
- [ ] File `ProxyServer/appsettings.json` tồn tại
- [ ] Thư mục `database/migrations/` tồn tại (tạo nếu chưa có)

### Kết nối & Quyền

- [ ] Có quyền tạo database trên PostgreSQL server
- [ ] Chuỗi kết nối PostgreSQL đã được xác nhận bởi người dùng
- [ ] Database đích đã được tạo sẵn hoặc user có quyền `CREATE DATABASE`

---

## Quy trình Thực thi

### Bước 1: Phân tích cấu trúc SQLite hiện tại

**Mục đích:** Trích xuất toàn bộ schema và dữ liệu từ file SQLite để lập bản đồ ánh xạ sang PostgreSQL.

**Thực thi:**

```bash
# Xuất schema hiện tại từ SQLite
sqlite3 ProxyServer/proxy.db ".schema" > database/sqlite_schema_export.sql

# Xuất dữ liệu dạng INSERT statements
sqlite3 ProxyServer/proxy.db ".dump" > database/sqlite_full_dump.sql

# Liệt kê tất cả bảng
sqlite3 ProxyServer/proxy.db ".tables"
```

> ⚠️ **Error Handling:**
> - Nếu `sqlite3` không tìm thấy: Cài đặt SQLite CLI tools hoặc sử dụng công cụ .NET `Microsoft.Data.Sqlite` để xuất.
> - Nếu file `proxy.db` bị lock: Đảm bảo ProxyServer không đang chạy (`dotnet` process đã tắt).
> - Nếu file `proxy.db` không tồn tại: Hỏi người dùng đường dẫn chính xác hoặc bỏ qua bước export data.

**✅ Checkpoint:** File `database/sqlite_schema_export.sql` chứa đầy đủ `CREATE TABLE` statements của tất cả bảng hiện có.

---

### Bước 2: Ánh xạ kiểu dữ liệu SQLite → PostgreSQL

**Mục đích:** Chuyển đổi các kiểu dữ liệu SQLite sang kiểu tương ứng trong PostgreSQL, đảm bảo tương thích ngữ nghĩa.

**Bảng ánh xạ kiểu dữ liệu:**

| SQLite                              | PostgreSQL                         | Ghi chú                                    |
| ------------------------------------ | ---------------------------------- | ------------------------------------------- |
| `INTEGER PRIMARY KEY AUTOINCREMENT`  | `SERIAL PRIMARY KEY`               | Hoặc `BIGSERIAL` nếu dự kiến > 2 tỷ record |
| `INTEGER`                            | `INTEGER`                          | Giữ nguyên                                  |
| `TEXT`                               | `VARCHAR(n)` hoặc `TEXT`           | Dùng `VARCHAR` khi có giới hạn độ dài rõ    |
| `REAL`                               | `DOUBLE PRECISION`                 | Hoặc `NUMERIC(p,s)` cho tính toán chính xác |
| `BLOB`                               | `BYTEA`                            |                                              |
| `BOOLEAN` (0/1 trong SQLite)         | `BOOLEAN`                          | PostgreSQL hỗ trợ `TRUE`/`FALSE` native     |
| `DATETIME` (TEXT trong SQLite)       | `TIMESTAMPTZ`                      | Luôn dùng timezone-aware                    |
| `DATE`                               | `DATE`                             | Giữ nguyên                                  |

**Quy tắc đặc biệt:**
- Mọi cột thời gian (`created_at`, `updated_at`) dùng `TIMESTAMPTZ DEFAULT NOW()`.
- Mọi cột boolean mặc định `DEFAULT FALSE`.
- Primary key tên chuẩn là `id`.
- Foreign key theo format `<bảng_số_ít>_id`.

> ⚠️ **Error Handling:**
> - Nếu gặp kiểu dữ liệu custom trong SQLite: Ghi log cảnh báo, hỏi người dùng cách ánh xạ.
> - Nếu có `CHECK` constraint phức tạp: Viết lại cho cú pháp PostgreSQL.

**✅ Checkpoint:** Tất cả kiểu dữ liệu đã được ánh xạ, không còn kiểu SQLite-specific nào trong schema PostgreSQL.

---

### Bước 3: Tạo file migration PostgreSQL

**Mục đích:** Khởi tạo file migration chuẩn chứa toàn bộ schema PostgreSQL cho HCProxy.

**Thực thi:**

Tạo file `database/migrations/001_initial_schema.sql`:

```sql
-- Migration: 001_initial_schema
-- Description: Khởi tạo schema PostgreSQL cho HCProxy (chuyển từ SQLite)
-- Date: <ngày tạo>
-- Author: AI Agent (backend-specialist)

-- ============================================================
-- UP: Tạo toàn bộ bảng cơ sở
-- ============================================================

-- Bảng người dùng hệ thống
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Bảng proxy node (các máy chủ proxy)
CREATE TABLE IF NOT EXISTS proxy_nodes (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    host            VARCHAR(255) NOT NULL,
    port            INTEGER NOT NULL,
    protocol        VARCHAR(20) NOT NULL DEFAULT 'http',
    status          VARCHAR(20) NOT NULL DEFAULT 'inactive',
    country_code    VARCHAR(5),
    city            VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    max_connections INTEGER DEFAULT 100,
    current_load    INTEGER DEFAULT 0,
    last_health_check TIMESTAMPTZ,
    uptime_percent  DOUBLE PRECISION DEFAULT 0.0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_proxy_nodes_status ON proxy_nodes(status);
CREATE INDEX idx_proxy_nodes_protocol ON proxy_nodes(protocol);
CREATE INDEX idx_proxy_nodes_is_active ON proxy_nodes(is_active);
CREATE INDEX idx_proxy_nodes_country ON proxy_nodes(country_code);

-- Bảng quy tắc điều phối lưu lượng
CREATE TABLE IF NOT EXISTS traffic_rules (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    rule_type       VARCHAR(50) NOT NULL,
    source_pattern  VARCHAR(255),
    target_node_id  INTEGER REFERENCES proxy_nodes(id) ON DELETE SET NULL,
    priority        INTEGER NOT NULL DEFAULT 0,
    is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
    config_json     TEXT,
    created_by      INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_traffic_rules_type ON traffic_rules(rule_type);
CREATE INDEX idx_traffic_rules_enabled ON traffic_rules(is_enabled);
CREATE INDEX idx_traffic_rules_priority ON traffic_rules(priority);

-- Bảng nhật ký kiểm toán
CREATE TABLE IF NOT EXISTS audit_logs (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       INTEGER,
    details         TEXT,
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================
-- DOWN: Rollback — xóa toàn bộ bảng (thứ tự ngược)
-- ============================================================

-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS traffic_rules;
-- DROP TABLE IF EXISTS proxy_nodes;
-- DROP TABLE IF EXISTS users;
```

> ⚠️ **Error Handling:**
> - Nếu thư mục `database/migrations/` chưa tồn tại: Tạo mới bằng `mkdir -p database/migrations/`.
> - Nếu đã có file `001_*.sql`: Kiểm tra nội dung, nếu khác biệt thì tạo migration số tiếp theo (`002_`).
> - Nếu có foreign key conflict: Đảm bảo thứ tự tạo bảng đúng (bảng cha trước, bảng con sau).

**✅ Checkpoint:** File `database/migrations/001_initial_schema.sql` tồn tại, cú pháp SQL hợp lệ, chạy được trên PostgreSQL mà không lỗi.

---

### Bước 4: Cập nhật NuGet dependencies và Connection String

**Mục đích:** Chuyển đổi ProxyServer từ SQLite provider sang PostgreSQL provider (Npgsql).

**Thực thi:**

**4a. Cập nhật NuGet packages:**

```bash
cd ProxyServer

# Gỡ SQLite provider (nếu có)
dotnet remove package Microsoft.EntityFrameworkCore.Sqlite

# Cài đặt PostgreSQL provider
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Npgsql

# Khôi phục dependencies
dotnet restore
```

**4b. Cập nhật `appsettings.json`:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hcproxy_db;Username=<user>;Password=<password>"
  }
}
```

> **🔒 Bảo mật:** Giá trị thật của connection string **KHÔNG ĐƯỢC commit**. Chỉ cập nhật `appsettings.Example.json` với placeholder.

**4c. Cập nhật `appsettings.Example.json`:**

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=hcproxy_db;Username=your_username;Password=your_password"
  }
}
```

**4d. Cập nhật DbContext trong `Program.cs`:**

```csharp
// Thay thế UseSqlite bằng UseNpgsql
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);
```

> ⚠️ **Error Handling:**
> - Nếu `dotnet remove package` thất bại vì package không tồn tại: Bỏ qua, tiếp tục cài Npgsql.
> - Nếu `dotnet restore` thất bại: Kiểm tra kết nối internet và NuGet source configuration.
> - Nếu `Program.cs` không có `UseSqlite`: Tìm kiếm method `AddDbContext` và thay thế provider tương ứng.

**✅ Checkpoint:** `dotnet build` thành công, không có lỗi biên dịch. File `.csproj` chứa reference đến `Npgsql.EntityFrameworkCore.PostgreSQL`.

---

### Bước 5: Tạo Database PostgreSQL và Áp dụng Migration

**Mục đích:** Khởi tạo database trên PostgreSQL server và chạy migration script.

**Thực thi:**

```bash
# Tạo database (nếu chưa tồn tại)
psql -h localhost -U postgres -c "CREATE DATABASE hcproxy_db;"

# Áp dụng migration
psql -h localhost -U postgres -d hcproxy_db -f database/migrations/001_initial_schema.sql

# Xác nhận bảng đã tạo
psql -h localhost -U postgres -d hcproxy_db -c "\dt"
```

> ⚠️ **Error Handling:**
> - Nếu database đã tồn tại: `psql` trả về lỗi `already exists` — bỏ qua và tiếp tục.
> - Nếu không có quyền tạo DB: Yêu cầu người dùng tạo thủ công hoặc cấp quyền `CREATEDB`.
> - Nếu migration script lỗi syntax: Kiểm tra lại cú pháp SQL, đặc biệt các kiểu dữ liệu và constraint.

**✅ Checkpoint:** Lệnh `\dt` hiển thị 4 bảng: `users`, `proxy_nodes`, `traffic_rules`, `audit_logs`.

---

### Bước 6: Seed tài khoản Admin mặc định

**Mục đích:** Tạo tài khoản Admin ban đầu để có thể đăng nhập hệ thống sau migration.

**Thực thi:**

Tạo/cập nhật file `database/seed.sql`:

```sql
-- Seed: Tài khoản Admin mặc định
-- Password phải được hash bằng BCrypt trước khi insert
-- Giá trị hash dưới đây là PLACEHOLDER — Agent phải sinh hash thật qua code C#

INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
    'admin',
    'admin@hcproxy.local',
    '$2a$11$PLACEHOLDER_BCRYPT_HASH_REPLACE_ME',
    'admin',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (username) DO NOTHING;
```

**Sinh BCrypt hash qua C# (script kiểm thử):**

```csharp
// Sử dụng thư viện BCrypt.Net-Next
// dotnet add package BCrypt.Net-Next

using BCrypt.Net;

string passwordHash = BCrypt.HashPassword("admin_default_password", workFactor: 11);
Console.WriteLine($"BCrypt Hash: {passwordHash}");
```

```bash
# Áp dụng seed data
psql -h localhost -U postgres -d hcproxy_db -f database/seed.sql
```

> ⚠️ **Error Handling:**
> - **NGHIÊM CẤM** insert mật khẩu dạng plaintext. Luôn hash trước.
> - Nếu user `admin` đã tồn tại: `ON CONFLICT DO NOTHING` đảm bảo không ghi đè.
> - Nhắc người dùng **đổi mật khẩu Admin ngay sau lần đăng nhập đầu tiên**.

**✅ Checkpoint:** Query `SELECT id, username, role FROM users WHERE username = 'admin';` trả về đúng 1 record với role `admin`.

---

### Bước 7: Kiểm thử kết nối End-to-End

**Mục đích:** Xác nhận ProxyServer kết nối được đến PostgreSQL và các CRUD operations hoạt động.

**Thực thi:**

```bash
# Build và chạy ProxyServer
cd ProxyServer
dotnet build
dotnet run

# Từ terminal khác — test API health check
curl -s http://localhost:5243/api/health | jq .

# Test đăng nhập với tài khoản Admin
curl -s -X POST http://localhost:5243/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin_default_password"}' | jq .
```

> ⚠️ **Error Handling:**
> - Nếu `dotnet run` báo lỗi kết nối DB: Kiểm tra PostgreSQL service đang chạy và connection string chính xác.
> - Nếu API trả về 500: Kiểm tra log output của `dotnet run` để xác định nguyên nhân.
> - Nếu login thất bại: Kiểm tra seed data đã được áp dụng và password hash đúng.

**✅ Checkpoint:** API `/api/health` trả về `200 OK`. API login trả về JWT token hợp lệ.

---

### Bước 8: Dọn dẹp và Commit

**Mục đích:** Xóa file tạm, cập nhật `.gitignore`, commit thay đổi theo Conventional Commits.

**Thực thi:**

```bash
# Xóa file export tạm (nếu có)
rm -f database/sqlite_schema_export.sql
rm -f database/sqlite_full_dump.sql

# Đảm bảo .gitignore loại trừ file SQLite
echo "*.db" >> .gitignore
echo "*.db-shm" >> .gitignore
echo "*.db-wal" >> .gitignore

# Commit
git add database/ ProxyServer/ProxyServer.csproj ProxyServer/appsettings.Example.json .gitignore
git commit -m "feat(database): migrate từ SQLite sang PostgreSQL

- Tạo migration 001_initial_schema.sql (users, proxy_nodes, traffic_rules, audit_logs)
- Chuyển đổi Npgsql provider thay thế SQLite
- Cập nhật connection string template
- Thêm seed data tài khoản Admin
- Cập nhật .gitignore loại trừ file .db"
```

> ⚠️ **Error Handling:**
> - **KHÔNG commit** `appsettings.json` nếu chứa connection string thật — chỉ commit `appsettings.Example.json`.
> - **KHÔNG commit** file `proxy.db` gốc (đã được `.gitignore` loại trừ).

**✅ Checkpoint:** `git status` sạch, `git log -1` hiển thị commit message đúng format Conventional Commits.

---

## Nghiệm thu

### Tính đúng đắn (Correctness)

- [ ] Database PostgreSQL `hcproxy_db` tồn tại và chứa 4 bảng: `users`, `proxy_nodes`, `traffic_rules`, `audit_logs`.
- [ ] Tất cả kiểu dữ liệu đã được ánh xạ chính xác từ SQLite sang PostgreSQL.
- [ ] Tài khoản Admin đã được seed với password hash (BCrypt), không lưu plaintext.
- [ ] Migration file có đầy đủ phần `-- UP` và `-- DOWN`.

### Tính toàn vẹn (Integrity)

- [ ] Không có file nào bị xóa/ghi đè ngoài phạm vi skill.
- [ ] Cấu trúc thư mục Monorepo không bị phá vỡ.
- [ ] File SQLite gốc (`proxy.db`) được giữ nguyên làm backup.

### Tính tương thích (Compatibility)

- [ ] Build backend thành công: `cd ProxyServer && dotnet build` — không lỗi, không warning mới.
- [ ] ProxyServer khởi động và kết nối PostgreSQL thành công.
- [ ] API endpoints hiện có hoạt động bình thường với PostgreSQL.

### Bảo mật (Security)

- [ ] Connection string thật không bị commit vào Git.
- [ ] `appsettings.Example.json` chỉ chứa placeholder values.
- [ ] `.gitignore` đã loại trừ `*.db`, `appsettings.Development.json`.
