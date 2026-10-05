# 📐 SKILL_SPECIFICATION.md — Quy chuẩn Thiết kế Kỹ năng Agent

> **Phiên bản:** 1.0.0  
> **Cập nhật:** 2026-10-05  
> **Mục đích:** Định nghĩa cấu trúc bắt buộc cho mọi tệp Skill (SOP — Standard Operating Procedure) trong hệ thống HCProxy. Mọi skill mới **phải** tuân thủ đặc tả này trước khi được đưa vào thư mục `skills/`.

---

## 1. Tổng quan

Mỗi Skill là một tài liệu Markdown mô tả **quy trình thực thi từng bước** cho một tác vụ kỹ thuật cụ thể. Agent đọc và tuân thủ Skill như một bản hướng dẫn vận hành — không suy diễn, không bỏ bước.

**Nguyên tắc thiết kế Skill:**

| Nguyên tắc           | Giải thích                                                                 |
| --------------------- | -------------------------------------------------------------------------- |
| **Deterministic**     | Cùng đầu vào → cùng chuỗi hành động → cùng đầu ra                        |
| **Self-contained**    | Skill chứa đủ thông tin để thực thi, không phụ thuộc ngữ cảnh hội thoại   |
| **Idempotent**        | Chạy lại nhiều lần không gây side-effect ngoài ý muốn                     |
| **Auditable**         | Mỗi bước có tiêu chí nghiệm thu rõ ràng, có thể kiểm chứng              |

---

## 2. Cấu trúc Bắt buộc

Mỗi tệp Skill phải tuân thủ **đúng trình tự** 5 phần sau:

```
┌─────────────────────────────────────┐
│  ① YAML Frontmatter                │
│  ② Mô tả Tổng quan                 │
│  ③ Pre-execution Verification       │
│  ④ Step-by-Step Procedure           │
│  ⑤ Post-execution Checklist         │
└─────────────────────────────────────┘
```

---

### 2.1 YAML Frontmatter

Khối metadata YAML nằm ở **đầu tệp**, bao bọc bởi `---`. Tất cả các trường đều **bắt buộc**.

```yaml
---
name: "<kebab-case-identifier>"
description: "<Mô tả ngắn gọn nhiệm vụ — tối đa 120 ký tự>"
triggers:
  - "<từ khóa kích hoạt 1>"
  - "<từ khóa kích hoạt 2>"
  - "<cụm từ ngữ cảnh kích hoạt>"
subagent: "<frontend-specialist | backend-specialist | devops-specialist | multi-agent>"
inputs:
  - name: "<tên tham số>"
    type: "<string | file | config | env>"
    required: <true | false>
    description: "<Mô tả tham số>"
  - name: "<tên tham số 2>"
    type: "<...>"
    required: <...>
    description: "<...>"
outputs:
  - "<Mô tả kết quả 1 (file, trạng thái, hoặc artifact)>"
  - "<Mô tả kết quả 2>"
---
```

**Quy tắc đặt tên `name`:**

| Quy tắc             | Ví dụ hợp lệ                        | Ví dụ vi phạm              |
| -------------------- | ------------------------------------ | --------------------------- |
| kebab-case           | `postgres-migration`                 | `PostgresMigration`         |
| Không chứa dấu cách | `integrate-api-endpoint`             | `integrate api endpoint`    |
| Ngắn gọn, rõ nghĩa  | `jwt-auth-setup`                     | `setup-thing`               |

**Giá trị hợp lệ cho `subagent`:**

| Giá trị                  | Phạm vi                                      |
| ------------------------ | --------------------------------------------- |
| `frontend-specialist`    | Chỉ `ProxyApp/`                               |
| `backend-specialist`     | `ProxyServer/` và `database/`                  |
| `devops-specialist`      | Toàn repo (chỉ đọc) + config/CI/CD/env        |
| `multi-agent`            | Phối hợp ≥ 2 specialist, Agent chính điều phối |

---

### 2.2 Mô tả Tổng quan

Đoạn văn ngắn (3–5 câu) giải thích:
- **Bài toán** mà skill giải quyết.
- **Phạm vi tác động** (file, thư mục, service nào bị ảnh hưởng).
- **Khi nào kích hoạt** (liên kết với `triggers` trong frontmatter).

```markdown
## Tổng quan

Skill này thực hiện [mô tả hành động cụ thể] cho hệ thống HCProxy.
Phạm vi tác động bao gồm [liệt kê thư mục/file]. Skill được kích hoạt
khi người dùng yêu cầu [ngữ cảnh kích hoạt].
```

---

### 2.3 Pre-execution Verification (Điều kiện Tiên quyết)

Danh sách kiểm tra **bắt buộc hoàn thành** trước khi Agent bắt đầu thực thi. Nếu bất kỳ mục nào thất bại, Agent **phải dừng lại** và thông báo cho người dùng.

**Cấu trúc:**

```markdown
## Điều kiện Tiên quyết

### Môi trường & Công cụ
- [ ] [Tên công cụ] đã được cài đặt — kiểm tra: `<lệnh kiểm tra>`
- [ ] [Tên service] đang chạy — kiểm tra: `<lệnh kiểm tra>`

### File & Cấu hình Phụ thuộc
- [ ] Tệp `<đường dẫn>` tồn tại và có nội dung hợp lệ
- [ ] Biến môi trường `<TÊN_BIẾN>` đã được khai báo

### Kết nối Mạng & Service
- [ ] Kết nối đến [service/database/API] thành công — kiểm tra: `<lệnh test>`
```

**Các lệnh kiểm tra phổ biến:**

| Đối tượng          | Lệnh kiểm tra                                          |
| ------------------- | ------------------------------------------------------- |
| Node.js             | `node --version`                                        |
| .NET SDK            | `dotnet --version`                                      |
| PostgreSQL client   | `psql --version`                                        |
| PostgreSQL kết nối  | `psql -h localhost -U <user> -d <db> -c "SELECT 1;"`    |
| Git                 | `git status`                                            |
| ngrok               | `ngrok version`                                         |
| npm dependencies    | `cd ProxyApp && npm ls --depth=0`                       |

---

### 2.4 Step-by-Step Procedure (Quy trình Thực thi)

Phần cốt lõi — mô tả **từng bước thao tác** theo trình tự. Mỗi bước bao gồm:

1. **Tiêu đề bước** — đánh số, mô tả hành động.
2. **Giải thích** — lý do thực hiện bước này.
3. **Lệnh CLI / Code mẫu** — trong code block có chỉ định ngôn ngữ.
4. **Xử lý ngoại lệ** — block `> ⚠️ Error Handling:` mô tả hành vi khi gặp lỗi.
5. **Tiêu chí hoàn thành bước** — checkpoint xác nhận trước khi sang bước tiếp.

**Mẫu một bước chuẩn:**

````markdown
### Bước N: [Tiêu đề hành động]

**Mục đích:** [Giải thích tại sao bước này cần thiết]

**Thực thi:**

```bash
# Lệnh CLI cụ thể
<lệnh thực thi>
```

```csharp
// Hoặc code mẫu nếu là bước code
public class ExampleService
{
    // ...
}
```

> ⚠️ **Error Handling:**
> - Nếu gặp lỗi `[mô tả lỗi]`: Thực hiện `[hành động khắc phục]`.
> - Nếu tệp `[tên file]` không tồn tại: Tạo mới với nội dung mặc định.
> - Nếu kết nối database thất bại: Kiểm tra service PostgreSQL đang chạy.

**✅ Checkpoint:** [Mô tả tiêu chí xác nhận bước hoàn thành]
````

**Quy tắc viết Step-by-Step:**

| Quy tắc                              | Giải thích                                                     |
| ------------------------------------- | -------------------------------------------------------------- |
| Một bước = Một hành động              | Không gộp nhiều hành động vào một bước                         |
| Lệnh CLI phải copy-paste được        | Không viết lệnh giả, pseudo-code, hoặc lệnh cần suy diễn      |
| Code mẫu phải compilable             | Đảm bảo code ví dụ biên dịch/chạy được trong ngữ cảnh dự án   |
| Error Handling không để trống        | Mỗi bước phải có ≥ 1 kịch bản lỗi và cách xử lý               |

---

### 2.5 Post-execution Checklist (Nghiệm thu)

Danh sách tiêu chí xác nhận tác vụ hoàn thành **100%**. Agent **phải** đánh dấu từng mục trước khi báo cáo hoàn tất.

**Cấu trúc:**

```markdown
## Nghiệm thu

### Tính đúng đắn (Correctness)
- [ ] [Mô tả kết quả mong đợi 1]
- [ ] [Mô tả kết quả mong đợi 2]

### Tính toàn vẹn (Integrity)
- [ ] Không có file nào bị xóa/ghi đè ngoài phạm vi skill
- [ ] Cấu trúc thư mục Monorepo không bị phá vỡ

### Tính tương thích (Compatibility)
- [ ] Build frontend thành công: `cd ProxyApp && npm run build`
- [ ] Build backend thành công: `cd ProxyServer && dotnet build`

### Bảo mật (Security)
- [ ] Không commit secret/token/connection string thật
- [ ] `.gitignore` đã cập nhật nếu cần
```

---

## 3. Quy trình Tạo Skill Mới

```
1. Tạo tệp Markdown mới trong `skills/` với tên kebab-case: `<tên-skill>.md`
2. Điền đầy đủ 5 phần bắt buộc theo thứ tự quy định
3. Kiểm tra YAML frontmatter hợp lệ (có thể dùng YAML linter)
4. Đảm bảo mọi lệnh CLI trong quy trình đã được verify chạy thành công
5. Cập nhật danh sách skill trong `AGENT.md` nếu cần
```

---

## 4. Danh mục Skill Hiện có

| Tệp                                  | Tên Skill                    | Subagent             | Mô tả                                              |
| ------------------------------------- | ---------------------------- | -------------------- | --------------------------------------------------- |
| `sqlite-to-postgres-migration.md`     | `sqlite-to-postgres-migration` | `backend-specialist` | Chuyển đổi DB từ SQLite sang PostgreSQL              |
| `integrate-api-endpoint.md`           | `integrate-api-endpoint`     | `multi-agent`        | Tích hợp API endpoint mới (Backend + Frontend)       |

---

> **📌 Lưu ý:** Tệp `SKILL_SPECIFICATION.md` này là tài liệu tham chiếu (reference), không phải một Skill thực thi. Agent đọc tệp này để hiểu cách diễn giải và tuân thủ các Skill khác trong thư mục `skills/`.
