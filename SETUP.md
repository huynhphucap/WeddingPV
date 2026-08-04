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
supabase/schema.sql   Script tạo bảng + phân quyền cho Supabase (RSVP, Sổ lưu bút, Album)
```

Nếu chưa có ảnh thật, trang vẫn chạy bình thường — chỗ nào chưa có ảnh sẽ tự hiện khung placeholder
nhẹ nhàng thay vì icon ảnh vỡ. Bạn có thể thêm ảnh thật bất cứ lúc nào, chỉ cần đặt đúng tên file.

## 2. Thêm ảnh thật của bạn

Đặt file vào thư mục `img/` với đúng tên đang được tham chiếu trong `index.html`:

| Vị trí                    | Tên file cần dùng      |
| -------------------------- | ----------------------- |
| Logo header / ảnh nền Save the Date & Hero (đã gộp chung 1 section, dùng chung 1 ảnh) | `img/couple4.jpg` |
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

## 3. Bật tính năng RSVP / Sổ lưu bút / Album (Supabase)

Trang dùng [Supabase](https://supabase.com) (Postgres, có gói miễn phí) làm database cho cả 3 tính
năng: RSVP, sổ lưu bút, và danh sách ảnh khách mời (file ảnh vẫn lưu ở Cloudinary — xem mục 4 — chỉ
có URL ảnh + tên người gửi được lưu trong Supabase).

1. Đăng ký / đăng nhập tại https://supabase.com, bấm **New project** (chọn tổ chức, đặt tên, tạo
   mật khẩu database, chọn region gần Việt Nam nhất, ví dụ Singapore).
2. Sau khi project khởi tạo xong, vào **SQL Editor > New query**, dán toàn bộ nội dung file
   [`supabase/schema.sql`](supabase/schema.sql) vào rồi bấm **Run**. Lệnh này tạo 3 bảng
   `rsvp`, `wishes`, `photos` và thiết lập phân quyền (Row Level Security) phù hợp:
   - Ai cũng gửi được RSVP / lời chúc / ảnh (INSERT công khai).
   - Lời chúc và ảnh hiển thị công khai cho mọi người xem (SELECT công khai).
   - Danh sách RSVP **không** cho đọc công khai (giữ riêng tư thông tin khách mời) — bạn xem trong
     **Table Editor** của Supabase.
3. Vào **Project Settings (biểu tượng bánh răng) > API**, copy 2 giá trị:
   - **Project URL** (dạng `https://xxxxx.supabase.co`)
   - **anon public** key (chuỗi dài, an toàn để đưa vào code phía trình duyệt vì đã có Row Level
     Security chặn ở bước 2 — **không dùng** khoá `service_role`)
4. Mở `js/config.js`, điền vào:
   ```js
   supabase: {
     url: "https://xxxxx.supabase.co",
     anonKey: "eyJhbnJ...",
   },
   ```

Muốn xem lại danh sách khách đã xác nhận tham dự, lời chúc, hay ảnh đã gửi: vào Supabase Dashboard >
**Table Editor**, chọn bảng tương ứng.

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
