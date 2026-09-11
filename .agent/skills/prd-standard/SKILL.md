---
name: prd-standard
description: "Khung cấu trúc chuẩn 8 phần của Product Requirements Document (PRD) cho hệ thống quản lý máy chủ proxy (HCProxy). Bao gồm Problem Statement, SMART OKRs, JTBD & Segments, Solution Breakdown (Engine, Database, Mobile App), NFRs (Throughput, Latency, Concurrency, Security) và Release Phasing. Kích hoạt khi cần lập tài liệu yêu cầu sản phẩm, định nghĩa tính năng mới hoặc đánh giá lại tài liệu kỹ thuật."
---

# Chuẩn Tài Liệu Đặc Tả Yêu Cầu Sản Phẩm (PRD) - HCProxy

## 1. Mục Đích & Tiêu Chuẩn
Tài liệu PRD trong dự án HCProxy là bản cam kết kỹ thuật & nghiệp vụ có tính thẩm quyền cao nhất giữa Product Manager, Software Engineers (Backend, Mobile, DevOps) và QA.

Mọi tài liệu PRD tạo ra cho HCProxy phải lưu tại: `docs/PRD/PRD-[Tên-Tính-Năng].md` và tuân thủ chặt chẽ cấu trúc 8 phần dưới đây.

---

## 2. Khung Cấu Trúc Chuẩn 8 Phần Của PRD

### 1. Executive Summary (Tóm Tắt Điều Hành)
- Tóm tắt trong 2-3 câu: Tính năng này là gì? Giải quyết nút thắt cổ chai nào? Tạo ra giá trị gì cho người dùng và hệ thống proxy?

### 2. Contacts & RACI Matrix (Nhân Sự & Phân Vai)
| Vai trò | Người phụ trách | Trách nhiệm chính (RACI) |
| :--- | :--- | :--- |
| **Product Manager (PM)** | [Tên PM] | Accountable (Chịu trách nhiệm định nghĩa Scope, Value, OKRs) |
| **Tech Lead / Architect** | [Tên Tech Lead] | Responsible (Chịu trách nhiệm kiến trúc ProxyServer & DB) |
| **Mobile Lead** | [Tên Dev Mobile] | Responsible (Giao diện ProxyApp, tích hợp VPN/Proxy APIs) |
| **DevOps / Infra Lead**| [Tên DevOps] | Consulted (Triển khai node, Docker, routing & bandwidth) |
| **QA / Test Lead** | [Tên QA Lead] | Responsible (Test plan, kiểm thử tải, security & leak tests) |

### 3. Background & Problem Statement ("Why Now?")
- **Bối cảnh hiện tại**: Thực trạng hệ thống proxy hiện tại (ví dụ: việc phân bổ IP tĩnh đang gặp vấn đề bị website mục tiêu chặn, hoặc người dùng phàn nàn về tốc độ kết nối).
- **Tại sao cần làm lúc này?**: Sự thay đổi về quy mô người dùng, yêu cầu bảo mật mới, hoặc cơ hội mở rộng thị trường.
- **Hậu quả nếu không làm**: Tổn thất băng thông, tỷ lệ rời bỏ dịch vụ (churn rate), chi phí vận hành tăng cao.

### 4. Objectives & Key Results (SMART OKRs)
Mục tiêu định lượng rõ ràng, không viết chung chung:
- **Objective (Mục tiêu)**: Xây dựng cơ chế cân bằng tải động và kiểm tra sức khỏe node tự động cho cụm máy chủ proxy.
- **Key Results (Kết quả then chốt)**:
  - KR 1: Giảm tỷ lệ kết nối proxy bị lỗi (HTTP 502/504) từ 3.5% xuống dưới 0.1%.
  - KR 2: Thời gian phát hiện và cô lập node hỏng (Failover detection time) dưới 2000ms.
  - KR 3: Độ trễ bổ sung (Latency overhead) qua ProxyServer không vượt quá 15ms tại mức tải 10,000 req/s.

### 5. Target Market Segments & Personas (Khách Hàng & Nhu Cầu)
Định nghĩa theo Job-To-Be-Done (JTBD), ví dụ:
- **Data Scraping Engineers**: Cần pool IP xoay vòng quy mô lớn, tỷ lệ sống cao, hỗ trợ cả HTTP và SOCKS5 để thu thập dữ liệu không bị captcha.
- **Mobile Privacy Users**: Cần ứng dụng di động bật 1 chạm (Quick Connect), không rò rỉ DNS, hiển thị độ trễ từng node trực quan.
- **DevOps / SysAdmin**: Cần dashboard theo dõi tài nguyên node (CPU, RAM, Network I/O), quản lý Access Token và giới hạn băng thông (Rate limiting).

### 6. Value Propositions & Competitive Edge
- **Pains Relieved**: Loại bỏ rủi ro rò rỉ IP gốc, xóa bỏ thao tác cấu hình thủ công phức tạp.
- **Gains Created**: Kết nối ổn định liên tục, tối ưu chi phí hạ tầng qua cơ chế tự động điều phối lưu lượng.
- **Value Curve vs. Competitors**: So sánh với các giải pháp như Squid, HAProxy standalone, hoặc các nhà cung cấp Proxy SaaS thương mại.

### 7. Solution Specifications (Đặc Tả Giải Pháp Chi Tiết)
- **7.1 UX / Interaction Flows**:
  - Luồng kết nối trên Mobile App (Splash $\rightarrow$ Node List $\rightarrow$ Connect Toggle $\rightarrow$ Realtime Stats).
  - Luồng quản trị trên Web/API (Add Node $\rightarrow$ Health Probe $\rightarrow$ Active Pool).
- **7.2 Key Functional Requirements**:
  - Mô tả chi tiết từng tính năng, input, logic xử lý, output và quy tắc nghiệp vụ (Business Rules).
- **7.3 Technical Architecture & Constraints**:
  - Thành phần tác động: `ProxyServer`, `database` (PostgreSQL), `ProxyApp`, `deploy` (Docker).
  - Giao thức mạng: HTTP/1.1, HTTP/2, SOCKS5, UDP Associates (nếu có).
  - Phi chức năng (NFR): Throughput tối thiểu, Max Memory per connection (< 64KB), Zero-logging policy đối với payload người dùng.
- **7.4 Critical Assumptions & Dependencies**:
  - Giả định về băng thông nhà cung cấp VPS, hỗ trợ hệ điều hành (Android/iOS VPNService).

### 8. Release & Phasing Strategy (Lộ Trình Triển Khai)
- **Phase 1 (MVP)**: Các tính năng cốt lõi bắt buộc phải có để hệ thống hoạt động an toàn.
- **Phase 2 (Enhancement)**: Tối ưu hiệu năng, tự động hóa cân bằng tải, widget Mobile App.
- **Phase 3 (Scale & Analytics)**: Báo cáo phân tích chi tiết, cảnh báo nâng cao, tích hợp thanh toán.

---

## 3. Checklist Đánh Giá Chất Lượng PRD Trước Khi Duyệt
- [ ] Mục tiêu thành công có số đo định lượng (OKR) cụ thể hay không?
- [ ] Đã bao quát đủ các khía cạnh kỹ thuật mạng proxy (DNS leak, connection timeout, error codes)?
- [ ] Có phân chia rõ ràng trách nhiệm giữa ProxyServer backend và Mobile App frontend không?
- [ ] Ngôn ngữ rõ ràng, ngắn gọn, hạn chế từ ngữ mơ hồ như "nhanh chóng", "tối ưu", "dễ dùng" mà thay bằng chỉ số đo lường được.
