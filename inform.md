📌 Tổng quan dự án
Xây dựng một ứng dụng web dashboard hoàn chỉnh để phân tích dữ liệu nhập khẩu từ file Excel. Ứng dụng cho phép người dùng upload file, tự động xử lý và hiển thị các chỉ số KPI, biểu đồ tương tác và bảng dữ liệu chi tiết theo phong cách hiện đại như hình tham khảo.

🎯 Mục tiêu
Tự động hóa việc phân tích dữ liệu nhập khẩu thay vì xử lý thủ công bằng Excel

Cung cấp giao diện trực quan, dễ sử dụng cho người dùng không chuyên về kỹ thuật

Cho phép lọc và tương tác với dữ liệu theo thời gian thực

Xuất báo cáo dưới nhiều định dạng khác nhau

Xử lý được file Excel lớn (hàng trăm nghìn dòng) với hiệu suất cao

🏗 Kiến trúc hệ thống
Lựa chọn công nghệ
Backend: Python (FastAPI)

Lý do: Xử lý dữ liệu phức tạp, tính toán thống kê, aggregation nhanh

Framework: FastAPI (hiệu suất cao, tự động document API)

Thư viện chính: pandas, numpy, openpyxl, scipy

Frontend: React + Vite

Lý do: Tương tác mượt mà, component-based, ecosystem phong phú

Build tool: Vite (nhanh hơn CRA)

UI library: TailwindCSS + Headless UI

Charts: Recharts hoặc Apache ECharts

Temporary Storage: Redis + File system

Lưu trữ tạm dữ liệu đã upload

Cache các kết quả tính toán để tăng tốc

Luồng dữ liệu
Người dùng upload file Excel → Frontend gửi lên Backend

Backend đọc file bằng pandas → Xử lý, validate, chuẩn hóa dữ liệu

Lưu DataFrame vào Redis/bộ nhớ tạm với ID duy nhất

Frontend gọi API lấy dữ liệu dashboard với file ID

Backend tính toán KPI, biểu đồ dựa trên filters

Frontend render lại charts và bảng dữ liệu

Khi thay đổi filter → Gọi API mới → Cập nhật UI

📊 Cấu trúc dữ liệu đầu vào (File Excel mẫu)
Các cột bắt buộc
Tên cột	Kiểu dữ liệu	Mô tả	Ví dụ
order_id	String/Number	Mã đơn hàng duy nhất	PO-2024-001, IMP240115
order_date	Date	Ngày nhập khẩu	2024-01-15, 15/01/2024
supplier	String	Tên nhà cung cấp	Công ty TNHH ABC, ABC Corp
total_value	Number	Tổng giá trị lô hàng	50000, 50,000.00
Các cột khuyến nghị (tăng tính phân tích)
Tên cột	Kiểu dữ liệu	Mô tả
product_name	String	Tên sản phẩm cụ thể
product_category	String	Nhóm hàng (Điện tử, Thời trang, Nguyên liệu...)
quantity	Number	Số lượng sản phẩm
unit_price	Number	Đơn giá
currency	String	Đơn vị tiền tệ (USD, EUR, VND)
hs_code	String	Mã HS (Hệ thống hài hòa)
port_of_loading	String	Cảng xếp hàng
port_of_discharge	String	Cảng dỡ hàng
incoterm	String	Điều kiện Incoterm (FOB, CIF...)
delivery_time	Number	Thời gian vận chuyển (ngày)
Xử lý các trường hợp đặc biệt
Thiếu cột bắt buộc: Báo lỗi, yêu cầu kiểm tra file

Nhiều định dạng ngày: Tự động phát hiện và chuẩn hóa

Số có định dạng khác nhau: Xử lý cả dấu phẩy và dấu chấm

Giá trị trống: Điền giá trị mặc định hoặc bỏ qua

Trùng lặp order_id: Cảnh báo và hỏi người dùng cách xử lý

📱 Mô tả chi tiết các màn hình
1. Màn hình Upload File
Mục đích: Nhận file Excel từ người dùng và chuẩn bị dữ liệu

Thành phần:

Vùng drag & drop để kéo thả file

Nút browse để chọn file từ máy tính

Hiển thị tên file, dung lượng sau khi chọn

Nút upload và xử lý

Preview trước khi upload:

Hiển thị 5-10 dòng đầu tiên của file

Xác nhận các cột được phát hiện

Cho phép người dùng map cột nếu tên không khớp

Chọn sheet nếu file có nhiều sheet

Xử lý sau upload:

Hiển thị progress bar khi xử lý file lớn

Thông báo số dòng đã đọc thành công

Thông báo lỗi nếu có (dòng lỗi, cột thiếu)

Tự động chuyển sang Dashboard sau 2-3 giây

2. Màn hình Dashboard
Layout tổng thể:

Sidebar trái (có thể thu gọn): Menu điều hướng, bộ lọc nhanh

Header: Tiêu đề trang, thông tin file đang active, nút export

Main content: Grid layout với các component

2.1. KPI Cards (4 cards)
Card 1 - Tổng giá trị nhập khẩu:

Hiển thị số lớn, format theo tiền tệ (VND hoặc USD)

Ví dụ: 589,000,000 VND hoặc 25,000 USD

Tooltip: "Tổng giá trị tất cả các lô hàng trong kỳ"

Subtext: So sánh với tháng trước (tăng 12.5%)

Card 2 - Tổng số đơn hàng:

Hiển thị số đơn hàng unique

Ví dụ: 40,689

Tooltip: "Số lượng đơn đặt hàng duy nhất"

Subtext: Trung bình 1,356 đơn/tháng

Card 3 - Số nhà cung cấp:

Hiển thị số lượng supplier unique

Ví dụ: 10,293

Tooltip: "Tổng số nhà cung cấp đã giao dịch"

Subtext: Top 10 chiếm 45% tổng giá trị

Card 4 - Số mặt hàng:

Hiển thị số sản phẩm/phân loại unique

Ví dụ: 2,040

Tooltip: "Số lượng sản phẩm/nhóm hàng khác nhau"

Subtext: Trung bình 5.2 sản phẩm/đơn

Tương tác:

Hover vào card hiển thị thông tin chi tiết

Click vào card để filter dashboard theo chỉ số đó

Animation đếm số từ 0 lên giá trị thực

2.2. Bộ lọc (Filters)
Vị trí: Phía trên các biểu đồ hoặc trong sidebar

Các loại filter:

Filter	Kiểu	Mô tả
Khoảng thời gian	Date Range Picker	Chọn từ ngày - đến ngày, có preset (7 ngày qua, tháng này, quý này)
Nhà cung cấp	Multi-select dropdown	Chọn 1 hoặc nhiều supplier, có ô tìm kiếm
Nhóm hàng	Multi-select dropdown	Lọc theo category, hiển thị số lượng từng nhóm
Giá trị đơn hàng	Slider (min-max)	Lọc theo khoảng giá trị
Cảng nhập	Dropdown	Lọc theo cảng dỡ hàng
Tương tác:

Filter nào thay đổi → Tự động reload toàn bộ dashboard

Hiển thị số lượng filter đang active (badge)

Nút "Clear all filters" để reset

Lưu bộ lọc thành preset cho lần sau

2.3. Biểu đồ tròn - Phân bố theo nhóm hàng
Mục đích: Thể hiện tỷ trọng giá trị nhập khẩu theo từng nhóm hàng

Hiển thị:

Biểu đồ tròn với 6-8 nhóm lớn nhất

Các nhóm nhỏ gộp vào "Khác"

Hiển thị phần trăm và giá trị tuyệt đối khi hover

Legend ở bên cạnh hoặc phía dưới

Tương tác:

Click vào một phần của biểu đồ → Filter dashboard theo nhóm hàng đó

Double-click → Xóa filter

Có nút "Export chart" xuất ra PNG

Thông tin hiển thị:

Tên nhóm hàng

Tỷ lệ phần trăm

Giá trị tuyệt đối

So sánh với kỳ trước (nếu có)

2.4. Biểu đồ cột - Xu hướng theo thời gian
Mục đích: Thể hiện sự biến động giá trị nhập khẩu theo thời gian

Hiển thị:

Trục X: Tháng (Jan 2024, Feb 2024...)

Trục Y: Giá trị nhập khẩu

Có thể chuyển đổi giữa dạng cột và đường

Tooltip hiển thị giá trị và tháng

Các chế độ xem:

Theo tháng: 12 tháng gần nhất

Theo quý: 8 quý gần nhất

Theo năm: 5 năm gần nhất

So sánh: 2 năm cạnh nhau

Tương tác:

Chọn khoảng thời gian trên biểu đồ để zoom

Click vào cột để xem chi tiết tháng đó

Hover hiển thị giá trị chính xác

Nút "Toggle stacked" để xem theo nhóm hàng

2.5. Bảng dữ liệu chi tiết
Mục đích: Hiển thị danh sách các lô hàng với đầy đủ thông tin

Cấu trúc bảng:

STT	Mã đơn	Ngày nhập	Nhà cung cấp	Nhóm hàng	Sản phẩm	SL	Đơn giá	Tổng giá trị
Tính năng:

Sort: Click vào header để sort theo cột đó

Search: Ô tìm kiếm để lọc theo nội dung bất kỳ

Pagination: 10, 25, 50, 100 dòng/trang

Column visibility: Chọn hiển thị/ẩn cột

Export selected: Xuất các dòng đã chọn ra Excel

Row selection: Checkbox để chọn nhiều dòng

Conditional formatting:

Đơn hàng > 1 tỷ: highlight màu đỏ

Nhà cung cấp mới: highlight màu xanh

Tương tác:

Click vào dòng → Mở modal chi tiết

Double-click → Filter dashboard theo đơn hàng đó

Hover vào supplier → Hiển thị tooltip thông tin nhà cung cấp

2.6. Các component bổ sung
Top Suppliers:

Danh sách 10 nhà cung cấp lớn nhất

Hiển thị thanh progress bar theo giá trị

Avatar/icon cho mỗi supplier

Recent Activities:

Timeline các hoạt động gần đây

Upload file mới, xuất báo cáo, thay đổi filter

Alert/Warning:

Cảnh báo đơn hàng giá trị bất thường

Thông báo nhà cung cấp mới

Cảnh báo biến động lớn so với tháng trước

🔧 Backend xử lý dữ liệu
Các bước xử lý file Excel
Bước 1: Đọc và validate

Đọc file bằng pandas với encoding phù hợp

Kiểm tra đủ cột bắt buộc

Phát hiện và chuẩn hóa định dạng ngày tháng

Chuyển đổi kiểu dữ liệu (số, text, date)

Bước 2: Làm sạch dữ liệu

Xóa khoảng trắng đầu/cuối chuỗi

Xử lý giá trị null (điền 0 cho số, "Unknown" cho text)

Loại bỏ bản ghi trùng lặp (nếu có)

Xử lý outlier (cảnh báo nhưng không xóa)

Bước 3: Chuẩn hóa

Đồng nhất đơn vị tiền tệ (quy đổi về USD hoặc VND)

Chuẩn hóa tên nhà cung cấp (viết hoa không dấu)

Gán category mặc định nếu thiếu

Bước 4: Tính toán chỉ số

Tổng hợp KPI

Tính các metric thống kê

Phân tích chuỗi thời gian

Phát hiện xu hướng

Các API endpoint
POST /api/upload

Nhận file Excel

Trả về: fileId, số dòng, preview data

GET /api/dashboard/{fileId}

Nhận: fileId + các filter params

Trả về: KPI, biểu đồ, bảng dữ liệu

GET /api/filters/{fileId}

Trả về: danh sách suppliers, categories, ports

GET /api/stats/{fileId}

Trả về: thống kê nâng cao (growth rate, seasonality)

POST /api/export/{fileId}

Xuất dữ liệu đã lọc ra Excel/PDF

DELETE /api/data/{fileId}

Xóa dữ liệu tạm (sau 1 giờ hoặc user logout)

Xử lý file lớn ( > 100MB)
Strategy:

Đọc file theo chunk (từng 10,000 dòng)

Sử dụng background task với Celery

Hiển thị progress bar cho người dùng

Lưu intermediate results vào Redis

Tối ưu memory:

Dùng kiểu dữ liệu category cho các cột có ít unique values

Giảm precision số thập phân

Giải phóng memory sau mỗi chunk

🎨 Thiết kế giao diện chi tiết
Màu sắc
Primary palette:

Primary Blue: #3B82F6 - Nút chính, link, active state

Secondary Green: #10B981 - Success, tăng trưởng dương

Warning Amber: #F59E0B - Cảnh báo, attention

Danger Red: #EF4444 - Lỗi, giảm trưởng âm

Neutral Gray: #6B7280 - Text phụ, border

Background:

Main background: #F9FAFB (xám rất nhạt)

Card background: #FFFFFF (trắng)

Sidebar: #1F2937 (xám đậm)

Text:

Primary text: #111827 (gần đen)

Secondary text: #6B7280 (xám)

Disabled text: #9CA3AF (xám nhạt)

Khoảng cách và spacing
Container padding: 24px

Card padding: 20px

Gap giữa các card: 20px

Gap giữa các element trong card: 12px

Border radius: 8px cho card, 4px cho button

Typography
Font family chính: 'Inter', -apple-system, sans-serif

Tiêu đề trang: 24px, bold, line-height 1.3

Tiêu đề card: 16px, semibold (600), color secondary

Giá trị KPI: 32px, bold, color primary

Label chart: 12px, medium, color secondary

Text bảng: 14px, regular

Responsive design
Desktop (>1280px):

Sidebar mở rộng (260px)

KPI cards: 4 cột

Biểu đồ: 2 cột (biểu đồ tròn 6 cột, biểu đồ cột 6 cột)

Bảng: full width

Tablet (768px - 1280px):

Sidebar thu nhỏ (80px, chỉ icon)

KPI cards: 2 cột

Biểu đồ: 1 cột (xếp chồng)

Bảng: có scroll ngang

Mobile (<768px):

Sidebar ẩn, hamburger menu

KPI cards: 1 cột

Biểu đồ: 1 cột

Bảng: ẩn bớt cột, priority columns

📤 Tính năng Export
Export to Excel
Nội dung:

Sheet 1: Dữ liệu đã lọc (toàn bộ rows)

Sheet 2: Tổng hợp KPI

Sheet 3: Biểu đồ dưới dạng bảng

Sheet 4: Metadata (thời gian export, filters đã dùng)

Format:

Định dạng conditional formatting giữ nguyên

Freeze hàng đầu tiên

Auto-filter cho mỗi cột

Export to PDF
Nội dung:

Trang 1: KPI và biểu đồ chính

Trang 2-3: Bảng dữ liệu (tối đa 100 dòng)

Trang cuối: Summary và notes

Style:

Professional, clean layout

Header với logo và tiêu đề

Footer với page number và timestamp

Export to CSV
Dữ liệu thô, không format

Encoding UTF-8 với BOM

Dấu phân cách là dấu phẩy hoặc tab

🔒 Bảo mật và xử lý lỗi
Bảo mật
File upload: Validate file type, scan virus nếu cần

Dữ liệu nhạy cảm: Không lưu trữ lâu dài, tự động xóa sau 1 giờ

CORS: Chỉ cho phép các origin được cấu hình

Rate limiting: Giới hạn số request/phút

Xử lý lỗi người dùng
File không hợp lệ:

Sai định dạng: Hiển thị "Chỉ chấp nhận file .xlsx, .xls"

File rỗng: "File không có dữ liệu"

Quá lớn: "File vượt quá 100MB, vui lòng chia nhỏ"

Dữ liệu lỗi:

Thiếu cột bắt buộc: Liệt kê các cột còn thiếu

Sai định dạng ngày: Highlight dòng lỗi, đề xuất format đúng

Giá trị âm: Cảnh báo nhưng vẫn xử lý

Lỗi hệ thống:

Không thể đọc file: "Lỗi đọc file, vui lòng kiểm tra hoặc liên hệ hỗ trợ"

Timeout: "Dữ liệu quá lớn, đang xử lý trong nền, bạn sẽ nhận được email"

Mất kết nối: "Mất kết nối server, đang thử kết nối lại..."

Logging và monitoring
Log các sự kiện:

Upload file (tên file, kích thước, thời gian)

Các lỗi xảy ra (chi tiết stack trace)

Export dữ liệu (người dùng, thời gian, loại export)

Performance metrics (thời gian xử lý từng request)

Alert:

Khi có lỗi hệ thống nghiêm trọng

Khi thời gian xử lý vượt ngưỡng (>10s)

Khi có nhiều request lỗi trong 1 phút

🚀 Triển khai (Deployment)
Yêu cầu hệ thống
Minimum:

CPU: 2 cores

RAM: 4GB

Storage: 20GB

OS: Ubuntu 20.04+

Recommended:

CPU: 4 cores

RAM: 8GB

Storage: 50GB SSD

Có Redis (cho caching)

Các bước triển khai
Backend:

Cài đặt Python 3.9+, pip

Tạo virtual environment

Cài dependencies từ requirements.txt

Cấu hình environment variables

Chạy với uvicorn (production)

Setup Nginx làm reverse proxy

Cấu hình SSL với Let's Encrypt

Frontend:

Chạy npm run build

Copy dist folder lên server

Cấu hình Nginx serve static files

Enable Gzip compression

Cache static assets

Docker (khuyến nghị):

yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./uploads:/app/uploads
    environment:
      - REDIS_URL=redis://redis:6379
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
📈 Performance targets
Upload và xử lý:

File 10MB (~50,000 dòng): < 5 giây

File 50MB (~250,000 dòng): < 20 giây

File 100MB (~500,000 dòng): < 45 giây (background)

API response:

Dashboard summary (có cache): < 200ms

Dashboard summary (không cache): < 1 giây

Filter với dữ liệu lớn: < 2 giây

Export Excel: < 5 giây

Frontend:

First paint: < 1.5 giây

Time to interactive: < 3 giây

Re-render khi filter: < 500ms

Scroll bảng 10,000 dòng: 60fps

📝 User flow hoàn chỉnh
Truy cập ứng dụng → Thấy màn hình upload

Kéo thả file Excel → Xem preview 5 dòng đầu

Nhấn Upload → Xem progress bar, chờ xử lý

Tự động chuyển sang Dashboard → Thấy 4 KPI, biểu đồ mặc định

Chọn bộ lọc thời gian → Dashboard tự động cập nhật

Click vào biểu đồ tròn → Filter theo category đó

Xem bảng dữ liệu → Sort, search, phân trang

Chọn vài dòng trong bảng → Nhấn Export → Tải file Excel

Lưu bộ lọc hiện tại → Đặt tên "Quý 1 năm 2024"

Load lại preset → Dashboard áp dụng bộ lọc đã lưu

Upload file mới → Dữ liệu cũ được xóa, dashboard mới

🔄 Mở rộng trong tương lai
Phase 2 (3-6 tháng):

Kết nối database lưu trữ lịch sử (PostgreSQL)

So sánh nhiều kỳ (YoY, QoQ, MoM)

Dự báo đơn giản (linear regression, moving average)

User accounts và phân quyền

Phase 3 (6-12 tháng):

AI phát hiện bất thường (anomaly detection)

Tối ưu đơn hàng dựa trên dữ liệu lịch sử

Tự động gửi báo cáo qua email hàng tuần

Mobile app (React Native)

Phase 4 (12+ tháng):

Real-time tracking từ hãng tàu

Tích hợp ERP system

Supplier rating and scoring

Carbon footprint calculation

💡 Lưu ý khi implement
Ưu tiên trải nghiệm người dùng: Loading states, error messages rõ ràng

Test với dữ liệu thật: Ít nhất 3 file khác nhau về cấu trúc

Document API bằng Swagger/OpenAPI (FastAPI tự động)

Code splitting cho frontend để tối ưu bundle size

Lưu ý về memory leak khi xử lý file lớn

Có fallback khi Redis không hoạt động

Log chi tiết để dễ debug sau này

