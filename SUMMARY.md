# 📊 Import Data Dashboard - Tổng quan dự án

## 📁 Cấu trúc thư mục
- `/backend`: Mã nguồn server (FastAPI, Python)
- `/frontend`: Mã nguồn giao diện (React, Vite, TailwindCSS)
- `inform.md`: Tài liệu hướng dẫn/yêu cầu chi tiết từ đầu dự án.

## 🚀 Công nghệ sử dụng
### Backend (Python)
- **Framework**: `FastAPI` (hiệu suất cao, tự động tạo tài liệu API).
- **Xử lý dữ liệu**: `Pandas`, `NumPy`.
- **Database**: `MongoDB` (Sử dụng `motor` cho async driver).
- **Xác thực SSL**: `certifi` (cần thiết cho kết nối MongoDB Atlas).

### Frontend (JavaScript)
- **Framework**: `React` (với Vite).
- **Styling**: `TailwindCSS`.
- **Biểu đồ**: `Recharts` (Dựa trên history và package.json).

## 🛠 Cách chạy dự án
### Backend
1. Di chuyển vào thư mục backend: `cd backend`.
2. Tạo venv và cài dependencies: `pip install -r requirements.txt`.
3. Chạy server: `uvicorn main:app --reload` (Mặc định chạy ở port 8000).

### Frontend
1. Di chuyển vào thư mục frontend: `cd frontend`.
2. Cài dependencies: `npm install`.
3. Chạy dev server: `npm run dev`.

## 💡 Lưu ý quan trọng cho AI
1. **Xử lý tham số Filter**: Frontend (Axios) thường gửi mảng dưới dạng `origins[]`, do đó trong `main.py` cần sử dụng `alias="origins[]"` trong `Query`.
2. **Data Mapping**: Class `DataProcessor` trong `processor.py` tự động ánh xạ các cột tiếng Việt/tiếng Anh không đồng nhất về các trường chuẩn như `bill_number`, `value`, `shipper`, `origins`.
3. **MongoDB**: Dữ liệu được lưu trữ theo 2 collection:
    - `files`: Lưu metadata của file được upload.
    - `records`: Lưu chi tiết các dòng dữ liệu gắn với `file_id`.
4. **Deploy**:
    - Backend: Render.com.
    - Frontend: GitHub Pages.

## 📌 Các tính năng chính
- Upload file Excel (tự động nhận diện header và sheet).
- Dashboard hiển thị KPIs (Giá trị, lô hàng, container, nhà cung cấp).
- Biểu đồ xu hướng, phân bổ xuất xứ và top nhà cung cấp.
- Lọc dữ liệu linh hoạt (Tháng, năm, nhà cung cấp, xuất xứ).
- Xuất dữ liệu đã lọc ngược lại file Excel.
