/* =========================================================
   HOME.JS — Logic riêng cho trang chủ (index.html)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.WEDDING_CONFIG || {};

  /* ---------- Reveal cho card cô dâu / chú rể ---------- */
  const cards = document.querySelectorAll(".card");
  if (cards.length) {
    const cardObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    cards.forEach((card) => cardObserver.observe(card));
  }

  /* ---------- Đếm ngược ngày cưới ---------- */
  const weddingDate = new Date("2025-10-12T00:00:00").getTime();
  const $days = document.getElementById("days");
  const $hours = document.getElementById("hours");
  const $minutes = document.getElementById("minutes");
  const $seconds = document.getElementById("seconds");

  function updateCountdown() {
    const distance = weddingDate - Date.now();
    if (!$days) return;
    if (distance < 0) {
      [$days, $hours, $minutes, $seconds].forEach((el) => (el.textContent = "0"));
      return;
    }
    $days.textContent = Math.floor(distance / 86400000);
    $hours.textContent = Math.floor((distance % 86400000) / 3600000);
    $minutes.textContent = Math.floor((distance % 3600000) / 60000);
    $seconds.textContent = Math.floor((distance % 60000) / 1000);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- RSVP ---------- */
  const rsvpForm = document.getElementById("rsvpNewForm");
  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      openModal("sendingModal");
      fetch(cfg.scriptURL, { method: "POST", body: new FormData(rsvpForm) })
        .then(() => {
          closeModal("sendingModal");
          openModal("rsvpModal");
          rsvpForm.reset();
        })
        .catch((error) => {
          closeModal("sendingModal");
          console.error("Lỗi RSVP:", error);
          alert("Đã xảy ra lỗi khi gửi xác nhận tham dự. Vui lòng thử lại!");
        });
    });
  }

  /* ---------- Sổ lưu bút ---------- */
  const guestbookForm = document.getElementById("guestbookForm");
  if (guestbookForm) {
    guestbookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      openModal("sendingModal");
      fetch(cfg.scriptURL, { method: "POST", body: new FormData(guestbookForm) })
        .then(() => {
          closeModal("sendingModal");
          openModal("thankModal");
          guestbookForm.reset();
        })
        .catch((error) => {
          closeModal("sendingModal");
          console.error("Lỗi gửi lời chúc:", error);
          alert("Đã xảy ra lỗi khi gửi lời chúc. Vui lòng thử lại!");
        });
    });
  }

  /* ---------- Gợi ý lời chúc ---------- */
  const autoWishes = [
    "Chúc hai bạn trăm năm hạnh phúc!",
    "Mong hai bạn sớm có tin vui!",
    "Chúc gia đình nhỏ luôn tràn ngập tiếng cười.",
    "Chúc đôi uyên ương một đời viên mãn.",
    "Chúc tình yêu của hai bạn ngày càng bền chặt!",
    "Chúc mừng cặp đôi đẹp đẽ này có một tương lai tràn đầy hạnh phúc.",
    "Chúc mừng đám cưới! Mong rằng tình yêu của hai bạn sẽ luôn bền vững và trường tồn trong mọi thử thách.",
    "Chúc hai bạn luôn thấu hiểu, yêu thương và đồng hành cùng nhau thật lâu dài.",
    "Chúc cặp đôi một hành trình mới tràn đầy niềm vui, sự đồng thuận và hạnh phúc vĩnh cửu.",
    "Chúc mừng hạnh phúc! Chúc hai bạn viên mãn bên nhau đến đầu bạc răng long.",
  ];

  const suggestionBox = document.getElementById("suggestionBox");
  const wishTextarea = document.getElementById("wishMessage");
  const emojiPicker = document.getElementById("emojiPicker");

  window.showAutoWishes = function () {
    if (!suggestionBox) return;
    if (suggestionBox.style.display === "block") {
      suggestionBox.style.display = "none";
      return;
    }
    suggestionBox.innerHTML =
      "<ul>" +
      autoWishes.map((wish) => `<li data-wish="${wish.replace(/"/g, "&quot;")}">${wish}</li>`).join("") +
      "</ul>";
    suggestionBox.style.display = "block";
    suggestionBox.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        if (wishTextarea) wishTextarea.value = li.getAttribute("data-wish");
        suggestionBox.style.display = "none";
      });
    });
  };

  window.showEmojiPicker = function () {
    if (!emojiPicker) return;
    emojiPicker.style.display = emojiPicker.style.display === "block" ? "none" : "block";
  };

  if (emojiPicker) {
    emojiPicker.querySelectorAll(".emoji").forEach((span) => {
      span.addEventListener("click", () => {
        if (wishTextarea) wishTextarea.value = (wishTextarea.value.trim() + " " + span.textContent).trim();
        emojiPicker.style.display = "none";
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (
      emojiPicker &&
      emojiPicker.style.display === "block" &&
      !emojiPicker.contains(event.target) &&
      !event.target.classList.contains("icon-emoji")
    ) {
      emojiPicker.style.display = "none";
    }
    if (
      suggestionBox &&
      suggestionBox.style.display === "block" &&
      !suggestionBox.contains(event.target) &&
      !event.target.classList.contains("icon-bulb")
    ) {
      suggestionBox.style.display = "none";
    }
  });

  /* ---------- Mừng cưới (chuyển khoản) ---------- */
  const giftBtn = document.querySelector(".gift-btn");
  if (giftBtn) {
    giftBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("transferModal");
    });
  }

  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const accountText = document.getElementById("accountNumber").textContent;
      const done = () => openModal("copyModal");
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(accountText).then(done).catch(() => alert("Copy thất bại, vui lòng thử lại!"));
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = accountText;
        textArea.style.position = "fixed";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          done();
        } catch (err) {
          alert("Copy thất bại, vui lòng thử lại!");
        }
        document.body.removeChild(textArea);
      }
    });
  }
});
