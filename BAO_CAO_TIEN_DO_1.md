# BÁO CÁO TIẾN ĐỘ 1 - DỰ ÁN RARE ITEMS BIDDING PLATFORM

- Sinh viên thực hiện: Mai Tấn Phát  
- MSSV: 2280602300  
- Thời gian báo cáo: 08/03/2026 - 14/03/2026

## 1. Mục tiêu tuần 1

Hoàn thiện phiên bản MVP đầu tiên của hệ thống đấu giá đồ sưu tầm, bao gồm:
- Khung backend chạy ổn định.
- API cốt lõi để quản lý vật phẩm và đặt giá.
- Giao diện web demo được các luồng chính (xem vật phẩm, đặt giá, đăng vật phẩm, quản trị phiên).

## 2. Công việc đã làm trong tuần

1. Khởi tạo và chuẩn hóa dự án Spring Boot
- Tổ chức lại cấu trúc package theo mô hình controller/service/dto/model/exception.
- Thiết lập Maven và kiểm tra khả năng build, chạy ứng dụng.

2. Xây dựng API cốt lõi cho đấu giá
- Triển khai các API:
  - `GET /welcome`
  - `GET /api/items`
  - `GET /api/items/{itemId}`
  - `POST /api/items`
  - `GET /api/items/{itemId}/bids`
  - `POST /api/items/{itemId}/bids`
  - `PATCH /api/items/{itemId}/status`

3. Xử lý nghiệp vụ chính
- Tạo vật phẩm đấu giá mới.
- Đặt giá theo quy tắc: giá mới phải lớn hơn giá hiện tại.
- Quản lý trạng thái phiên: mở/đóng.
- Bổ sung dữ liệu mẫu để demo nhanh.

4. Bổ sung xác thực tài khoản cơ bản
- Đăng ký, đăng nhập tài khoản cho 2 vai trò: Người bán và Người đấu giá.
- Không cho phép tự đăng ký tài khoản Quản trị viên.
- Lưu phiên đăng nhập phía client để thao tác theo vai trò.

5. Xây dựng và chỉnh sửa giao diện web
- Thiết kế lại giao diện theo 4 khu vực:
  - Trang chủ
  - Sàn đấu giá
  - Khu người bán
  - Trang quản trị
- Thêm phân trang danh sách vật phẩm.
- Thêm hiển thị ảnh sản phẩm và cơ chế ảnh dự phòng khi link ảnh lỗi.
- Cải thiện màu sắc, độ tương phản chữ và trải nghiệm sử dụng.

6. Xử lý validation và lỗi
- Thêm kiểm tra dữ liệu đầu vào cho đăng ký, đăng nhập, tạo vật phẩm, đặt giá.
- Chuẩn hóa thông báo lỗi theo ngữ cảnh nghiệp vụ.

## 3. Kết quả đạt được

- Ứng dụng chạy được end-to-end cho luồng demo tuần 1.
- Người dùng có thể:
  - Xem danh sách vật phẩm đấu giá.
  - Xem chi tiết và lịch sử đặt giá.
  - Đặt giá theo điều kiện hợp lệ.
  - Đăng vật phẩm mới (vai trò người bán).
  - Quản lý trạng thái phiên (vai trò quản trị).
- Source code đã sẵn sàng để commit lên GitHub repo theo yêu cầu.

## 4. Khó khăn trong tuần

- Cần cân bằng giữa tiến độ backend và mức độ hoàn thiện giao diện trong cùng tuần.
- Một số link ảnh ngoài không ổn định, phải bổ sung cơ chế fallback để tránh lỗi hiển thị.

## 5. Kế hoạch tuần 2

- Chuyển dữ liệu từ in-memory sang cơ sở dữ liệu (MySQL/PostgreSQL).
- Hoàn thiện mô hình User/Item/Bid theo quan hệ dữ liệu thực tế.
- Tăng cường bảo mật đăng nhập (mã hóa mật khẩu, phân quyền chặt hơn).
- Bổ sung test cho controller/service và chuẩn hóa dữ liệu đầu ra API.
