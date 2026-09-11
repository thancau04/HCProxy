---
name: proxy-feature-spec
description: "Khung đặc tả kỹ thuật tính năng (Feature Specifications) cho ứng dụng và hạ tầng quản lý máy chủ proxy (HCProxy). Bao gồm cấu trúc Spec chi tiết: Architecture Components (ProxyServer, database, ProxyApp, deploy), Data Models & Schema, API Contracts (REST/WebSocket), Network Protocol & Routing Specs (HTTP/HTTPS, SOCKS5), Health-Check Probing và Security Guardrails. Kích hoạt khi cần lập tài liệu kỹ thuật chi tiết cho tính năng trước khi code."
---

# Feature Specification (Feature Spec) Cho Hệ Thống Máy Chủ Proxy HCProxy

## 1. Mục Đích & Tiêu Chuẩn Áp Dụng
Tài liệu **Feature Specification** (Đặc tả tính năng kỹ thuật) là cầu nối chi tiết giữa PRD và mã nguồn (Codebase). Tài liệu này mô tả chính xác:
- Mô hình dữ liệu (Database schema)
- Hợp đồng giao tiếp (API Contracts, WebSocket events)
- Cơ chế xử lý mạng (Network packet forwarding, protocol handling)
- Giao diện và trạng thái người dùng (UI States trên Mobile App)

Mọi Feature Spec phải lưu tại: `docs/architecture/SPEC-[Tên-Tính-Năng].md`.

---

## 2. Khung Cấu Trúc Chuẩn Của Feature Spec

```markdown
# Feature Spec: [Mã Tính Năng] - [Tên Tính Năng]

**PRD Tham Chiếu**: [Link tới PRD tương ứng trong docs/PRD/]
**Trạng Thái**: [Draft | In Review | Approved | Implemented]
**Tác Giả**: [Lead Architect / Backend Engineer / PM]

---

## 1. Tổng Quan & Phạm Vi (Overview & Scope)
- **Tóm tắt kỹ thuật**: Mô tả cơ chế hoạt động ở mức hệ thống.
- **In-Scope**: Những thành phần, luồng xử lý được hiện thực hóa trong tài liệu này.
- **Out-of-Scope**: Những tính năng hoãn lại cho các giai đoạn sau.

---

## 2. Phân Tích Tác Động Hệ Thống (System Impact Matrix)

| Thành phần | Đường dẫn thư mục | Mức độ tác động | Mô tả thay đổi |
| :--- | :--- | :--- | :--- |
| **ProxyServer** | `ProxyServer/src/` | Major / Minor / None | Xử lý socket, forward gói tin, routing logic |
| **Database** | `database/migrations/` | Major / Minor / None | Bảng mới, cột mới, index, trigger |
| **ProxyApp** | `ProxyApp/src/` | Major / Minor / None | Màn hình mới, state management, VPN service |
| **Deployment** | `deploy/` | Major / Minor / None | Dockerfile, docker-compose, env vars, iptables |

---

## 3. Mô Hình Dữ Liệu (Data Model & Schema Migrations)
Liệt kê DDL SQL cụ thể, ràng buộc (Constraints) và chỉ mục (Indexes) phục vụ hiệu năng cao:

```sql
-- Ví dụ: Bảng quản lý node proxy
CREATE TABLE IF NOT EXISTS proxy_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_name VARCHAR(100) NOT NULL,
    host_ip INET NOT NULL,
    port INTEGER NOT NULL CHECK (port BETWEEN 1 AND 65535),
    protocol VARCHAR(20) NOT NULL DEFAULT 'SOCKS5', -- 'HTTP', 'HTTPS', 'SOCKS5'
    region VARCHAR(50) NOT NULL,
    country_code CHAR(2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_concurrency INTEGER DEFAULT 1000,
    current_latency_ms INTEGER DEFAULT 0,
    last_health_check TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proxy_nodes_region_active ON proxy_nodes (region, is_active);
CREATE INDEX idx_proxy_nodes_latency ON proxy_nodes (current_latency_ms) WHERE is_active = TRUE;
```

---

## 4. Hợp Đồng Giao Tiếp API (API Contracts)

### 4.1 RESTful Endpoints
- **Method & Path**: `POST /api/v1/proxy/nodes/rotate`
- **Mô tả**: Yêu cầu cấp phát hoặc xoay IP mới cho người dùng.
- **Headers**:
  - `Authorization: Bearer <user_token>`
  - `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "preferred_region": "US-East",
    "protocol": "SOCKS5",
    "exclude_current_node": true
  }
  ```
- **Response Success (`200 OK`)**:
  ```json
  {
    "status": "success",
    "data": {
      "node_id": "c1f7b8a0-...",
      "endpoint": "proxy-us-east.hcproxy.net",
      "port": 10808,
      "protocol": "SOCKS5",
      "assigned_ip": "198.51.100.15",
      "latency_ms": 38,
      "expires_at": "2026-09-12T00:00:00Z"
    }
  }
  ```
- **Response Errors**:
  - `401 Unauthorized`: Token không hợp lệ hoặc đã bị thu hồi.
  - `429 Too Many Requests`: Vượt quá hạn mức yêu cầu xoay IP (e.g. tối đa 1 lần/phút).
  - `503 Service Unavailable`: Toàn bộ node trong vùng yêu cầu đều quá tải.

### 4.2 WebSocket Realtime Events
- **Channel**: `wss://api.hcproxy.net/ws/v1/client-metrics`
- **Payload Event**:
  ```json
  {
    "event": "METRICS_UPDATE",
    "timestamp": 1789178400,
    "payload": {
      "bytes_in": 1048576,
      "bytes_out": 524288,
      "active_streams": 12,
      "current_node_latency_ms": 42
    }
  }
  ```

---

## 5. Đặc Tả Giao Thức Mạng & Routing (Networking & Protocol Specs)

### 5.1 Hỗ Trợ Giao Thức
1. **HTTP/HTTPS (CONNECT Tunneling)**:
   - Client gửi `CONNECT destination:443 HTTP/1.1`.
   - ProxyServer thiết lập kết nối TCP tới destination, trả về `HTTP/1.1 200 Connection Established`.
   - Chuyển tiếp stream nhị phân 2 chiều không can thiệp nội dung payload TLS.
2. **SOCKS5 (RFC 1928)**:
   - Hỗ trợ phương thức xác thực `0x00` (No Authentication) và `0x02` (Username/Password RFC 1929).
   - Hỗ trợ lệnh `0x01` (CONNECT) và `0x03` (UDP ASSOCIATE).
   - Phân giải DNS tại máy chủ proxy (tránh DNS Leak tại client).

### 5.2 Thuật Toán Định Tuyến (Routing & Load Balancing)
- **Least Latency Routing**: Định tuyến yêu cầu tới node có chỉ số `current_latency_ms` thấp nhất trong pool đang active.
- **Round-Robin with Weights**: Điều phối theo tỷ lệ tài nguyên CPU/RAM của từng node.
- **Session Stickiness**: Giữ nguyên IP egress trong 1 khoảng thời gian cấu hình được (`sticky_session_minutes`).

---

## 6. Cơ Chế Kiểm Tra Sức Khỏe (Health Probing & Auto-Failover)
- **Chu kỳ kiểm tra (Probing Interval)**: 5000ms.
- **Tiêu chuẩn Unhealthy**: Node không phản hồi 3 lần liên tiếp hoặc latency vượt quá 2000ms.
- **Hành động**: Đánh dấu `is_active = FALSE`, tự động loại khỏi danh sách DNS/Gateway routing, kích hoạt chuyển vùng cho các active connections đang mở.

---

## 7. Bảo Mật & An Ninh Mạng (Security Guardrails)
- **Nguyên tắc No-Payload-Logging**: Không bao giờ ghi log nội dung dữ liệu (packet payload) của người dùng; chỉ ghi metadata (timestamp, source_ip, egress_ip, bytes_transferred, status_code).
- **DNS Leak Prevention**: Toàn bộ yêu cầu DNS phải được ép đi qua đường hầm proxy, ngăn chặn rò rỉ DNS qua ISP của thiết bị di động.
- **DDoS & Abuse Protection**: Tự động chặn các cổng nhạy cảm nguy cơ spam (ví dụ TCP port 25 SMTP) đối với người dùng thông thường.
```

---

## 3. Checklist Hoàn Thiện Feature Spec
- [ ] Bảng tác động hệ thống đã bao gồm đủ các thư mục `ProxyServer`, `ProxyApp`, `database`, `deploy` chưa?
- [ ] Câu lệnh DDL SQL đã có các ràng buộc dữ liệu (CHECK, NOT NULL, FOREIGN KEY) và chỉ mục hợp lý chưa?
- [ ] API Contract đã có đầy đủ mã lỗi (400, 401, 403, 429, 500, 503) kèm định dạng JSON lỗi chuẩn chưa?
- [ ] Cơ chế xử lý DNS Leak và bảo mật gói tin mạng đã được đặc tả rõ ràng chưa?
