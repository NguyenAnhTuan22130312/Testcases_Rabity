## QA TEST PLAN - WEBSITE RABITY

Đây là tài liệu tổng quan và phân công công việc kiểm thử chất lượng (QA) cho các Module chính của website bán lẻ thời trang trẻ em Rabity.

### I. Tổng Quan Dự Án

| Mục | Chi tiết |
| :--- | :--- |
| **Dự án** | Kiểm thử Website Thương mại điện tử Rabity (Quần áo trẻ em) |
| **Mục tiêu** | Đảm bảo chất lượng, tính ổn định và trải nghiệm người dùng (UX) của các chức năng cốt lõi trước khi phát hành. |
| **Môi trường Test** | Staging/Production (Cần chỉ định rõ URL) |
| **Phiên bản tài liệu** | v1.0 |
| **Người tạo/Review** | Nguyễn Anh Tuấn (Tester) |

---

### II. Phân Công Kiểm Thử Chi Tiết (Theo Module)

Bảng dưới đây liệt kê các chức năng chính cần kiểm thử và người chịu trách nhiệm thực hiện.

#### 1. ⚙️ Quản Lý Tài Khoản (Module: Tài Khoản)

| STT | Tên Chức Năng (Việt) | Mã Function | Mô Tả Chức Năng Chính | Người Đảm Nhận |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Đăng Ký Tài Khoản | H | Tạo tài khoản mới, kiểm tra lỗi khi trùng SĐT/Email. | **trung** |
| 2 | Đổi/Quên Mật Khẩu | G | Đổi mật khẩu, và kiểm tra quy trình xác thực khi Quên Mật Khẩu. | **Quân** |
| 3 | Cập Nhật Thông Tin Cá Nhân | F | Thêm, sửa, xóa thông tin cá nhân (Tên, Email, SĐT, Ngày sinh) trên trang hồ sơ. | **QTuấn** |
| 4 | Quản Lý Yêu Thích | L | Thêm/Xóa sản phẩm vào Wishlist. | **trường** |
| 5 | Quản Lý Địa Chỉ | CC | Thêm, sửa, xóa nhiều địa chỉ giao hàng trong tài khoản. | **Huy** |

#### 2. Mua Sắm & Thanh Toán (Module: Tìm Kiếm, Giỏ Hàng, Thanh Toán)

| STT | Tên Chức Năng (Việt) | Mã Function | Mô Tả Chức Năng Chính | Người Đảm Nhận |
| :--- | :--- | :--- | :--- | :--- |
| 6 | Tìm Kiếm Sản Phẩm | A | Tìm kiếm theo từ khóa, danh mục, và kiểm tra tính năng gợi ý (suggestion). | **Hưng** |
| 7 | Lọc & Sắp Xếp | B | Lọc theo nhiều tiêu chí (Màu, Size, Loại vải) và sắp xếp kết quả. | **Quân** |
| 8 | Thêm vào Giỏ Hàng | D | Thêm sản phẩm thành công và xử lý các kịch bản giới hạn mua/hết hàng. | **Qtuan** |
| 9 | Quản Lý Giỏ Hàng | N | Cập nhật số lượng, xóa sản phẩm, và kiểm tra hiển thị hình ảnh, giá. | **ATuan** |
| 10 | Áp Dụng Khuyến Mãi | P | Áp dụng Mã giảm giá (Voucher code). | **trung** |
| 11 | Nhập TT Giao Hàng | BB | Kiểm tra tính bắt buộc và định dạng của các trường thông tin nhận hàng. | **Hưng** |
| 12 | Xem chi tiết SP  | C | Hiển thị đầy đủ thông tin, kiểm tra bảng quy đổi kích cỡ (Size Chart). | **Trường** |

#### 3. Giao Diện & Nội Dung

| STT | Tên Chức Năng (Việt) | Mã Function | Mô Tả Chức Năng Chính | Người Đảm Nhận |
| :--- | :--- | :--- | :--- | :--- |
| 12 | Điều Hướng Trang Web | M | Kiểm tra tính liên kết và hoạt động của tất cả các liên kết/banner quảng cáo. | **ATuan** |
| 13 | Đánh Giá Sản Phẩm | S | Gửi đánh giá/bình luận/xếp hạng sản phẩm và kiểm tra việc hiển thị. | **Huy** |

---

### III. Hướng Dẫn Truy Cập Tài Liệu

Tất cả các file kiểm thử (Test Cases, Test Reports) được lưu trữ tại repository này:

* **File Test Case Chi tiết:** `[Tên File Excel của bạn]`
* **Chi tiết Module ATuan (Cart/Navigation):** Xem trong tài liệu Test Case đã cam kết.

---

### IV. Hướng Dẫn Cộng Tác Git

* **Nhánh chính (Main Branch):** `main`
* **Quy tắc Commit:** Sử dụng tiền tố (`feat:`, `fix:`, `test:`, `docs:`) theo quy tắc Conventional Commits.
* **Đóng góp:** Vui lòng tạo nhánh mới từ `main` (`git checkout -b feature/tên-chức-năng`) trước khi thực hiện thay đổi.
