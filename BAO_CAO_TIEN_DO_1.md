# BAO CAO TIEN DO 1 - Rare Items Bidding Platform

- Sinh vien: Mai Tan Phat
- MSSV: 2280602300
- Mon hoc: COS141 - Application Development using J2EE
- Tuan bao cao: 08/03/2026 - 14/03/2026

## 1. Muc tieu tuan 1

Xay dung bo khung backend cho de tai "He thong dau gia do suu tam" bang Spring Boot de co the demo duoc cac chuc nang cot loi dau tien.

## 2. Cong viec da lam trong tuan

1. Khoi tao va chuan hoa cau truc du an Spring Boot
- Kiem tra cau truc Maven, package, source va test.
- Cap nhat README mo ta ro pham vi tien do 1.

2. Xay dung API cot loi cho dau gia (ban dau)
- Tao endpoint `GET /welcome`.
- Tao nhom endpoint cho item va bid:
  - `GET /api/items`
  - `GET /api/items/{itemId}`
  - `POST /api/items`
  - `GET /api/items/{itemId}/bids`
  - `POST /api/items/{itemId}/bids`

3. Viet business logic cho phien dau gia
- Tao service xu ly tao vat pham, danh sach vat pham, dat gia.
- Dat quy tac: gia dat moi phai lon hon gia hien tai.
- Khoi tao du lieu mau de demo nhanh.

4. Bo sung validation va xu ly loi
- Validate du lieu dau vao cho tao item/dat gia.
- Bo sung xu ly loi tap trung (404, 400, 500) va tra JSON thong nhat.

5. Viet test co ban
- Them test cho service de kiem tra:
  - Tao item thanh cong.
  - Dat gia hop le.
  - Tu choi gia khong hop le.
  - Bao loi khi item khong ton tai.

## 3. Danh sach source code moi trong tuan

- `src/main/java/com/maitanphat/rareitems/controller/AuctionController.java`
- `src/main/java/com/maitanphat/rareitems/service/AuctionService.java`
- `src/main/java/com/maitanphat/rareitems/model/AuctionStatus.java`
- `src/main/java/com/maitanphat/rareitems/model/RareItem.java`
- `src/main/java/com/maitanphat/rareitems/model/Bid.java`
- `src/main/java/com/maitanphat/rareitems/dto/CreateItemRequest.java`
- `src/main/java/com/maitanphat/rareitems/dto/PlaceBidRequest.java`
- `src/main/java/com/maitanphat/rareitems/exception/ApiError.java`
- `src/main/java/com/maitanphat/rareitems/exception/BusinessRuleException.java`
- `src/main/java/com/maitanphat/rareitems/exception/ResourceNotFoundException.java`
- `src/main/java/com/maitanphat/rareitems/exception/GlobalExceptionHandler.java`
- `src/test/java/com/maitanphat/rareitems/service/AuctionServiceTest.java`

## 4. Ket qua dat duoc

- Du an da co backend API cot loi de demo chuc nang dau gia co ban.
- Co the gui source code len GitHub theo yeu cau "source code moi da duoc commit".

## 5. Ke hoach tuan 2

- Tich hop CSDL (MySQL/PostgreSQL) thay cho in-memory.
- Them bang User va Item theo quan he du lieu thuc te.
- Bat dau xay dung chuc nang dang ky/dang nhap co ban.
