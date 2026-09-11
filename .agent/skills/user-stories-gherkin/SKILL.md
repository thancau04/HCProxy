---
name: user-stories-gherkin
description: "Tiêu chuẩn viết User Story theo mô hình 3 C's và INVEST, kèm kịch bản nghiệm thu hành vi định dạng Gherkin (Given-When-Then BDD) cho hệ thống máy chủ proxy (HCProxy). Bao gồm kịch bản Happy Path, Lỗi xác thực, Đứt gãy kết nối mạng, Tự động chuyển vùng dự phòng (Failover) và Giới hạn lưu lượng (Rate-limiting). Kích hoạt khi cần phân rã tính năng thành backlog sprint, viết kịch bản kiểm thử nghiệm thu hoặc chuẩn bị test case cho QA/Dev."
---

# Tiêu Chuẩn Viết User Story & Gherkin Acceptance Criteria Cho HCProxy

## 1. Nguyên Tắc & Tiêu Chuẩn Áp Dụng

Mọi User Story trong dự án HCProxy phải tuân thủ nghiêm ngặt 2 khung tiêu chuẩn:
1. **Mô hình 3 C's (Ron Jeffries)**:
   - **Card**: Thẻ tóm tắt ngắn gọn tiêu đề và câu chuyện người dùng.
   - **Conversation**: Thảo luận chi tiết về ngữ cảnh kỹ thuật, giới hạn mạng và giao thức.
   - **Confirmation**: Tiêu chí nghiệm thu rõ ràng, đo lường được bằng Gherkin syntax.
2. **Tiêu chuẩn INVEST**:
   - **I**ndependent (Độc lập): Có thể phát triển và triển khai tách rời.
   - **N**egotiable (Có thể thương lượng): Tập trung vào giá trị, không trói buộc chi tiết cài đặt cứng nhắc.
   - **V**aluable (Mang lại giá trị): Phục vụ trực tiếp người dùng cuối hoặc vận hành hệ thống.
   - **E**stimable (Có thể ước lượng): Đủ rõ ràng để team kỹ thuật đánh giá độ phức tạp.
   - **S**mall (Vừa vặn): Hoàn thành trong 1 sprint (1-3 ngày làm việc của kỹ sư).
   - **T**estable (Có thể kiểm thử): Nghiệm thu được thông qua tự động hóa hoặc kiểm thử thủ công.

---

## 2. Cấu Trúc Chuẩn Của Một User Story

```text
[ID / Mã Module] Tên User Story

As a [Loại người dùng / Tác nhân hệ thống: e.g. Mobile User, API Client, DevOps Admin]
I want to [Hành động / Tính năng cụ thể]
So that [Lợi ích nghiệp vụ / Giá trị vận hành nhận được]

### Context & Technical Constraints
- Giao thức áp dụng: [HTTP / HTTPS / SOCKS5 / TCP / UDP]
- Các thành phần liên quan: [ProxyServer / ProxyApp / database / API Gateway]
- Điều kiện tiền đề: [e.g. Node proxy đã được xác thực, cấu hình mạng hợp lệ]

### Acceptance Criteria (Gherkin Scenarios)
Mỗi User Story bắt buộc phải có tối thiểu 3-5 kịch bản Gherkin bao quát:
- Scenario 1: Happy Path (Luồng hoạt động chuẩn thành công)
- Scenario 2: Authentication & Authorization (Xác thực sai / Hết hạn token)
- Scenario 3: Network Error & Timeout (Mất gói tin, máy chủ proxy không phản hồi)
- Scenario 4: Failover / Recovery (Tự động chuyển tiếp khi node gặp sự cố)
- Scenario 5: Quota / Rate-limit Boundary (Chạm ngưỡng băng thông hoặc số kết nối)
```

---

## 3. Các Ví Dụ Mẫu Áp Dụng Cho HCProxy

### Ví Dụ 1: Tính Năng Tự Động Chuyển Node Khi Bị Lỗi (Auto-Failover)

**Title:** `[HCP-CORE-01] Tự động chuyển sang node dự phòng khi node chính mất kết nối`

```text
As a Mobile Proxy User,
I want the application to automatically switch to the lowest-latency backup node when my active proxy node goes down,
So that my internet connection remains uninterrupted and my original IP address is never leaked.
```

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Proxy Node Auto-Failover Mechanism

  Background:
    Given Người dùng đã đăng nhập vào ứng dụng "ProxyApp"
    And Người dùng đang kích hoạt kết nối proxy qua node "US-East-01" (IP: 198.51.100.10)
    And Danh sách node dự phòng trong cùng khu vực "US" gồm có:
      | Node Name    | IP Address     | Current Latency | Status  |
      | US-East-02   | 198.51.100.11  | 45ms            | HEALTHY |
      | US-West-01   | 203.0.113.50   | 78ms            | HEALTHY |

  Scenario: Tự động chuyển vùng thành công khi node đang hoạt động bị ngắt kết nối (Happy Path)
    Given Node "US-East-01" bất ngờ ngừng phản hồi các gói tin TCP (RST hoặc Connection Timeout > 1500ms)
    When ProxyApp phát hiện đứt kết nối
    Then Hệ thống kích hoạt tính năng Kill-Switch ngay lập tức để chặn toàn bộ outbound traffic tạm thời
    And Ứng dụng tự động thiết lập đường truyền mới tới node dự phòng có độ trễ thấp nhất là "US-East-02"
    And Thời gian chuyển đổi hoàn tất trong vòng 800ms
    And Lưu lượng mạng được mở lại bình thường qua "US-East-02"
    And Thông báo trạng thái trên giao diện đổi thành: "Đã chuyển kết nối an toàn sang US-East-02 (45ms)"

  Scenario: Toàn bộ node dự phòng trong cùng khu vực đều không khả dụng (Edge Case)
    Given Cả "US-East-02" và "US-West-01" đều không phản hồi health-check
    When ProxyApp cố gắng kết nối lại 3 lần thất bại
    Then Hệ thống duy trì trạng thái Kill-Switch an toàn (không để lộ IP thật)
    And Ứng dụng hiển thị thông báo lỗi: "Không có máy chủ dự phòng khả dụng. Vui lòng chọn vùng khác."
    And Nút kết nối chuyển sang trạng thái "Disconnected" an toàn
```

---

### Ví Dụ 2: Quản Lý Hạn Mức Băng Thông Người Dùng (Bandwidth Quota & Rate Limiting)

**Title:** `[HCP-AUTH-02] Giới hạn tốc độ và ngắt kết nối khi hết hạn mức băng thông`

```text
As a System Administrator,
I want the ProxyServer engine to enforce bandwidth rate limits and drop connections once user quota is exhausted,
So that individual users cannot exhaust server resources or exceed company egress bandwidth budget.
```

**Acceptance Criteria (Gherkin):**

```gherkin
Feature: Bandwidth Quota and Traffic Rate Limiting

  Background:
    Given Tài khoản người dùng "user_dev_01" có gói cước 10GB/tháng
    And Người dùng đã tiêu thụ 9.99GB băng thông

  Scenario: Cảnh báo khi người dùng sắp sử dụng hết hạn mức 90% (Warning notification)
    Given Người dùng tiêu thụ đạt mốc 9.0GB (90% hạn mức)
    When ProxyServer đồng bộ số liệu byte counters vào cơ sở dữ liệu
    Then Hệ thống gửi sự kiện WebSocket về ProxyApp với mã sự kiện "QUOTA_WARNING_90"
    And Giao diện Mobile App hiển thị thanh thông báo màu vàng: "Bạn đã dùng 90% dung lượng"

  Scenario: Tự động từ chối kết nối mới khi vượt quá 100% hạn mức (Negative Path)
    Given Người dùng tải tiếp một tệp tin dung lượng 50MB, làm tổng lượng truyền đạt 10.04GB (> 10GB)
    When Người dùng gửi một HTTP CONNECT request mới tới ProxyServer
    Then ProxyServer từ chối yêu cầu và trả về mã lỗi HTTP 429 Too Many Requests
    And Header phản hồi chứa: "X-Proxy-Error-Reason: QuotaExceeded"
    And ProxyServer không thiết lập socket tunnel tới máy chủ đích
```

---

## 4. Checklist Rà Soát Trước Khi Đưa User Story Vào Sprint
- [ ] Câu chuyện có diễn đạt rõ ràng vai trò người dùng và giá trị nhận được không?
- [ ] Kịch bản Gherkin có sử dụng đúng từ khóa `Given`, `When`, `Then`, `And` không?
- [ ] Đã kiểm tra trường hợp bảo mật mạng: Có rủi ro để lộ IP gốc hoặc rò rỉ DNS không?
- [ ] Đã có kịch bản xử lý mã lỗi HTTP chuẩn (401 Unauthorized, 403 Forbidden, 429 Too Many Requests, 502 Bad Gateway, 504 Gateway Timeout) chưa?
- [ ] Thời gian thực hiện story có khả thi trong phạm vi 1 sprint không?
