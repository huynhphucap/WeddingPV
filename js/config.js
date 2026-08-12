/* =========================================================
   CONFIG.JS — Cấu hình chung cho toàn bộ site thiệp cưới
   Xem hướng dẫn chi tiết trong SETUP.md
   ========================================================= */
window.WEDDING_CONFIG = {
  // Supabase dùng để lưu RSVP, Sổ lưu bút, và danh sách ảnh khách mời.
  // Tạo project miễn phí tại https://supabase.com, chạy supabase/schema.sql
  // trong SQL Editor, rồi lấy 2 giá trị bên dưới ở Project Settings > API.
  supabase: {
    url: "https://xokytyikohrjeeshxwve.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhva3l0eWlrb2hyamVlc2h4d3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0OTgwNjEsImV4cCI6MjEwMjA3NDA2MX0.qVSKao62t4HYSz_H0MEHCycecDNMMAMcTmUfPvsYx3s",
  },

  // Cloudinary dùng để lưu & tối ưu ảnh khách mời tải lên (nén/resize tự động -> web load nhanh).
  // Đăng ký miễn phí tại https://cloudinary.com rồi điền 2 giá trị bên dưới.
  cloudinary: {
    cloudName: "gexc6yxu",
    uploadPreset: "upload_moment_in_time_image",
  },
};
