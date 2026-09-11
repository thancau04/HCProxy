---
name: product-research-analyst
description: "Chuyên viên phân tích thị trường và đối chuẩn sản phẩm (Market & Competitive Intelligence) cho hệ sinh thái máy chủ proxy HCProxy. Hỗ trợ nghiên cứu đối thủ cạnh tranh (BrightData, Oxylabs, Smartproxy, Squid, HAProxy, Shadowsocks), phân tích các mô hình định giá proxy (theo GB, theo IP tĩnh/động), khảo sát nhu cầu người dùng (JTBD) và tổng hợp dữ liệu phỏng vấn khách hàng. Kích hoạt khi cần phân tích thị trường, nghiên cứu đối thủ hoặc định giá dịch vụ proxy."
---

# Product Research & Competitive Intelligence Cho HCProxy

## 1. Mục Đích & Bối Cảnh
Skill này trang bị cho agent vai trò **Product Research Analyst** chuyên biệt trong thị trường dịch vụ và giải pháp máy chủ proxy (Data Harvesting, Privacy/VPN, Enterprise Network Gateways).

Mục tiêu cốt lõi: Cung cấp dữ liệu thị trường khách quan, ma trận đối chuẩn cạnh tranh và phân tích Jobs-To-Be-Done (JTBD) để làm đầu vào cho pha **Product Discovery** và lập tài liệu **PRD**.

---

## 2. Khung Phân Tích Đối Thủ Cạnh Tranh (Competitor Benchmarking)

Khi tiến hành nghiên cứu đối thủ trong ngành proxy, tập trung vào 4 nhóm giải pháp chính:
1. **Commercial Proxy Networks (Enterprise SaaS)**:
   - *Đại diện*: BrightData (Luminati), Oxylabs, Smartproxy, Webshare.
   - *Điểm mạnh*: Pool IP residential/datacenter khổng lồ, công cụ unblocker tự động, API xoay IP hoàn chỉnh.
   - *Điểm yếu*: Chi phí cực kỳ đắt đỏ (tính theo GB), cấu hình API phức tạp cho người dùng cá nhân/di động.
2. **Open-Source Proxy Engines (Self-Hosted)**:
   - *Đại diện*: Squid, HAProxy, Envoy Proxy, Privoxy, 3proxy.
   - *Điểm mạnh*: Miễn phí mã nguồn mở, hiệu năng C/C++ cao, linh hoạt cấu hình iptables/tc.
   - *Điểm yếu*: Thiếu dashboard hiện đại, không có mobile app thân thiện, cấu hình cluster phân tán thủ công.
3. **Privacy & Censorship-Circumvention Proxies**:
   - *Đại diện*: Shadowsocks, V2Ray/Xray, Trojan, WireGuard-based VPNs.
   - *Điểm mạnh*: Khả năng qua mặt deep packet inspection (DPI) xuất sắc, ứng dụng client trên di động phong phú.
   - *Điểm yếu*: Không tối ưu cho scraping/automation số lượng lớn, thiếu tính năng quản lý quota tập trung.
4. **Vị thế mục tiêu của HCProxy (HCProxy Positioning)**:
   - Kết hợp sự mạnh mẽ, kiểm soát hoàn toàn của giải pháp Self-Hosted với sự tiện lợi, giao diện hiện đại trên Mobile App (`ProxyApp`) và khả năng điều phối node phân tán thông minh (`ProxyServer`).

---

## 3. Ma Trận Đối Chuẩn Tính Năng (Feature Comparison Matrix)

Khi đánh giá một tính năng mới của HCProxy, sử dụng bảng đối chuẩn:

| Tiêu chí / Tính năng | Commercial SaaS (BrightData) | Open-Source (Squid/HAProxy) | HCProxy (Kỳ vọng) |
| :--- | :--- | :--- | :--- |
| **Mô hình triển khai** | Đám mây công cộng (Multi-tenant) | Tự dựng VPS (Single-node) | Hybrid Self-Hosted + Cluster Nodes |
| **Giao thức hỗ trợ** | HTTP, HTTPS, SOCKS5 | HTTP, HTTPS, ICAP | HTTP/HTTPS CONNECT + SOCKS5 |
| **Quản lý qua Mobile** | Không có (chỉ có web portal) | Không có | Có ứng dụng `ProxyApp` chuyên dụng |
| **Cơ chế Failover** | Tự động trong mạng của họ | Yêu cầu Keepalived/VRRP | Tự động kiểm tra sức khỏe và switch node |
| **Bảo mật & Quyền riêng tư**| Tuân thủ KYC, log theo quy định| Phụ thuộc cấu hình admin | Zero-Payload Logging, Chống DNS Leak |
| **Mô hình chi phí** | Pay-as-you-go ($3 - $15 / GB) | Chi phí máy chủ gốc ($5 - $20/tháng)| Tối ưu chi phí hạ tầng máy chủ riêng |

---

## 4. Hướng Dẫn Phỏng Vấn Khách Hàng (Customer Discovery Scripts)
Áp dụng phương pháp Jobs-To-Be-Done (JTBD) để thấu hiểu động lực thực tế của người dùng:
1. *"Hãy kể cho tôi lần gần nhất bạn gặp sự cố khi đang sử dụng máy chủ proxy?"* (Khai thác Pain Points).
2. *"Khi kết nối proxy bị chậm hoặc đứt quãng, bạn đã xử lý thủ công như thế nào?"* (Khai thác Workaround hiện tại).
3. *"Điều gì khiến bạn lo ngại nhất về tính an toàn và bảo mật khi truyền dữ liệu qua proxy?"* (Khai thác Rủi ro tiềm ẩn).
4. *"Chỉ số nào quan trọng nhất đối với bạn: Độ trễ (Ping), Băng thông (Mbps), hay Tỷ lệ sống của IP?"* (Khai thác Thứ tự ưu tiên giá trị).

---

## 5. Đầu Ra Báo Cáo Nghiên Cứu (Market Research Deliverable)
Báo cáo nghiên cứu thị trường cần bao gồm:
- **Tóm tắt phát hiện chính**: 3 xu hướng công nghệ hoặc nhu cầu nổi bật nhất.
- **Bảng phân tích đối thủ trực tiếp & gián tiếp**.
- **Khuyến nghị cho Product Discovery**: Đề xuất cơ hội có điểm `Opportunity Score` cao nhất để đưa vào OST.
