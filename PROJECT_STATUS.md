# 📈 Nhật ký Tiến độ Dự án (Project Progress Log)

File này dùng để theo dõi trạng thái hiện tại của dự án, các đầu việc đã hoàn thành và các tính năng dự kiến triển khai. Mỗi khi bắt đầu một tác vụ mới, hãy cập nhật trạng thái ở đây.

---

## 🎯 Mục tiêu hiện tại (Current Focus)
- [ ] Xác định và lên kế hoạch cho các tính năng tiếp theo (ví dụ: tối ưu hóa performance, thêm chart mới, hoặc cải thiện UI).

---

## ✅ Việc đã làm (Completed)

### 📅 Gần đây
- [x] **API Caching & Code Refactoring**: Cơ chế `_apply_filters` đã được lưu trữ (Cache) ngay trong memory để ngăn việc lặp lại 3-4 lần tính toán Pandas bị trùng nhau cho mỗi query từ Dashboard. Cắt gọn vòng lặp `_preprocess`, dọn sạch những bottlenecks tốn CPU nhất.
- [x] **Filter tương hỗ động (Cascading Filters)**: Filter được nâng cấp để phản ứng dựa trên nhau. Khi bạn chọn Năm 2026, danh sách Shipper và Origin sẽ tự thu hẹp lại chỉ hiển thị những tập dữ liệu tồn tại trong Năm 2026. Tương tự khi bạn chọn Shipper A, các tuỳ chọn Origin hoặc Năm cũng sẽ chỉ hiển thị những cái thuộc Shipper A.
- [x] **Dọn dẹp Lưu trữ Tự động (Auto-Cleanup DB)**: Tự động xoá vĩnh viễn file và bộ dữ liệu cũ của người dùng khi họ lựa chọn phân tích sheet mới, đảm bảo dung lượng lưu trữ MongoDB được kiểm soát và tối ưu tuyệt đối.
- [x] **Tối ưu hoá Luồng Upload & Hiệu Năng (Giai đoạn 1)**: Đọc Excel bằng engine Rust (Calamine) cực nhanh, chia nhỏ dữ liệu lúc ghi vào MongoDB (5000 rows/batch) để chống đầy RAM, và tối ưu hàm tự động phân tích định dạng ngày tháng bằng Pandas Vectorization.
- [x] **Tối ưu hóa quy trình Upload Excel**: 
    - Chuyển từ cơ chế tự động quét header (gây chậm) sang quy trình 2 bước: hiển thị danh sách sheet để người dùng tự chọn.
    - Mặc định dòng 0 làm header giúp tăng tốc độ xử lý và độ chính xác.
    - Cập nhật UI Frontend để hiển thị modal chọn sheet và trạng thái xử lý chi tiết.
- [x] **Mở rộng Mapping Dữ liệu**: Bổ sung thêm nhiều alias tiếng Việt và tiếng Anh cho các cột quan trọng (Số vận đơn, Trị giá USD, Lượng, Người xuất khẩu,...) để tăng khả năng tương thích với nhiều định dạng file khác nhau.
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
- [x] **Tối ưu hóa Performance**: Đã đổi sang calamine và batch insert.
- [ ] **Hoàn thiện Error Handling**: Bổ sung thông báo lỗi chi tiết cho các trường hợp: file sai định dạng, thiếu cột bắt buộc, hoặc file rỗng.
- [ ] **Mở rộng Dashboard**:
    - [ ] Thêm biểu đồ cột cho xu hướng theo thời gian (Tháng/Quý/Năm).
    - [ ] Cải thiện bảng dữ liệu: Thêm tính năng ẩn/hiện cột và filter nhanh tại header bảng.

### 💡 Đang thực hiện (In Progress)
- [x] **Tối ưu hóa Performance**: Đã hoàn thành (Giai đoạn 1).

### 💡 Ý tưởng phát triển (Phase 2 & 3)
- [ ] **So sánh dữ liệu**: Tính năng so sánh YoY (Year-over-Year) hoặc QoQ (Quarter-over-Quarter).
- [ ] **AI Insights**: Sử dụng Gemini/AI để phân tích xu hướng hoặc phát hiện bất thường trong dữ liệu nhập khẩu.
- [ ] **Thông báo**: Gửi báo cáo tóm tắt qua Email hàng tuần/tháng.

---

## 📝 Ghi chú quan trọng
- **Nguồn tài liệu**: Tham khảo `inform.md` cho các yêu cầu chi tiết về UI/UX và logic backend.
- **Cấu trúc kỹ thuật**: Xem `SUMMARY.md` để biết cách vận hành và các lưu ý về mapping dữ liệu.
- **Quy trình cập nhật**: Mỗi khi hoàn thành một tính năng, hãy chuyển mục đó từ "Kế hoạch tiếp theo" lên "Việc đã hoàn thành" và ghi chú ngày tháng.
