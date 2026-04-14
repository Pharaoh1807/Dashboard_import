# 📈 Nhật ký Tiến độ Dự án (Project Progress Log)

File này dùng để theo dõi trạng thái hiện tại của dự án, các đầu việc đã hoàn thành và các tính năng dự kiến triển khai. Mỗi khi bắt đầu một tác vụ mới, hãy cập nhật trạng thái ở đây.

---

## 🎯 Mục tiêu hiện tại (Current Focus)
- [ ] Xác định và lên kế hoạch cho các tính năng tiếp theo (ví dụ: tối ưu hóa performance, thêm chart mới, hoặc cải thiện UI).

---

## ✅ Việc đã làm (Completed)

### 📅 Gần đây
- [x] **Dọn dẹp mã nguồn**: Xóa bỏ các file test không còn sử dụng (`test_fastapi.py`) để làm sạch project.
- [x] **Refactor Frontend**: Tách các component biểu đồ và layout ra riêng biệt. Chuyển filter vào Sidebar để tối ưu không gian hiển thị.
- [x] **Cải thiện UI/UX**: Tinh chỉnh tính thẩm mỹ của các biểu đồ và layout responsive.
- [x] **Triển khai (Deployment)**:
    - Backend: Đã đẩy lên Render.com.
    - Frontend: Đã cài đặt GitHub Actions và deploy lên GitHub Pages.
- [x] **Kết nối Database**: Thiết lập MongoDB Atlas với cơ chế lưu trữ persistent (Files & Records).
- [x] **Tính năng lõi (Core Features)**:
    - Upload Excel (hỗ trợ nhiều định dạng cột).
    - Dashboard hiển thị KPIs (Value, Shipments, Containers).
    - Export dữ liệu đã lọc ra Excel.
    - Lọc dữ liệu đa điều kiện.
- [x] **Xác thực & Bảo mật (Auth & Isolation)**:
    - Đã hoàn thành hệ thống đăng nhập/đăng ký tích hợp **Email**.
    - Cách ly dữ liệu: User chỉ thấy file mình upload, chỉ người có quyền mới được tải dữ liệu.
    - **Quản trị nâng cao (Admin Control)**: Xem danh sách, sửa Email, cấp quyền và **Phê duyệt tài khoản mới (Approval System)** trực tiếp từ giao diện.
    - Nút Đăng xuất (Logout) đã được tích hợp vào Sidebar.
    - Sửa lỗi bảo mật HMAC Key và tối ưu luồng Render Frontend.
- [x] **Sửa lỗi & Tối ưu hóa UI/UX (UI/UX Fixes)**:
    - Sửa lỗi mất phần Filter trên Sidebar (thiếu prop `fileId`).
    - Khắc phục lỗi Sidebar che khuất nút "User Management" trên màn hình nhỏ bằng cơ chế Scroll và tối ưu khoảng cách.
    - Cải thiện biểu đồ: Thay thế *Economic Distribution* bằng *Origins Distribution* (Phân bổ theo địa lý).
    - Giới hạn Top 10 Shipper trong Dashboard để tăng tính thẩm mỹ và dễ theo dõi.
- [x] **Chuẩn hóa dữ liệu (Data Normalization)**:
    - Tự động loại bỏ khoảng trắng dư thừa (*strip*) cho cột `Bill Number` và `Shipper` trong Backend để đảm bảo dữ liệu "givaudan" và "givaudan " được coi là một.

---

## 🚀 Kế hoạch tiếp theo (Roadmap / To-Do)

### 🛠 Cần làm ngay
- [ ] **Tối ưu hóa Performance**: Kiểm tra và tối ưu việc upload file lớn (>100MB) bằng cơ chế chunking hoặc background task (như đề cập trong `inform.md`).
- [ ] **Hoàn thiện Error Handling**: Bổ sung thông báo lỗi chi tiết cho các trường hợp: file sai định dạng, thiếu cột bắt buộc, hoặc file rỗng.
- [ ] **Mở rộng Dashboard**:
    - [ ] Thêm biểu đồ cột cho xu hướng theo thời gian (Tháng/Quý/Năm).
    - [ ] Cải thiện bảng dữ liệu: Thêm tính năng ẩn/hiện cột và filter nhanh tại header bảng.

### 💡 Đang thực hiện (In Progress)
- [ ] **Tối ưu hóa Performance**: Kiểm tra và tối ưu việc upload file lớn (>100MB).

### 💡 Ý tưởng phát triển (Phase 2 & 3)
- [ ] **So sánh dữ liệu**: Tính năng so sánh YoY (Year-over-Year) hoặc QoQ (Quarter-over-Quarter).
- [ ] **AI Insights**: Sử dụng Gemini/AI để phân tích xu hướng hoặc phát hiện bất thường trong dữ liệu nhập khẩu.
- [ ] **Thông báo**: Gửi báo cáo tóm tắt qua Email hàng tuần/tháng.

---

## 📝 Ghi chú quan trọng
- **Nguồn tài liệu**: Tham khảo `inform.md` cho các yêu cầu chi tiết về UI/UX và logic backend.
- **Cấu trúc kỹ thuật**: Xem `SUMMARY.md` để biết cách vận hành và các lưu ý về mapping dữ liệu.
- **Quy trình cập nhật**: Mỗi khi hoàn thành một tính năng, hãy chuyển mục đó từ "Kế hoạch tiếp theo" lên "Việc đã hoàn thành" và ghi chú ngày tháng.
