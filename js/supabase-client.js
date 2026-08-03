/* =========================================================
   SUPABASE-CLIENT.JS — Khởi tạo Supabase client dùng chung
   Yêu cầu SDK Supabase (CDN) được load trước file này.
   ========================================================= */
window.sb = (function () {
  const cfg = (window.WEDDING_CONFIG && window.WEDDING_CONFIG.supabase) || {};
  const isConfigured =
    cfg.url && !cfg.url.includes("YOUR_") && cfg.anonKey && !cfg.anonKey.includes("YOUR_");

  if (!isConfigured) {
    console.warn("Supabase chưa được cấu hình — xem SETUP.md để bật RSVP/Sổ lưu bút/Album.");
    return null;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.warn("Không tải được Supabase SDK (kiểm tra kết nối mạng / CDN).");
    return null;
  }
  return window.supabase.createClient(cfg.url, cfg.anonKey);
})();

window.isSupabaseConfigured = !!window.sb;
