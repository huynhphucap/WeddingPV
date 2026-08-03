/* =========================================================
   CONFIG.JS — Cấu hình chung cho toàn bộ site thiệp cưới
   Xem hướng dẫn chi tiết trong SETUP.md
   ========================================================= */
window.WEDDING_CONFIG = {
  // Supabase dùng để lưu RSVP, Sổ lưu bút, và danh sách ảnh khách mời.
  // Tạo project miễn phí tại https://supabase.com, chạy supabase/schema.sql
  // trong SQL Editor, rồi lấy 2 giá trị bên dưới ở Project Settings > API.
  supabase: {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNva2J0cWhvYW1tZ2pva21qenhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDU1MTQsImV4cCI6MjEwMTMyMTUxNH0.w68JUutO4LyfQ_G_tmj_4daPaL-ASupp0ljyxWW4mD0",
  },

  // Cloudinary dùng để lưu & tối ưu ảnh khách mời tải lên (nén/resize tự động -> web load nhanh).
  // Đăng ký miễn phí tại https://cloudinary.com rồi điền 2 giá trị bên dưới.
  cloudinary: {
    cloudName: "YOUR_CLOUD_NAME",
    uploadPreset: "YOUR_UNSIGNED_UPLOAD_PRESET",
  },
};
