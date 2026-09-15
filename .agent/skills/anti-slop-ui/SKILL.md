---
name: anti-slop-ui
description: "Quy chuẩn thiết kế UI/UX và Microcopy chống AI slop cho ứng dụng di động quản trị mạng (HCProxy). Kết hợp hệ thống lưới kỹ thuật, độ tương phản cao, font Monospace từ 'stop-slop' và nguyên tắc UX writing trực diện, không sáo rỗng, công thức lỗi 3 thành phần từ 'shuorenhua'. Kích hoạt khi thiết kế giao diện Mobile, viết Microcopy, review UI component hoặc chuẩn hóa thông báo lỗi hệ thống."
---

# Quy Chuẩn UI/UX & Microcopy Chống AI Slop Cho Ứng Dụng Quản Trị Mạng (HCProxy)

## 1. Triết Lý Cốt Lõi: Tích Hợp "Stop-Slop" & "ShuoRenHua"

Giao diện ứng dụng di động quản trị hạ tầng mạng (HCProxy Mobile App) phục vụ người dùng và kỹ sư trong các tình huống nhạy cảm về thời gian: kiểm tra an toàn kết nối, chẩn đoán node sập, đo độ suy hao đường truyền, giám sát IP/Port và khắc phục sự cố.

Bộ quy chuẩn này tích hợp hai trường phái thiết kế và giao tiếp thực dụng:
1. **Từ `stop-slop` (Hardik Pandya)**: Triệt tiêu sự hào nhoáng giả tạo của AI (AI visual slop) — loại bỏ gradient neon mờ ảo, bóng đổ nhòe nhoẹt (blurry diffuse shadows), khoảng trắng lãng phí, bo góc quá trớn và sự thiếu hụt phân cấp thông tin. Thiết lập thẩm mỹ kỹ thuật tối giản (Technical Brutalism/Pragmatism), kỷ luật lưới 4px/8px, độ tương phản cao và bắt buộc font Monospace cho dữ liệu máy móc.
2. **Từ `shuorenhua` (MrGeDiao - 说人话 / Nói Tiếng Người)**: Triệt tiêu sự sáo rỗng trong văn phong do AI tạo ra — loại bỏ lời xin lỗi khách sáo, rào đón dài dòng ("Có vẻ như...", "Xin lưu ý rằng..."), văn mẫu quảng cáo hứa hẹn hão huyền. Mọi câu chữ phải trực diện, ngắn gọn, nhãn hành động tối đa 2-3 từ, thông báo lỗi bắt buộc tuân theo công thức toán học: `[LỖI GÌ] + [NGUYÊN NHÂN] + [HƯỚNG KHẮC PHỤC]`.

---

## 2. Bảng Đối Chiếu Tư Duy: AI Slop vs. Anti-Slop (HCProxy Standard)

| Tiêu chí | AI Slop Thường Gặp (Cấm Tuyệt Đối) | Chuẩn Kỹ Thuật HCProxy (Bắt Buộc) |
| :--- | :--- | :--- |
| **Bảng màu & Nền** | Nền tím/hồng neon, gradient gradient pastel mờ ảo trôi nổi, xám nhờ nhờ thiếu độ tương phản (`#2A2A35`). | Technical Dark Palette chuẩn OLED: `#0A0D14`, `#111622`, `#1A2234`. Màu tương phản cao, đạt chuẩn WCAG AAA. |
| **Đổ bóng & Viền** | Đổ bóng mờ nhòe diện rộng (`box-shadow: 0 20px 40px rgba(0,0,0,0.4)`), làm chậm GPU di động và tạo cảm giác bồng bềnh thiếu chắc chắn. | Không dùng shadow khuếch tán. Dùng viền sắc nét 1px solid (`#1E293B`, `#334155`) hoặc hard-edge shadow (nếu cần phân tách layer). |
| **Bo góc (Corner Radius)** | Bo tròn tối đa hình viên thuốc (`border-radius: 9999px` / `24px`) cho mọi card và khung dữ liệu kỹ thuật. | Bo góc kỹ thuật gọn gàng: `4px` (tags, badges, inputs), `6px` hoặc `8px` (cards, dialogs). Cấm dùng pill shape cho card thông số. |
| **Typography Dữ Liệu** | Dùng font Sans-serif chung chung (Inter, Roboto) cho cả địa chỉ IP, số Port và biểu đồ Ping, dẫn đến số bị co giật khi nhảy số. | **Bắt buộc font Monospace** (`JetBrains Mono`, `Roboto Mono`, `Fira Code`) với tính năng `tabular-nums` cho mọi địa chỉ IP, Subnet, Port, Latency (ms), Throughput (KB/s, MB/s), Logs. |
| **Mật độ thông tin** | Khoảng trắng mênh mông, mỗi màn hình chỉ hiển thị được 1-2 node proxy, cuộn mỏi tay để tìm thông số. | Mật độ thông tin cao (High Information Density), bố cục lưới chặt chẽ, tối ưu tầm mắt của SysAdmin/DevOps trên màn hình 360-430px. |
| **Nhãn nút bấm (Action)** | Dài dòng, văn mẫu: "Nhấn vào đây để bắt đầu kích hoạt kết nối proxy ngay", "Tiến hành làm mới". | Tối đa **2 - 3 từ**, bắt đầu bằng động từ hành động: `Kết nối`, `Ngắt kết nối`, `Đổi node`, `Sao chép IP`, `Thử lại`, `Xóa log`. |
| **Thông báo lỗi** | Khách sáo, che giấu kỹ thuật: "Ối, có lỗi bất ngờ xảy ra! Chúng tôi rất tiếc vì sự bất tiện này. Bạn vui lòng thử lại sau nhé." | Rõ ràng 3 vế: **[Lỗi]** Socket timeout sau 3000ms. **[Nguyên nhân]** Port 1080 của SG-Node-01 không phản hồi. **[Khắc phục]** Bấm 'Đổi node' hoặc kiểm tra 4G/Wi-Fi. |
| **Trạng thái kết nối** | Mơ hồ, văn vẻ: "Đang lướt trên mây...", "Đang hòa nhập vào mạng lưới toàn cầu...". | Trực tiếp, chính xác: `CONNECTED (24ms)`, `DISCONNECTED`, `RECONNECTING (Lần 2/3)`, `DEGRADED (Loss 12%)`. |

---

## 3. Quy Chuẩn Thiết Kế UI Kỹ Thuật (Phát Triển Từ "Stop-Slop")

### 3.1 Hệ Thống Lưới & Khoảng Trắng (Spacing System)
Mọi kích thước lề (margin), đệm (padding), kích thước thành phần (sizing) trên HCProxy Mobile App bắt buộc tuân theo bội số của **4px / 8px**:
- `space-1`: 4px (Khoảng cách giữa icon và label phụ, badge padding).
- `space-2`: 8px (Khoảng cách giữa các dòng thông số trong cùng một card).
- `space-3`: 12px (Padding bên trong input field, padding nút nhỏ).
- `space-4`: 16px (Padding tiêu chuẩn của card node, lề màn hình mobile `screen-edge`).
- `space-6`: 24px (Khoảng cách giữa các section chức năng).
- `space-8`: 32px (Khoảng cách tối đa trước vùng cố định footer/action bar).

> [!IMPORTANT]
> **Quy tắc chống lãng phí khoảng trắng**: Tuyệt đối không chừa padding > 24px bên trong các card hiển thị trạng thái mạng. Mọi pixel trên mobile phải phục vụ việc hiển thị dữ liệu hoặc tạo ranh giới nhận diện rõ ràng.

### 3.2 Bảng Mã Màu Kỹ Thuật (Design Tokens)
Ứng dụng sử dụng bảng màu tối kỹ thuật (Deep Network Console):

```css
/* Backgrounds */
--bg-canvas: #0A0D14;       /* Nền toàn màn hình */
--bg-surface: #111622;      /* Nền card node, container */
--bg-elevated: #182032;     /* Nền modal, bottom sheet, dropdown */
--bg-subtle: #1E293B;       /* Nền hover, state phụ */

/* Borders - Thay thế hoàn toàn cho blur shadow */
--border-subtle: #1E293B;   /* Đường phân cách giữa các item */
--border-default: #334155;  /* Viền card, input unselected */
--border-focus: #3B82F6;    /* Viền khi focus/active */

/* Text & Data */
--text-primary: #F8FAFC;    /* Nhãn chính, tiêu đề (Contrast ratio > 12:1) */
--text-secondary: #94A3B8;  /* Nhãn phụ, đơn vị đo (ms, KB/s) */
--text-muted: #64748B;      /* Timestamp, log context */

/* Semantic Status Tokens - Tuyệt đối không dùng màu mập mờ */
--status-healthy-bg: #064E3B;
--status-healthy-text: #34D399; /* Xanh ngọc: Node sống, ping < 80ms, kết nối ổn định */

--status-degraded-bg: #78350F;
--status-degraded-text: #FBBF24; /* Vàng hổ phách: Node suy hao, ping > 150ms, packet loss */

--status-failed-bg: #7F1D1D;
--status-failed-text: #F87171;   /* Đỏ tươi: Node chết, handshake timeout, auth thất bại */

--status-idle-bg: #1E293B;
--status-idle-text: #94A3B8;     /* Xám: Node đang ngắt kết nối / Standby */
```

### 3.3 Typography & Định Dạng Dữ Liệu Máy (Monospace Enforcement)
Giao diện phân định rạch ròi giữa văn bản điều hướng (Sans-serif) và dữ liệu kỹ thuật (Monospace):

1. **System Sans-serif (Inter / Roboto / SF Pro)**:
   - Dùng cho: Tiêu đề màn hình (`16px`, `Semi-bold`), nhãn chức năng (`13px-14px`, `Medium`), thông báo hướng dẫn (`13px`, `Regular`).
2. **Technical Monospace (JetBrains Mono / Roboto Mono / SF Mono)**:
   - **Bắt buộc 100%** cho các trường:
     - Địa chỉ IP: `198.51.100.42`
     - Cổng dịch vụ (Port): `:1080`, `:8080`, `:443`
     - Dải mạng CIDR: `10.240.0.0/16`
     - Độ trễ (Latency): `24ms`, `142ms`
     - Băng thông thời gian thực: `↓ 2.4 MB/s  ↑ 418 KB/s`
     - Mã băm / Token / UUID: `a7f9c2...8e4b`
     - Giao thức: `[SOCKS5]`, `[HTTP/CONNECT]`, `[UDP_GW]`
     - Nhật ký gói tin (Logs): `14:23:01.092 [CONN_ESTABLISHED] 10.0.0.2 -> 1.1.1.1:53`
   - Thuộc tính bắt buộc: `font-variant-numeric: tabular-nums;` để các chữ số có độ rộng đồng nhất, ngăn chặn tình trạng co giật giao diện khi băng thông và ping cập nhật liên tục mỗi giây.

### 3.4 Bố Cục Thẻ Node Proxy (Card Architecture)
Thẻ node trong danh sách phải hiển thị tối đa thông tin hữu ích trong chiều cao không quá **76px**:

```text
+-----------------------------------------------------------------------+
|  [● HEALTHY]  SG-Node-01 (Singapore)                      32ms  [ > ] |
|  IP: 203.0.113.102:1080    SOCKS5    Down: 1.2 MB/s   Up: 84 KB/s     |
+-----------------------------------------------------------------------+
```
- Không lồng card trong card.
- Không dùng icon hoạt hình quay vòng tròn vô nghĩa.
- Đèn trạng thái (Status Dot) hình tròn đường kính đúng `8px`, có viền tương phản `1px`.

---

## 4. Quy Chuẩn Microcopy & UX Writing Thực Dụng (Phát Triển Từ "ShuoRenHua")

### 4.1 Bộ Luật Cấm Kỵ Về Ngôn Từ (The Anti-Fluff Rules)

1. **Cấm từ ngữ xin lỗi và khách sáo**:
   - ❌ *"Rất tiếc vì sự cố này...", "Chúng tôi thành thật xin lỗi vì sự bất tiện..."*
   - ❌ *"Kính chào Quý khách!", "Chúc bạn một ngày làm việc hiệu quả!"*
   - ✔️ Bỏ toàn bộ lời chào và xin lỗi. Đi thẳng vào dữ kiện kỹ thuật và phương án xử lý.
2. **Cấm cụm từ rào đón (Throat-Clearing Openers)**:
   - ❌ *"Xin lưu ý rằng cổng kết nối này cần được xác thực..."* $\rightarrow$ ✔️ *"Cổng yêu cầu xác thực mật khẩu."*
   - ❌ *"Hệ thống nhận thấy độ trễ của bạn đang tăng..."* $\rightarrow$ ✔️ *"Độ trễ cao (250ms). Tuyến cáp bị nghẽn."*
3. **Cấm văn mẫu AI đối lập giả tạo (Binary Contrasts & Artificial Drama)**:
   - ❌ *"Không chỉ là một proxy thông thường, đây là lá chắn bảo vệ toàn diện của bạn."* $\rightarrow$ ✔️ *"Định tuyến mã hóa toàn bộ lưu lượng TCP/UDP."*
4. **Cấm tính từ tâng bốc mơ hồ (Adjectives of Exaggeration)**:
   - ❌ *"Tốc độ bàn thờ", "Bảo mật tuyệt đối", "Giải pháp đỉnh cao", "Mượt mà không giới hạn".*
   - ✔️ Thay bằng con số kỹ thuật: *"Băng thông 10 Gbps", "Mã hóa TLS 1.3", "Zero packet drop".*

### 4.2 Chuẩn Hóa Nhãn Nút Bấm (Button & Action Copy)
Nguyên tắc: **Tối đa 2 đến 3 từ**. Bắt đầu bằng động từ mệnh lệnh xác định.

| Mục đích hành động | AI Slop (Sai) | Anti-Slop HCProxy (Đúng) |
| :--- | :--- | :--- |
| Khởi tạo proxy tunnel | "Bấm vào đây để bắt đầu kết nối" | `Kết nối` |
| Hủy kết nối đang chạy | "Dừng phiên làm việc ngay bây giờ" | `Ngắt kết nối` |
| Đổi sang server khác | "Tìm kiếm và chuyển sang máy chủ khác"| `Đổi node` |
| Rà soát tình trạng mạng | "Tiến hành kiểm tra sức khỏe hệ thống" | `Kiểm tra ping` |
| Dọn dẹp log kết nối | "Xóa sạch toàn bộ lịch sử đã ghi" | `Xóa log` |
| Sao chép cấu hình | "Nhấn để copy chuỗi proxy vào clipboard"| `Sao chép URI` |
| Phê duyệt cấp quyền VPN | "Tôi đồng ý cho phép ứng dụng can thiệp"| `Cấp quyền VPN` |

### 4.3 Công Thức Bắt Buộc Cho Mọi Thông Báo Lỗi (Error Message Formula)
Mọi thông báo lỗi xuất hiện trên HCProxy (Alert, Dialog, Toast, Banner) **bắt buộc** phải cấu trúc đủ 3 vế sau:

$$\mathbf{Thông\ Báo\ Lỗi} = \mathbf{[LỖI\ GÌ]} + \mathbf{[NGUYÊN\ NHÂN]} + \mathbf{[HƯỚNG\ KHẮC\ PHỤC]}$$

#### Các tình huống lỗi điển hình trên HCProxy Mobile:

##### 1. Lỗi Timeout Bắt Tay SOCKS5:
- ❌ **AI Slop**: *"Úi chà! Không thể kết nối tới máy chủ Singapore. Chúng tôi rất tiếc về sự gián đoạn này. Xin hãy thử lại sau ít phút hoặc chọn node khác nhé!"*
- ✔️ **Chuẩn HCProxy**:
  - **Lỗi**: Mất kết nối tới node SG-Node-01.
  - **Nguyên nhân**: Bắt tay SOCKS5 quá hạn sau 3000ms (Port 1080 không phản hồi).
  - **Khắc phục**: Chuyển sang SG-Node-02 hoặc kiểm tra lại đường truyền mạng cục bộ.
  - *Nút hành động kèm theo*: `[Đổi node]` `[Thử lại]`

##### 2. Lỗi Xác Thực Token Proxy (HTTP 407 / SOCKS5 Auth Failed):
- ❌ **AI Slop**: *"Thông tin đăng nhập của bạn có vẻ không chính xác. Hãy vui lòng kiểm tra lại tài khoản để tiếp tục trải nghiệm dịch vụ an toàn."*
- ✔️ **Chuẩn HCProxy**:
  - **Lỗi**: Xác thực Proxy thất bại (407 Proxy Authentication Required).
  - **Nguyên nhân**: Secret Token đã hết hạn lúc 14:00:00 hoặc Username/Password sai.
  - **Khắc phục**: Cập nhật lại Access Key trong phần Cài đặt Tài khoản.
  - *Nút hành động kèm theo*: `[Cài đặt]` `[Hủy]`

##### 3. Lỗi Rò Rỉ DNS (DNS Leak Detected):
- ❌ **AI Slop**: *"Cảnh báo bảo mật quan trọng! Có thể địa chỉ truy cập của bạn đang bị lộ ra bên ngoài đấy. Hãy cẩn thận!"*
- ✔️ **Chuẩn HCProxy**:
  - **Lỗi**: Phát hiện rò rỉ truy vấn DNS ngoài tunnel proxy.
  - **Nguyên nhân**: DNS hệ thống của Wi-Fi (192.168.1.1) đang ghi đè DoH tunnel.
  - **Khắc phục**: Bật chế độ "Ép buộc DoH qua Proxy" trong Cài đặt DNS.
  - *Nút hành động kèm theo*: `[Bật ép DoH]` `[Bỏ qua]`

##### 4. Lỗi Tràn Hạn Mức Băng Thông (Bandwidth Quota Exceeded):
- ❌ **AI Slop**: *"Bạn đã dùng hết dung lượng rồi nè! Hãy nạp thêm để tiếp tục vui vẻ cùng chúng tôi nhé."*
- ✔️ **Chuẩn HCProxy**:
  - **Lỗi**: Ngắt kết nối proxy do chạm ngưỡng dung lượng.
  - **Nguyên nhân**: Đã tiêu thụ 50.00 GB / 50.00 GB của gói cước tháng.
  - **Khắc phục**: Gia hạn gói cước hoặc chuyển sang node miễn phí giới hạn tốc độ.
  - *Nút hành động kèm theo*: `[Gia hạn gói]` `[Đóng]`

---

## 5. Đặc Tả Tương Tác Mobile Cho Môi Trường Khẩn Cấp

### 5.1 Vùng Chạm An Toàn (Touch Targets)
- Chiều cao tối thiểu của nút bấm chính: `48px`.
- Vùng bấm các icon thao tác nhanh (Copy, Ping, Delete): tối thiểu `44px × 44px` (kể cả khi icon chỉ hiển thị `20px`).
- Ngăn chặn triệt để hiện tượng bấm nhầm (Fat-finger errors) khi kỹ sư thao tác bằng 1 tay trên đường di chuyển.

### 5.2 Nút Hủy Khẩn Cấp (Kill-Switch)
- Nút **"Ngắt toàn bộ" (Kill-Switch)** phải luôn đặt ở vị trí cố định dễ tiếp cận nhất (Fixed Bottom Center hoặc Top Right Header).
- Màu sắc: Nền tối viền đỏ `--status-failed-text` (`#EF4444`), chữ đỏ in hoa `NGẮT KẾT NỐI`.
- Nhấn 1 chạm ngắt ngay lập tức, đóng toàn bộ Virtual NIC/VPN socket trong vòng $\le 100\text{ms}$. Không hiển thị hộp thoại hỏi lại *"Bạn có chắc chắn muốn ngắt không?"* làm mất thời gian bảo vệ IP của người dùng.

---

## 6. Danh Mục Kiểm Tra (Anti-Slop Audit Checklist)

Mọi Pull Request (PR) liên quan đến giao diện Mobile (`ProxyApp`) hoặc thông báo hệ thống bắt buộc phải vượt qua bảng kiểm định 10 tiêu chí sau trước khi được phép merge:

- [ ] **1. Không Gradient Neon**: Mọi bề mặt (cards, dialogs, buttons) dùng màu đặc kỹ thuật, không dùng gradient trang trí AI slop.
- [ ] **2. Không Blurry Shadows**: Không dùng `box-shadow` lan tỏa mờ nhòe. Dùng `border: 1px solid` để chia tách layer.
- [ ] **3. Bo góc chuẩn**: Radius tối đa `4px` - `8px`. Không dùng bo tròn viên thuốc cho các card hiển thị bảng thông số kỹ thuật.
- [ ] **4. Chuẩn Monospace**: 100% địa chỉ IP, Port, Subnet, Ping (ms), Băng thông (KB/s, MB/s) dùng font Monospace với `tabular-nums`.
- [ ] **5. Nhãn nút siêu ngắn**: Không nhãn nút nào vượt quá 3 từ. Bắt đầu bằng động từ hành động trực tiếp.
- [ ] **6. Công thức lỗi 3 vế**: Mọi màn hình/dialog báo lỗi đều ghi rõ: `Lỗi gì` + `Nguyên nhân kỹ thuật` + `Cách khắc phục cụ thể`.
- [ ] **7. Xóa sạch xin lỗi**: Tìm kiếm trong code không chứa các chuỗi: "rất tiếc", "xin lỗi", "vui lòng thử lại sau", "có lỗi xảy ra".
- [ ] **8. Độ tương phản WCAG**: Text trên nền tối đạt tỷ lệ tương phản tối thiểu `4.5:1` (nhãn phụ) và `7:1` (dữ liệu chính).
- [ ] **9. Touch Target $\ge 44\text{px}$**: Mọi phần tử có thể bấm được đều đáp ứng vùng chạm tối thiểu $44\text{px} \times 44\text{px}$.
- [ ] **10. Trạng thái định lượng**: Trạng thái mạng hiển thị bằng con số cụ thể (ms, loss %, KB/s), không dùng trạng thái cảm xúc.

---

## 7. Mẫu Component Code Tham Chiếu (React Native / Flutter)

### Ví dụ: Error Banner Component Chuẩn Anti-Slop (React Native / TypeScript)

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AntiSlopErrorProps {
  errorTitle: string;    // Lỗi gì
  cause: string;         // Nguyên nhân
  resolution: string;    // Hướng khắc phục
  actionLabel?: string;  // Tối đa 2-3 từ
  onAction?: () => void;
}

export const NetworkErrorCard: React.FC<AntiSlopErrorProps> = ({
  errorTitle,
  cause,
  resolution,
  actionLabel = 'Thử lại',
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.indicator} />
        <Text style={styles.errorText}>LỖI: {errorTitle}</Text>
      </View>
      
      <Text style={styles.monoCause}>NGUYÊN NHÂN: {cause}</Text>
      <Text style={styles.resolutionText}>KHẮC PHỤC: {resolution}</Text>

      {onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#160B0B',
    borderWidth: 1,
    borderColor: '#7F1D1D',
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F87171',
    textTransform: 'uppercase',
  },
  monoCause: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#261212',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
    minHeight: 36,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCA5A5',
    textTransform: 'uppercase',
  },
});
```
