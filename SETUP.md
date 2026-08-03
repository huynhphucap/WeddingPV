# Hướng dẫn cài đặt thiệp cưới

Trang web gồm 3 trang: `index.html` (thiệp chính), `album.html` (album ảnh + khách mời tải ảnh lên),
`wish.html` (xem toàn bộ lời chúc). Đây là site tĩnh (HTML/CSS/JS thuần), không cần server riêng —
có thể host miễn phí trên GitHub Pages, Netlify, Vercel...

## 1. Cấu trúc thư mục

```
index.html            Trang thiệp chính
album.html             Album ảnh cưới + form khách mời tải ảnh
wish.html               Trang xem toàn bộ lời chúc
css/                        base.css (dùng chung), home.css, album.css, wish.css
js/                          config.js (điền cấu hình ở đây), common.js, home.js, album.js, wish.js
img/                       Ảnh của bạn (logo, ảnh cưới, QR chuyển khoản...)
img/album/           Ảnh cưới cho mục "Album ảnh cưới của Phúc & Vy"
music/                  Nhạc nền (NgayDauTien.mp3)
google-apps-script/Code.gs   Backend Google Apps Script (RSVP, Sổ lưu bút, Album)
```

Nếu chưa có ảnh thật, trang vẫn chạy bình thường — chỗ nào chưa có ảnh sẽ tự hiện khung placeholder
nhẹ nhàng thay vì icon ảnh vỡ. Bạn có thể thêm ảnh thật bất cứ lúc nào, chỉ cần đặt đúng tên file.

## 2. Thêm ảnh thật của bạn

Đặt file vào thư mục `img/` với đúng tên đang được tham chiếu trong `index.html`:

| Vị trí                    | Tên file cần dùng      |
| -------------------------- | ----------------------- |
| Logo header / ảnh nền Save the Date & Hero | `img/couple4.jpg`, `img/couple1.jpg` |
| Ảnh cô dâu / chú rể         | `img/per22.jpg`, `img/per8.jpg` |
| Ảnh cặp đôi ở mục RSVP      | `img/Hinh-pvv.jpg` (lưu ý: không dấu cách trong tên file) |
| Icon sổ lưu bút             | `img/luu-so.jpg` |
| QR chuyển khoản mừng cưới    | `img/qr-ck.jpg` |
| Nhạc nền                    | `music/NgayDauTien.mp3` |

**Mẹo tối ưu:** nén ảnh trước khi tải lên (dùng [squoosh.app](https://squoosh.app) hoặc TinyPNG),
ưu tiên định dạng `.webp`, chiều rộng ảnh không cần quá 1600px cho ảnh lớn nhất. Trang đã có sẵn
cơ chế lazy-load (chỉ tải ảnh khi lướt tới) nhưng ảnh gốc càng nhẹ thì trang càng mượt.

### Album ảnh cưới (`album.html`)

Thả ảnh vào `img/album/01.jpg` … `img/album/10.jpg` (hoặc đổi danh sách trong
`js/album.js`, biến `CURATED_PHOTOS`, để dùng tên file / chú thích khác, thêm hoặc bớt ảnh tùy ý).

## 3. Bật tính năng RSVP / Sổ lưu bút / Album (Google Apps Script)

Trang đang dùng chung 1 Google Apps Script Web App cho cả 3 tính năng. Nếu bạn đã có sẵn Apps Script
cho RSVP/Sổ lưu bút, hãy cập nhật nó theo file `google-apps-script/Code.gs` (script mới hỗ trợ thêm
đọc danh sách lời chúc & ảnh khách mời) — hoặc tạo mới theo các bước sau:

1. Tạo một Google Sheet mới (trống).
2. Vào **Extensions (Tiện ích mở rộng) > Apps Script**.
3. Xoá code mẫu, dán toàn bộ nội dung file [`google-apps-script/Code.gs`](google-apps-script/Code.gs) vào.
4. Bấm **Deploy > New deployment**, chọn loại **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Bấm **Deploy**, copy URL Web App (dạng `https://script.google.com/macros/s/xxx/exec`).
6. Mở `js/config.js`, dán URL đó vào `scriptURL`.

Script sẽ tự tạo 3 sheet con `RSVP`, `Wishes`, `Photos` khi có dữ liệu đầu tiên gửi lên — không cần
tạo tay.

## 4. Bật tính năng khách mời tải ảnh lên (Cloudinary)

Vì đây là site tĩnh, ảnh khách mời tải lên cần được lưu ở một dịch vụ lưu trữ ảnh. Trang dùng
[Cloudinary](https://cloudinary.com) (miễn phí, không cần thẻ) vì tự động nén/resize ảnh giúp
trang luôn tải nhanh.

1. Đăng ký tài khoản miễn phí tại https://cloudinary.com
2. Vào **Dashboard**, ghi lại giá trị **Cloud name**.
3. Vào **Settings > Upload**, mục **Upload presets**, bấm **Add upload preset**:
   - Signing Mode: **Unsigned**
   - (tuỳ chọn) Đặt Folder mặc định hoặc giới hạn kích thước file
   - Lưu lại và ghi tên preset vừa tạo.
4. Mở `js/config.js`, điền vào:
   ```js
   cloudinary: {
     cloudName: "ten-cloud-cua-ban",
     uploadPreset: "ten-preset-cua-ban",
   },
   ```

Cho tới khi cấu hình xong, trang Album vẫn hiển thị bình thường — chỉ khu vực tải ảnh lên sẽ hiện
thông báo nhắc chủ trang cấu hình, khách xem ảnh vẫn không bị ảnh hưởng.

## 5. Chạy thử ở máy local

Vì có gọi `fetch()`, cần mở bằng một server nhỏ thay vì mở trực tiếp file:

```bash
cd WeddingPV
python3 -m http.server 8080
# rồi mở http://localhost:8080
```

## 6. Ghi chú hiệu ứng đã tích hợp

- **Lazy-load ảnh khi cuộn**: ảnh chỉ được tải khi sắp lọt vào khung nhìn (dùng
  `IntersectionObserver`), có hiệu ứng mờ dần → rõ nét, giúp trang tải nhanh ngay từ lần đầu dù
  album có nhiều ảnh nặng.
- **Hiệu ứng 3D khi hover**: thẻ ảnh cô dâu/chú rể và ảnh trong album nghiêng nhẹ theo vị trí con
  trỏ chuột (perspective tilt), tạo cảm giác chiều sâu.
- **Reveal khi cuộn**: các section mờ dần trồi lên khi cuộn tới.
- Toàn bộ theme màu nằm trong biến CSS ở đầu file `css/base.css` (`:root { --clr-primary: ...; }`)
  — muốn đổi tone màu chỉ cần sửa ở một chỗ này.
