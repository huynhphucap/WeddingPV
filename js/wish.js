/* =========================================================
   WISH.JS — Tải & hiển thị toàn bộ lời chúc từ Supabase
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("wishList");
  const refreshBtn = document.getElementById("refreshBtn");
  const countEl = document.getElementById("wishCount");
  const sortTab = document.getElementById("sortTab");
  const sortValue = document.getElementById("sortValue");
  const sortDropdown = document.getElementById("sortDropdown");
  const searchInput = document.getElementById("searchInput");

  let allWishes = [];
  let sortOrder = "desc";
  let searchTerm = "";

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
    countEl.textContent = `${wishes.length} lời chúc`;
    if (!wishes.length) {
      listEl.innerHTML = '<div class="wish-empty">Không tìm thấy lời chúc nào phù hợp.</div>';
      return;
    }
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

  function applyFiltersAndRender() {
    let wishes = allWishes.slice();
    if (searchTerm) {
      wishes = wishes.filter((w) => (w.name || "").toLowerCase().includes(searchTerm));
    }
    wishes.sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return sortOrder === "asc" ? ta - tb : tb - ta;
    });
    renderWishes(wishes);
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
    allWishes = (data || []).filter((w) => w.message);
    if (!allWishes.length) {
      listEl.innerHTML = '<div class="wish-empty">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc cho đôi uyên ương!</div>';
      countEl.textContent = "0 lời chúc";
      return;
    }
    applyFiltersAndRender();
  }

  /* ---------- Tab sắp xếp ---------- */
  if (sortTab && sortDropdown) {
    sortTab.addEventListener("click", (e) => {
      e.stopPropagation();
      sortDropdown.classList.toggle("open");
    });

    sortDropdown.querySelectorAll("[data-sort]").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        sortOrder = item.getAttribute("data-sort");
        sortDropdown.querySelectorAll("[data-sort]").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        sortValue.innerHTML = `${item.textContent} <i class="fas fa-chevron-down"></i>`;
        sortDropdown.classList.remove("open");
        applyFiltersAndRender();
      });
    });

    document.addEventListener("click", () => sortDropdown.classList.remove("open"));
  }

  /* ---------- Tab tìm theo tên ---------- */
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value.trim().toLowerCase();
      applyFiltersAndRender();
    });
  }

  loadWishes();
  if (refreshBtn) refreshBtn.addEventListener("click", loadWishes);
});
