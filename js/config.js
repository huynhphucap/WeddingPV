/* =========================================================
   CONFIG.JS — Cấu hình chung cho toàn bộ site thiệp cưới
   Xem hướng dẫn chi tiết trong SETUP.md
   ========================================================= */
window.WEDDING_CONFIG = {
  // URL Web App của Google Apps Script (dùng chung cho RSVP, Sổ lưu bút, Album ảnh khách mời).
  // Đây là URL đang được dùng sẵn cho form RSVP/Sổ lưu bút.
  // Muốn trang Album & trang "Xem tất cả lời chúc" hoạt động, hãy cập nhật
  // Apps Script của bạn theo file google-apps-script/Code.gs rồi deploy lại.
  scriptURL:
    "https://script.google.com/macros/s/AKfycbwARwmk5Mww4ja6tduJBwKzX8xMdQxK2f0An4aBr19-6JOhqPexe-fhsycRSduc65jiNQ/exec",

  // Cloudinary dùng để lưu & tối ưu ảnh khách mời tải lên (nén/resize tự động -> web load nhanh).
  // Đăng ký miễn phí tại https://cloudinary.com rồi điền 2 giá trị bên dưới.
  cloudinary: {
    cloudName: "YOUR_CLOUD_NAME",
    uploadPreset: "YOUR_UNSIGNED_UPLOAD_PRESET",
  },
};
