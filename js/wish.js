/* =========================================================
   WISH.JS — Tải & hiển thị toàn bộ lời chúc từ Supabase
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("wishList");
  const refreshBtn = document.getElementById("refreshBtn");
  const countEl = document.getElementById("wishCount");

  function initials(name) {
    if (!name) return "?";
    return name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function renderWishes(wishes) {
    if (!wishes.length) {
      listEl.innerHTML = '<div class="wish-empty">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc cho đôi uyên ương!</div>';
      countEl.textContent = "";
      return;
    }
    countEl.textContent = `${wishes.length} lời chúc`;
    listEl.innerHTML = wishes
      .map(
        (w, i) => `
        <div class="wish-card" style="animation-delay:${Math.min(i * 0.05, 0.6)}s">
          <div class="wish-card-header">
            <div class="wish-avatar">${initials(w.name)}</div>
            <div>
              <div class="wish-name">${escapeHtml(w.name || "Ẩn danh")}</div>
              <div class="wish-time">${formatTime(w.created_at)}</div>
            </div>
          </div>
          <div class="wish-message">${escapeHtml(w.message)}</div>
        </div>`
      )
      .join("");
  }

  async function loadWishes() {
    listEl.innerHTML = '<div class="wish-loading"><i class="fas fa-spinner"></i><div>Đang tải lời chúc...</div></div>';
    if (!window.sb) {
      listEl.innerHTML =
        '<div class="wish-error">Chưa cấu hình Supabase. Xem SETUP.md để bật tính năng sổ lưu bút.</div>';
      return;
    }
    const { data, error } = await window.sb
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Lỗi tải lời chúc:", error);
      listEl.innerHTML =
        '<div class="wish-error">Không tải được lời chúc lúc này. Vui lòng thử lại sau, hoặc kiểm tra lại cấu hình Supabase (xem SETUP.md).</div>';
      return;
    }
    renderWishes((data || []).filter((w) => w.message));
  }

  loadWishes();
  if (refreshBtn) refreshBtn.addEventListener("click", loadWishes);
});
