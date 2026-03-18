# BÁO CÁO TIẾN ĐỘ 2 - DỰ ÁN RARE ITEMS BIDDING PLATFORM

- Sinh viên thực hiện: Mai Tấn Phát  
- MSSV: 2280602300  
- Thời gian báo cáo: 15/03/2026 - 18/03/2026

1. Mục tiêu tiến độ 2

Hoàn thiện thêm bản demo MVP theo hướng sát hơn với luồng sử dụng thực tế, tập trung vào:
- Bổ sung xác thực tài khoản và phân vai cơ bản.
- Kiểm soát thao tác theo vai trò người dùng trên giao diện.
- Cải thiện chất lượng giao diện web để thuận tiện demo và trình bày.
- Ổn định trang quản trị và luồng theo dõi phiên đấu giá.

2. Công việc đã làm trong đợt

1. Bổ sung module xác thực tài khoản
- Triển khai các API:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Thiết lập 3 vai trò người dùng: `ADMIN`, `SELLER`, `BIDDER`.
- Không cho phép người dùng tự đăng ký tài khoản quản trị viên.
- Bổ sung các tài khoản mẫu để phục vụ demo nhanh.

2. Hoàn thiện kiểm soát quyền thao tác
- Chỉ `BIDDER` hoặc `ADMIN` được thực hiện đặt giá.
- Chỉ `SELLER` hoặc `ADMIN` được đăng vật phẩm mới.
- Chỉ `ADMIN` được thay đổi trạng thái mở/đóng phiên đấu giá.
- Lưu thông tin đăng nhập ở phía client để duy trì phiên thao tác trong bản demo.

3. Nâng cấp giao diện web và điều hướng
- Chuẩn hóa nội dung giao diện sang tiếng Việt.
- Tổ chức lại ứng dụng thành 4 khu vực chính:
  - Trang chủ
  - Sàn đấu giá
  - Khu người bán
  - Trang quản trị
- Bổ sung modal đăng nhập/đăng ký và thông báo thao tác dạng toast.
- Điều hướng theo `hash route` để chuyển khu vực nhanh mà không cần tải lại trang.

4. Cải thiện trải nghiệm sàn đấu giá
- Thêm chức năng tìm kiếm, sắp xếp và phân trang danh sách vật phẩm.
- Hiển thị chi tiết phiên đấu giá kèm ảnh, mô tả, giá khởi điểm, giá hiện tại và trạng thái.
- Hiển thị lịch sử đặt giá theo từng vật phẩm.
- Bổ sung thống kê nhanh trên trang chủ: tổng số vật phẩm, số phiên đang mở, mức giá cao nhất hiện tại.

5. Hoàn thiện trang quản trị và dữ liệu demo
- Chuyển trang quản trị từ mức minh họa sang có thể thao tác thực tế trên dữ liệu hiện có.
- Cho phép quản trị viên đóng hoặc mở lại phiên đấu giá trực tiếp trên bảng quản trị.
- Bổ sung dữ liệu mẫu để kiểm tra các luồng người bán, người đấu giá và quản trị viên.
- Chuẩn hóa dữ liệu mặc định cho tên, mô tả, danh mục và hình ảnh khi người dùng nhập thiếu.

6. Cải thiện hiển thị ảnh và xử lý lỗi
- Bổ sung cơ chế ảnh dự phòng khi đường dẫn ảnh không hợp lệ hoặc không tải được.
- Thêm ảnh mặc định theo một số nhóm danh mục phổ biến.
- Tiếp tục duy trì validation cho đăng ký, đăng nhập, tạo vật phẩm và đặt giá.
- Chuẩn hóa thông báo lỗi nghiệp vụ như:
  - Giá đặt phải lớn hơn giá hiện tại
  - Phiên đấu giá đã đóng
  - Tài khoản đã tồn tại
  - Dữ liệu đầu vào không hợp lệ

3. Kết quả đạt được

- Bản demo hiện đã hỗ trợ luồng sử dụng rõ ràng hơn: đăng ký, đăng nhập, phân vai, đăng vật phẩm, đặt giá và quản trị phiên.
- Giao diện web trực quan hơn, phù hợp để demo trên lớp với dữ liệu mẫu, ảnh minh họa và điều hướng rõ ràng.
- Vai trò người dùng đã được tách biệt ở mức MVP, giúp hạn chế thao tác sai chức năng trên giao diện.
- Trang quản trị đã có thể can thiệp trực tiếp vào trạng thái phiên thay vì chỉ dừng ở mức mockup.

4. Khó khăn trong tuần

- Dữ liệu hiện vẫn đang lưu in-memory nên sẽ mất sau khi khởi động lại ứng dụng.
- Mật khẩu mới xử lý ở mức cơ bản, chưa mã hóa và chưa tích hợp Spring Security.
- Chưa có test tự động cho controller/service nên việc kiểm thử vẫn chủ yếu bằng thao tác thủ công.
- Một số hạng mục dự kiến từ kế hoạch tuần trước như tích hợp CSDL và mô hình repository chưa kịp triển khai trong đợt này.

5. Kế hoạch tuần 3

- Chuyển dữ liệu tài khoản, vật phẩm và lượt đặt giá sang MySQL hoặc PostgreSQL.
- Thiết kế lại mô hình `User`, `RareItem`, `Bid` theo hướng entity/repository rõ ràng hơn.
- Mã hóa mật khẩu và nâng cấp xác thực/phân quyền bằng Spring Security.
- Bổ sung test cho service/controller và chuẩn hóa dữ liệu đầu ra của API.
- Tách dữ liệu demo khỏi service để thuận tiện mở rộng và bảo trì.
