---
name: "integrate-api-endpoint"
description: "Quy trình chuẩn hóa tích hợp API endpoint mới giữa ASP.NET Core Backend và Vue 3 Frontend"
triggers:
  - "kết nối API"
  - "thêm endpoint"
  - "tích hợp API"
  - "tạo API mới"
  - "connect frontend to backend"
  - "thêm chức năng CRUD"
subagent: "multi-agent"
inputs:
  - name: "resource_name"
    type: "string"
    required: true
    description: "Tên resource/entity cần tạo API (ví dụ: ProxyNode, TrafficRule, User)"
  - name: "http_methods"
    type: "string"
    required: true
    description: "Các HTTP method cần implement (GET, POST, PUT, DELETE)"
  - name: "requires_auth"
    type: "config"
    required: false
    description: "Endpoint có yêu cầu xác thực JWT hay không (mặc định: true)"
  - name: "dto_fields"
    type: "config"
    required: true
    description: "Danh sách các field của DTO request/response"
outputs:
  - "Backend: Controller, Service, DTO models trong ProxyServer/"
  - "Frontend: API function trong ProxyApp/src/utils/api.js"
  - "Frontend: Pinia store trong ProxyApp/src/stores/"
  - "Frontend: Page/Component hiển thị dữ liệu trong ProxyApp/src/pages/"
  - "Swagger UI endpoint hoạt động tại /swagger"
---

# 🔌 Skill: Tích hợp API Endpoint Mới (Backend ↔ Frontend)

## Tổng quan

Skill này chuẩn hóa quy trình tạo một API endpoint hoàn chỉnh từ Backend (ASP.NET Core) đến Frontend (Vue 3), đảm bảo tính nhất quán giữa hai tầng. Phạm vi tác động bao gồm `ProxyServer/` (Controller, Service, Model) và `ProxyApp/` (API client, Pinia store, UI component). Skill yêu cầu phối hợp giữa `backend-specialist` và `frontend-specialist`, do Agent chính điều phối.

**Luồng tích hợp:**

```
┌──────────────────────────────────────────────────────────────────────┐
│                         LUỒNG TÍCH HỢP API                          │
│                                                                      │
│  ① Model/DTO ──→ ② Controller ──→ ③ Service ──→ ④ Swagger Test     │
│       (Backend Specialist)                                           │
│                           │                                          │
│                           ▼                                          │
│  ⑤ API Client ──→ ⑥ Pinia Store ──→ ⑦ Vue Page/Component           │
│       (Frontend Specialist)                                          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Điều kiện Tiên quyết

### Môi trường & Công cụ

- [ ] .NET SDK đã cài đặt — kiểm tra: `dotnet --version` (yêu cầu ≥ 8.0)
- [ ] Node.js đã cài đặt — kiểm tra: `node --version` (yêu cầu ≥ 18)
- [ ] ProxyServer build thành công — kiểm tra: `cd ProxyServer && dotnet build`
- [ ] ProxyApp dependencies đã cài — kiểm tra: `cd ProxyApp && npm ls --depth=0`

### File & Cấu hình Phụ thuộc

- [ ] File `ProxyServer/Program.cs` — đã cấu hình DI container và Swagger
- [ ] File `ProxyApp/src/utils/api.js` — Axios instance tập trung đã tồn tại
- [ ] File `ProxyApp/src/router/index.js` — Vue Router đã cấu hình
- [ ] Database PostgreSQL đang chạy và có bảng tương ứng với resource

### Kết nối

- [ ] Backend API khả dụng tại `http://localhost:5243`
- [ ] Frontend dev server chạy được: `cd ProxyApp && npm run dev`

---

## Quy trình Thực thi

> **⚙️ Phần A — Backend Specialist** (Phạm vi: `ProxyServer/`)

---

### Bước 1: Định nghĩa Model & DTO

**Mục đích:** Tạo Entity Model (ánh xạ database) và DTO (Data Transfer Object) để kiểm soát dữ liệu vào/ra API.

**Thực thi:**

Tạo Entity Model tại `ProxyServer/Models/<Resource>.cs`:

```csharp
namespace ProxyServer.Models
{
    public class ProxyNode
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Protocol { get; set; } = "http";
        public string Status { get; set; } = "inactive";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

Tạo DTO tại `ProxyServer/Models/DTOs/<Resource>Dto.cs`:

```csharp
namespace ProxyServer.Models.DTOs
{
    // DTO cho response — không bao gồm trường nhạy cảm
    public class ProxyNodeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Protocol { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO cho create request
    public class CreateProxyNodeDto
    {
        public string Name { get; set; } = string.Empty;
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; }
        public string Protocol { get; set; } = "http";
    }

    // DTO cho update request
    public class UpdateProxyNodeDto
    {
        public string? Name { get; set; }
        public string? Host { get; set; }
        public int? Port { get; set; }
        public string? Protocol { get; set; }
        public bool? IsActive { get; set; }
    }
}
```

**Quy tắc DTO:**

| Quy tắc                                      | Lý do                                              |
| ---------------------------------------------- | --------------------------------------------------- |
| Không bao gồm `password_hash` trong response   | Bảo mật — không lộ thông tin nhạy cảm              |
| Create DTO chỉ chứa field cần thiết            | Ngăn client gửi giá trị cho `Id`, `CreatedAt`      |
| Update DTO dùng nullable properties            | Cho phép partial update (chỉ cập nhật field gửi lên)|

> ⚠️ **Error Handling:**
> - Nếu thư mục `Models/DTOs/` chưa tồn tại: Tạo mới.
> - Nếu Entity Model đã tồn tại: Kiểm tra và mở rộng, không ghi đè.

**✅ Checkpoint:** `dotnet build` thành công, không có lỗi biên dịch cho các model mới.

---

### Bước 2: Tạo Service Layer

**Mục đích:** Tách business logic khỏi Controller, đảm bảo nguyên tắc Single Responsibility.

**Thực thi:**

Tạo interface tại `ProxyServer/Services/I<Resource>Service.cs`:

```csharp
using ProxyServer.Models.DTOs;

namespace ProxyServer.Services
{
    public interface IProxyNodeService
    {
        Task<IEnumerable<ProxyNodeDto>> GetAllAsync();
        Task<ProxyNodeDto?> GetByIdAsync(int id);
        Task<ProxyNodeDto> CreateAsync(CreateProxyNodeDto dto);
        Task<ProxyNodeDto?> UpdateAsync(int id, UpdateProxyNodeDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
```

Tạo implementation tại `ProxyServer/Services/<Resource>Service.cs`:

```csharp
using Npgsql;
using ProxyServer.Models.DTOs;

namespace ProxyServer.Services
{
    public class ProxyNodeService : IProxyNodeService
    {
        private readonly string _connectionString;
        private readonly ILogger<ProxyNodeService> _logger;

        public ProxyNodeService(
            IConfiguration config,
            ILogger<ProxyNodeService> logger)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Connection string not configured");
            _logger = logger;
        }

        public async Task<IEnumerable<ProxyNodeDto>> GetAllAsync()
        {
            var nodes = new List<ProxyNodeDto>();

            await using var conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(
                "SELECT id, name, host, port, protocol, status, is_active, created_at FROM proxy_nodes ORDER BY created_at DESC",
                conn);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                nodes.Add(new ProxyNodeDto
                {
                    Id = reader.GetInt32(0),
                    Name = reader.GetString(1),
                    Host = reader.GetString(2),
                    Port = reader.GetInt32(3),
                    Protocol = reader.GetString(4),
                    Status = reader.GetString(5),
                    IsActive = reader.GetBoolean(6),
                    CreatedAt = reader.GetDateTime(7)
                });
            }

            return nodes;
        }

        // ... các method khác tương tự với async/await pattern
    }
}
```

Đăng ký Service trong `Program.cs`:

```csharp
// Đăng ký DI — thêm dòng này vào phần service registration
builder.Services.AddScoped<IProxyNodeService, ProxyNodeService>();
```

> ⚠️ **Error Handling:**
> - Nếu query SQL lỗi: Sử dụng `try-catch` với `NpgsqlException`, log chi tiết qua `_logger.LogError()`.
> - Nếu connection string null: Throw `InvalidOperationException` rõ ràng khi khởi tạo.
> - Nếu `Program.cs` đã có DI registration tương tự: Kiểm tra trùng lặp, không đăng ký lại.

**✅ Checkpoint:** `dotnet build` thành công. Service đã được đăng ký trong DI container.

---

### Bước 3: Tạo API Controller

**Mục đích:** Tạo RESTful Controller expose các endpoint cho resource.

**Thực thi:**

Tạo file `ProxyServer/Controllers/<Resource>Controller.cs`:

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProxyServer.Models.DTOs;
using ProxyServer.Services;

namespace ProxyServer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
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

        /// <summary>
        /// Lấy danh sách tất cả proxy nodes
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var nodes = await _service.GetAllAsync();
            return Ok(new { data = nodes, count = nodes.Count() });
        }

        /// <summary>
        /// Lấy chi tiết một proxy node theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var node = await _service.GetByIdAsync(id);
            if (node == null)
                return NotFound(new { message = $"Proxy node với ID {id} không tồn tại" });

            return Ok(new { data = node });
        }

        /// <summary>
        /// Tạo proxy node mới
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProxyNodeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Dữ liệu không hợp lệ", errors = ModelState });

            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetById),
                new { id = created.Id },
                new { data = created, message = "Tạo proxy node thành công" }
            );
        }

        /// <summary>
        /// Cập nhật proxy node theo ID
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProxyNodeDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (updated == null)
                return NotFound(new { message = $"Proxy node với ID {id} không tồn tại" });

            return Ok(new { data = updated, message = "Cập nhật thành công" });
        }

        /// <summary>
        /// Xóa proxy node theo ID
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound(new { message = $"Proxy node với ID {id} không tồn tại" });

            return Ok(new { message = "Xóa proxy node thành công" });
        }
    }
}
```

**Chuẩn API Response:**

| HTTP Status | Ngữ cảnh                    | Response body                                  |
| ----------- | ---------------------------- | ----------------------------------------------- |
| `200 OK`    | GET, PUT, DELETE thành công  | `{ data: ..., message: "..." }`                 |
| `201 Created` | POST thành công            | `{ data: ..., message: "..." }` + Location header |
| `400 Bad Request` | Validation thất bại    | `{ message: "...", errors: {...} }`             |
| `401 Unauthorized` | Token thiếu/hết hạn   | `{ message: "Chưa xác thực" }`                 |
| `404 Not Found` | Resource không tồn tại   | `{ message: "... không tồn tại" }`              |
| `500 Internal` | Lỗi server                | `{ message: "Lỗi hệ thống" }` (middleware xử lý) |

> ⚠️ **Error Handling:**
> - Không trả về stack trace trong production response.
> - Log đầy đủ error details qua `_logger.LogError()` nhưng chỉ trả về message chung cho client.
> - Endpoint công khai (nếu có) phải gắn `[AllowAnonymous]` trên method cụ thể.

**✅ Checkpoint:** `dotnet build` thành công. Controller đã tự động được Swagger phát hiện.

---

### Bước 4: Kiểm thử trên Swagger UI

**Mục đích:** Xác nhận API endpoint hoạt động đúng trước khi tích hợp Frontend.

**Thực thi:**

```bash
# Chạy ProxyServer
cd ProxyServer && dotnet run

# Mở Swagger UI trong trình duyệt
# URL: http://localhost:5243/swagger
```

**Checklist kiểm thử Swagger:**

- [ ] Endpoint `GET /api/proxynodes` trả về `200` với danh sách (hoặc mảng rỗng).
- [ ] Endpoint `POST /api/proxynodes` với body hợp lệ trả về `201`.
- [ ] Endpoint `GET /api/proxynodes/{id}` với ID tồn tại trả về `200`.
- [ ] Endpoint `GET /api/proxynodes/{id}` với ID không tồn tại trả về `404`.
- [ ] Endpoint `PUT /api/proxynodes/{id}` cập nhật thành công trả về `200`.
- [ ] Endpoint `DELETE /api/proxynodes/{id}` xóa thành công trả về `200`.
- [ ] Tất cả endpoint có `[Authorize]` trả về `401` khi không có Bearer token.

> ⚠️ **Error Handling:**
> - Nếu Swagger không hiển thị endpoint mới: Kiểm tra `[ApiController]` attribute và route configuration.
> - Nếu trả về 500: Kiểm tra console log của `dotnet run` để xác định lỗi.

**✅ Checkpoint:** Tất cả 6 test case trên Swagger đều pass. API sẵn sàng cho Frontend tích hợp.

---

> **🎨 Phần B — Frontend Specialist** (Phạm vi: `ProxyApp/`)

---

### Bước 5: Cập nhật API Client

**Mục đích:** Thêm các hàm gọi API cho resource mới vào Axios instance tập trung.

**Thực thi:**

Tạo file `ProxyApp/src/utils/proxyNodeApi.js` (hoặc thêm vào `api.js`):

```javascript
import api from './api'

/**
 * API functions cho ProxyNode resource
 * Tất cả request đều tự động gắn Bearer token và ngrok-skip-browser-warning
 * thông qua interceptor đã cấu hình trong api.js
 */
export const proxyNodeApi = {
  /**
   * Lấy danh sách tất cả proxy nodes
   * @returns {Promise<{data: Array, count: number}>}
   */
  getAll() {
    return api.get('/api/proxynodes')
  },

  /**
   * Lấy chi tiết proxy node theo ID
   * @param {number} id
   * @returns {Promise<{data: Object}>}
   */
  getById(id) {
    return api.get(`/api/proxynodes/${id}`)
  },

  /**
   * Tạo proxy node mới
   * @param {Object} payload - { name, host, port, protocol }
   * @returns {Promise<{data: Object, message: string}>}
   */
  create(payload) {
    return api.post('/api/proxynodes', payload)
  },

  /**
   * Cập nhật proxy node
   * @param {number} id
   * @param {Object} payload - Các field cần cập nhật
   * @returns {Promise<{data: Object, message: string}>}
   */
  update(id, payload) {
    return api.put(`/api/proxynodes/${id}`, payload)
  },

  /**
   * Xóa proxy node
   * @param {number} id
   * @returns {Promise<{message: string}>}
   */
  delete(id) {
    return api.delete(`/api/proxynodes/${id}`)
  },
}
```

**Quy tắc:**

| Quy tắc                                         | Lý do                                             |
| ------------------------------------------------- | -------------------------------------------------- |
| Luôn dùng `api` instance từ `./api.js`            | Đảm bảo Bearer token và headers được gắn tự động  |
| Không hardcode URL — dùng relative path            | Base URL đã cấu hình qua `VITE_API_BASE_URL`      |
| Mỗi resource tạo file API riêng hoặc nhóm rõ ràng | Dễ maintain, tránh file `api.js` quá lớn           |

> ⚠️ **Error Handling:**
> - Nếu `api.js` chưa tồn tại: Tạo mới theo mẫu trong `AGENT.md` mục 3.3.
> - Nếu `VITE_API_BASE_URL` chưa khai báo: Nhắc người dùng tạo file `.env` với giá trị phù hợp.

**✅ Checkpoint:** Import `proxyNodeApi` không lỗi. Các hàm API đã export đầy đủ 5 methods CRUD.

---

### Bước 6: Tạo Pinia Store

**Mục đích:** Quản lý trạng thái tập trung cho resource, xử lý `loading`, `error`, và cache dữ liệu.

**Thực thi:**

Tạo file `ProxyApp/src/stores/useProxyNodeStore.js`:

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { proxyNodeApi } from '@/utils/proxyNodeApi'

export const useProxyNodeStore = defineStore('proxyNode', () => {
  // === State ===
  const nodes = ref([])
  const currentNode = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // === Getters ===
  const activeNodes = computed(() =>
    nodes.value.filter(node => node.isActive)
  )

  const nodeCount = computed(() => nodes.value.length)

  // === Actions ===

  /**
   * Lấy danh sách proxy nodes
   */
  async function fetchNodes() {
    isLoading.value = true
    error.value = null
    try {
      const response = await proxyNodeApi.getAll()
      nodes.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tải danh sách proxy'
      console.error('[ProxyNodeStore] fetchNodes failed:', err.message)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy chi tiết proxy node
   */
  async function fetchNodeById(id) {
    isLoading.value = true
    error.value = null
    try {
      const response = await proxyNodeApi.getById(id)
      currentNode.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tải thông tin proxy'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo proxy node mới
   */
  async function createNode(payload) {
    isLoading.value = true
    error.value = null
    try {
      const response = await proxyNodeApi.create(payload)
      nodes.value.unshift(response.data.data)
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể tạo proxy node'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cập nhật proxy node
   */
  async function updateNode(id, payload) {
    isLoading.value = true
    error.value = null
    try {
      const response = await proxyNodeApi.update(id, payload)
      const index = nodes.value.findIndex(n => n.id === id)
      if (index !== -1) {
        nodes.value[index] = response.data.data
      }
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể cập nhật proxy node'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa proxy node
   */
  async function deleteNode(id) {
    isLoading.value = true
    error.value = null
    try {
      await proxyNodeApi.delete(id)
      nodes.value = nodes.value.filter(n => n.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Không thể xóa proxy node'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xóa thông báo lỗi
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    nodes,
    currentNode,
    isLoading,
    error,
    // Getters
    activeNodes,
    nodeCount,
    // Actions
    fetchNodes,
    fetchNodeById,
    createNode,
    updateNode,
    deleteNode,
    clearError,
  }
})
```

**Pattern bắt buộc cho Pinia Store:**

| Pattern                            | Giải thích                                                      |
| ----------------------------------- | --------------------------------------------------------------- |
| Composition API syntax              | Dùng `defineStore` với setup function, không dùng Options API    |
| `isLoading` reactive                | Quản lý trạng thái loading cho UI spinner/skeleton               |
| `error` reactive                    | Lưu thông báo lỗi để hiển thị cho người dùng                    |
| `try-catch-finally`                 | Luôn reset `isLoading` trong `finally`, bất kể success/error    |
| Optimistic update cho `deleteNode`  | Xóa khỏi state ngay sau khi API thành công                      |

> ⚠️ **Error Handling:**
> - Không dùng `console.log` với giá trị token/secret trong store.
> - `error.value` chỉ chứa message thân thiện người dùng, không chứa stack trace.
> - Nếu API trả về 401: Interceptor trong `api.js` tự động redirect, store không cần xử lý.

**✅ Checkpoint:** Store import thành công trong Vue component. Không có lỗi TypeScript/ESLint.

---

### Bước 7: Tạo Vue Page/Component

**Mục đích:** Xây dựng giao diện người dùng hiển thị dữ liệu từ Pinia store, xử lý các trạng thái `loading`, `error`, và `empty`.

**Thực thi:**

Tạo file `ProxyApp/src/pages/ProxyNodesPage.vue`:

```vue
<script setup>
import { onMounted } from 'vue'
import { useProxyNodeStore } from '@/stores/useProxyNodeStore'

const store = useProxyNodeStore()

onMounted(() => {
  store.fetchNodes()
})

async function handleDelete(id) {
  if (!confirm('Bạn có chắc muốn xóa proxy node này?')) return
  try {
    await store.deleteNode(id)
  } catch {
    // Error đã được xử lý trong store
  }
}
</script>

<template>
  <div class="proxy-nodes-page">
    <header class="page-header">
      <h1>Quản lý Proxy Nodes</h1>
      <button class="btn-primary" @click="$router.push('/proxy-nodes/create')">
        + Thêm Node
      </button>
    </header>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="loading-container">
      <div class="spinner" />
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="store.error" class="error-container">
      <p class="error-message">{{ store.error }}</p>
      <button class="btn-secondary" @click="store.fetchNodes()">
        Thử lại
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="store.nodes.length === 0" class="empty-container">
      <p>Chưa có proxy node nào. Hãy thêm node đầu tiên.</p>
    </div>

    <!-- Data List -->
    <div v-else class="node-list">
      <div
        v-for="node in store.nodes"
        :key="node.id"
        class="node-card"
      >
        <div class="node-info">
          <h3>{{ node.name }}</h3>
          <p class="node-address">{{ node.host }}:{{ node.port }}</p>
          <span
            class="status-badge"
            :class="node.isActive ? 'status-active' : 'status-inactive'"
          >
            {{ node.isActive ? 'Hoạt động' : 'Ngừng' }}
          </span>
        </div>
        <div class="node-actions">
          <button class="btn-edit" @click="$router.push(`/proxy-nodes/${node.id}/edit`)">
            Sửa
          </button>
          <button class="btn-delete" @click="handleDelete(node.id)">
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styling theo Tailwind CSS classes hoặc custom CSS sử dụng biến từ theme.css */
</style>
```

**Đăng ký Route trong `src/router/index.js`:**

```javascript
{
  path: '/proxy-nodes',
  name: 'ProxyNodes',
  component: () => import('@/pages/ProxyNodesPage.vue'),
  meta: { requiresAuth: true }
}
```

**Pattern UI bắt buộc:**

| Trạng thái   | UI hiển thị                                     | Điều kiện                     |
| ------------- | ------------------------------------------------ | ----------------------------- |
| `loading`     | Spinner + text "Đang tải..."                    | `store.isLoading === true`    |
| `error`       | Thông báo lỗi + nút "Thử lại"                  | `store.error !== null`        |
| `empty`       | Thông báo trống + gợi ý hành động               | `data.length === 0`           |
| `data`        | Danh sách/bảng/card hiển thị dữ liệu            | `data.length > 0`             |

> ⚠️ **Error Handling:**
> - Luôn hiển thị cả 4 trạng thái UI (loading, error, empty, data) — không bỏ sót.
> - Nút "Thử lại" gọi lại action fetch từ store.
> - Confirm dialog trước khi delete để tránh xóa nhầm.

**✅ Checkpoint:** Page render đúng khi có dữ liệu. Hiển thị loading spinner khi đang fetch. Hiển thị error message khi API lỗi.

---

### Bước 8: Kiểm thử End-to-End & Commit

**Mục đích:** Xác nhận toàn bộ luồng Backend → Frontend hoạt động, sau đó commit theo Conventional Commits.

**Thực thi:**

```bash
# Terminal 1 — Chạy Backend
cd ProxyServer && dotnet run

# Terminal 2 — Chạy Frontend
cd ProxyApp && npm run dev

# Mở trình duyệt: http://localhost:5173 (hoặc port Vite hiển thị)
# Đăng nhập → Truy cập trang Proxy Nodes → Kiểm tra CRUD
```

**Checklist E2E:**

- [ ] Trang Proxy Nodes load thành công, hiển thị danh sách (hoặc empty state).
- [ ] Tạo mới proxy node — form submit thành công, item xuất hiện trong danh sách.
- [ ] Chỉnh sửa proxy node — dữ liệu cập nhật đúng.
- [ ] Xóa proxy node — item biến mất khỏi danh sách.
- [ ] Khi token hết hạn, tự động redirect về trang login.
- [ ] Console không có lỗi JavaScript hoặc network error không xử lý.

**Commit:**

```bash
# Commit Backend
git add ProxyServer/
git commit -m "feat(proxy-server): thêm CRUD API cho ProxyNode

- Model, DTO, Service, Controller hoàn chỉnh
- Endpoint: GET/POST/PUT/DELETE /api/proxynodes
- Tất cả endpoint yêu cầu JWT authentication"

# Commit Frontend
git add ProxyApp/
git commit -m "feat(proxy-app): tích hợp trang quản lý Proxy Nodes

- API client: proxyNodeApi.js
- Pinia store: useProxyNodeStore
- Page: ProxyNodesPage.vue với 4 trạng thái UI
- Route đã đăng ký với requiresAuth guard"
```

> ⚠️ **Error Handling:**
> - Nếu CORS error: Kiểm tra `Program.cs` đã cấu hình `AddCors()` cho phép origin frontend.
> - Nếu `npm run dev` lỗi: Chạy `npm install` trước.
> - Nếu `dotnet run` lỗi kết nối DB: Kiểm tra PostgreSQL service và connection string.

**✅ Checkpoint:** Cả Backend và Frontend build thành công. Toàn bộ luồng CRUD hoạt động end-to-end. Git log hiển thị 2 commit mới đúng format.

---

## Nghiệm thu

### Tính đúng đắn (Correctness)

- [ ] API endpoint trả về đúng format response (`{ data, message }`).
- [ ] Swagger UI hiển thị đầy đủ 5 endpoints (GET list, GET detail, POST, PUT, DELETE).
- [ ] Pinia store quản lý đúng 4 trạng thái: `nodes`, `currentNode`, `isLoading`, `error`.
- [ ] Vue page hiển thị đúng 4 UI state: loading, error, empty, data.

### Tính toàn vẹn (Integrity)

- [ ] Không có file nào bị xóa/ghi đè ngoài phạm vi skill.
- [ ] Backend Specialist chỉ chỉnh sửa `ProxyServer/`.
- [ ] Frontend Specialist chỉ chỉnh sửa `ProxyApp/`.
- [ ] Cấu trúc thư mục Monorepo không bị phá vỡ.

### Tính tương thích (Compatibility)

- [ ] Build frontend thành công: `cd ProxyApp && npm run build` — không lỗi.
- [ ] Build backend thành công: `cd ProxyServer && dotnet build` — không lỗi, không warning mới.
- [ ] Các API endpoint cũ không bị ảnh hưởng.

### Bảo mật (Security)

- [ ] Tất cả endpoint CRUD có `[Authorize]` attribute.
- [ ] DTO response không chứa password hash hoặc thông tin nhạy cảm.
- [ ] Bearer token được gắn tự động qua interceptor, không hardcode trong component.
- [ ] Không commit secret/token vào Git.
