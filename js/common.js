/* =========================================================
   COMMON.JS — Logic dùng chung cho mọi trang của thiệp cưới
   (menu, nhạc nền, trái tim bay, modal, lazy-load ảnh, hiệu ứng 3D)
   ========================================================= */

/* ---------- Menu mobile ---------- */
function toggleMenu() {
  const nav = document.getElementById("navbar");
  if (nav) nav.classList.toggle("open");
}

/* ---------- Nhạc nền ---------- */
function initMusic() {
  const musicToggle = document.getElementById("musicToggle");
  const bgMusic = document.getElementById("bgMusic");
  if (!musicToggle || !bgMusic) return;

  const setLabel = (playing) => {
    musicToggle.innerHTML = playing
      ? '<i class="fas fa-volume-up"></i> | Tắt nhạc'
      : '<i class="fas fa-volume-mute"></i> | Bật nhạc';
  };

  bgMusic
    .play()
    .then(() => setLabel(true))
    .catch(() => setLabel(false));

  musicToggle.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic
        .play()
        .then(() => setLabel(true))
        .catch((err) => console.error("Lỗi khi phát nhạc:", err));
    } else {
      bgMusic.pause();
      setLabel(false);
    }
  });
}

/* ---------- Trái tim bay nhẹ nhàng ---------- */
function initFloatingHearts(count = 18) {
  const svgHeart =
    '<svg viewBox="0 0 32 29.6" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,16,21.2,16,21.2s16-11.8,16-21.2 C32,3.8,28.2,0,23.6,0z"/></svg>';
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = svgHeart;
    heart.style.left = Math.random() * 100 + "%";
    heart.style.top = Math.random() * 100 + "%";
    heart.style.width = heart.style.height = 10 + Math.random() * 14 + "px";
    heart.style.animation = `floatHeart ${4 + Math.random() * 4}s ease-in-out infinite`;
    heart.style.animationDelay = Math.random() * 6 + "s";
    frag.appendChild(heart);
  }
  document.body.appendChild(frag);
}

/* ---------- Modal (đóng khi bấm X hoặc click nền) ---------- */
function initModals() {
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("active");
    });
    const closeBtn = overlay.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => overlay.classList.remove("active"));
    }
  });
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("active");
}

/* ---------- Lazy-load ảnh: chỉ tải khi lướt gần tới, có hiệu ứng mờ->nét ----------
   Dùng: <span class="lazy-img-wrap"><img class="lazy-img" data-src="..." alt="..."></span>
   Ảnh lỗi (file chưa tồn tại) sẽ tự thay bằng khung placeholder duyên dáng thay vì icon vỡ. */
function initLazyImages(root = document) {
  const targets = root.querySelectorAll("img.lazy-img[data-src]");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(loadLazyImage);
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadLazyImage(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px 0px", threshold: 0.01 }
  );
  targets.forEach((img) => observer.observe(img));
}

function loadLazyImage(img) {
  const src = img.getAttribute("data-src");
  if (!src) return;
  const wrap = img.closest(".lazy-img-wrap");

  img.addEventListener(
    "load",
    () => {
      img.classList.add("loaded");
      if (wrap) wrap.classList.add("loaded");
    },
    { once: true }
  );

  img.addEventListener(
    "error",
    () => {
      const fallback = document.createElement("div");
      fallback.className = "img-fallback";
      const label = document.createElement("span");
      label.textContent = img.alt || "Ảnh sẽ sớm được cập nhật";
      fallback.appendChild(label);
      if (wrap) {
        // wrap luôn có kích thước cố định (aspect-ratio / width+height qua CSS)
        // và position:relative, nên phủ kín 100% là an toàn.
        fallback.style.position = "absolute";
        fallback.style.inset = "0";
        wrap.classList.add("loaded");
        wrap.appendChild(fallback);
        img.style.opacity = "0";
      } else {
        // Không có wrap bọc ngoài -> tuyệt đối KHÔNG dùng position:absolute
        // (sẽ trồi lên bám theo ancestor position gần nhất, có thể phủ kín
        // cả header). Giữ nguyên trong luồng, tự co theo kích thước ảnh gốc.
        if (img.width) fallback.style.width = img.width + "px";
        if (img.height) fallback.style.height = img.height + "px";
        img.replaceWith(fallback);
      }
    },
    { once: true }
  );

  img.src = src;
  img.removeAttribute("data-src");
}

/* ---------- Lazy-load ảnh nền CSS (background-image) khi lướt tới ----------
   Dùng: <section data-bg-src="img/xxx.jpg" class="hero"> */
function initLazyBackgrounds(root = document) {
  const targets = root.querySelectorAll("[data-bg-src]");
  const load = (el) => {
    const src = el.getAttribute("data-bg-src");
    if (!src) return;
    const preloader = new Image();
    preloader.onload = () => {
      el.style.backgroundImage = `url("${src}")`;
      el.classList.add("bg-loaded");
    };
    preloader.onerror = () => {
      // Giữ nguyên nền gradient mặc định nếu ảnh chưa tồn tại
      el.classList.add("bg-loaded");
    };
    preloader.src = src;
    el.removeAttribute("data-bg-src");
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(load);
    return;
  }
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          load(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "250px 0px", threshold: 0.01 }
  );
  targets.forEach((el) => observer.observe(el));
}

/* ---------- Hiệu ứng 3D tilt khi hover (thẻ ảnh, card...) ---------- */
function initTilt3D(selector = ".tilt-3d", intensity = 10) {
  const els = document.querySelectorAll(selector);
  els.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * intensity * 2;
      const rotateX = (0.5 - (y / rect.height)) * intensity * 2;
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
    });
  });
}

/* ---------- Reveal khi cuộn (.animate-on-scroll) ---------- */
function initScrollReveal() {
  const els = document.querySelectorAll(".animate-on-scroll");
  if (!els.length) return;
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  els.forEach((el) => observer.observe(el));
}

/* ---------- Cuộn mượt tới section (nút có data-scroll) ---------- */
function initScrollButtons() {
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

/* ---------- Nhóm nút nổi (RSVP / Lời chúc) ---------- */
function initFloatingButtonGroup() {
  const btnItems = document.querySelector(".floating-btn-items");
  const toggleBtn = document.getElementById("toggleBtn");
  if (!btnItems || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = btnItems.classList.toggle("open");
    btnItems.style.display = isOpen ? "flex" : "none";
    toggleBtn.innerHTML = isOpen
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });
}

/* ---------- Khởi tạo mặc định cho mọi trang ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initMusic();
  initFloatingHearts();
  initModals();
  initLazyImages();
  initLazyBackgrounds();
  initTilt3D();
  initScrollReveal();
  initScrollButtons();
  initFloatingButtonGroup();
});
