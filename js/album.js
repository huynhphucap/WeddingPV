/* =========================================================
   ALBUM.JS — Gallery ảnh cưới + upload ảnh khách mời (Cloudinary)
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.WEDDING_CONFIG || {};
  const cloud = cfg.cloudinary || {};
  const isSupabaseConfigured = !!window.sb;
  const isCloudinaryConfigured =
    cloud.cloudName && cloud.cloudName !== "YOUR_CLOUD_NAME" &&
    cloud.uploadPreset && cloud.uploadPreset !== "YOUR_UNSIGNED_UPLOAD_PRESET";

  /* =====================================================
     1) ẢNH CƯỚI CỦA CHÚNG MÌNH (curated) — bạn tự thêm ảnh
     Cách dùng: thả file ảnh vào thư mục img/album/ với đúng
     tên bên dưới (hoặc đổi tên trong mảng này cho khớp).
     ===================================================== */
  const CURATED_PHOTOS = [
    { file: "img/album/01.jpg", caption: "Khoảnh khắc lễ hỏi" },
    { file: "img/album/02.jpg", caption: "Chụp ảnh cưới ngoại cảnh" },
    { file: "img/album/03.jpg", caption: "Cùng gia đình hai bên" },
    { file: "img/album/04.jpg", caption: "Nhẫn cưới" },
    { file: "img/album/05.jpg", caption: "Khoảnh khắc ngọt ngào" },
    { file: "img/album/06.jpg", caption: "Bạn bè thân thiết" },
    { file: "img/album/07.jpg", caption: "Trang trí tiệc cưới" },
    { file: "img/album/08.jpg", caption: "Chú rể và phù rể" },
    { file: "img/album/09.jpg", caption: "Cô dâu và phù dâu" },
    { file: "img/album/10.jpg", caption: "Kỷ niệm đáng nhớ" },
  ].map((p) => ({ url: p.file, thumb: p.file, caption: p.caption, name: "" }));

  const curatedGrid = document.getElementById("curatedGrid");
  const guestGrid = document.getElementById("guestGrid");
  const guestEmpty = document.getElementById("guestEmpty");

  function cloudinaryTransform(url, transform) {
    if (!url || url.indexOf("/upload/") === -1) return url;
    return url.replace("/upload/", `/upload/${transform}/`);
  }

  const ASPECT_CLASSES = ["", "ar-square", "ar-tall", "ar-wide"];

  function renderGrid(container, photos, listRef) {
    container.innerHTML = "";
    const frag = document.createDocumentFragment();
    photos.forEach((photo, index) => {
      const item = document.createElement("div");
      item.className = `gallery-item tilt-3d ${ASPECT_CLASSES[index % ASPECT_CLASSES.length]}`.trim();
      item.innerHTML = `
        <span class="lazy-img-wrap">
          <img class="lazy-img" data-src="${photo.thumb}" alt="${escapeHtml(photo.caption || "Ảnh cưới")}" />
        </span>
        <div class="caption">${escapeHtml(photo.caption || "")}${photo.name ? " · " + escapeHtml(photo.name) : ""}</div>
      `;
      item.addEventListener("click", () => openLightbox(listRef, index));
      frag.appendChild(item);
    });
    container.appendChild(frag);
    initLazyImages(container);
    attachTilt(container);
  }

  function attachTilt(container, intensity = 6) {
    container.querySelectorAll(".gallery-item.tilt-3d").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rotateY = (x / rect.width - 0.5) * intensity * 2;
        const rotateX = (0.5 - y / rect.height) * intensity * 2;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03,1.03,1.03)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)";
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  renderGrid(curatedGrid, CURATED_PHOTOS, CURATED_PHOTOS);

  /* =====================================================
     2) ẢNH TỪ KHÁCH MỜI — lấy danh sách đã lưu trong Supabase
     ===================================================== */
  let guestPhotos = [];

  function renderGuestGrid() {
    if (!guestPhotos.length) {
      guestGrid.innerHTML = "";
      guestEmpty.style.display = "block";
      return;
    }
    guestEmpty.style.display = "none";
    const withThumb = guestPhotos.map((p) => ({
      url: p.url,
      thumb: cloudinaryTransform(p.url, "f_auto,q_auto,w_500,c_fill,g_auto"),
      caption: p.message,
      name: p.name,
    }));
    renderGrid(guestGrid, withThumb, withThumb);
  }

  async function loadGuestPhotos() {
    if (!window.sb) return;
    const { data, error } = await window.sb
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.warn("Không tải được ảnh khách mời:", error);
      return;
    }
    guestPhotos = (data || []).filter((p) => p.url);
    renderGuestGrid();
  }
  loadGuestPhotos();
  renderGuestGrid();

  /* =====================================================
     3) UPLOAD ẢNH (Cloudinary unsigned upload)
     ===================================================== */
  const notice = document.getElementById("uploadConfigNotice");
  if ((!isCloudinaryConfigured || !isSupabaseConfigured) && notice) notice.classList.add("show");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const previewList = document.getElementById("filePreviewList");
  const uploadForm = document.getElementById("uploadForm");
  const uploadStatus = document.getElementById("uploadStatus");
  const submitBtn = document.getElementById("uploadSubmitBtn");

  let selectedFiles = [];
  // Khớp với "Max file size" đang đặt trong Cloudinary upload preset (mặc định 10MB).
  const MAX_FILE_SIZE_MB = 10;

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());
    ["dragover", "dragenter"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      })
    );
    ["dragleave", "drop"].forEach((evt) =>
      dropzone.addEventListener(evt, (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      })
    );
    dropzone.addEventListener("drop", (e) => {
      addFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener("change", () => addFiles(fileInput.files));
  }

  function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const oversized = [];
    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        oversized.push(file.name);
        return;
      }
      const id = `f${Date.now()}${Math.random().toString(16).slice(2)}`;
      selectedFiles.push({ id, file, status: "pending", progress: 0 });
    });
    renderPreviews();

    if (oversized.length) {
      uploadStatus.classList.add("error");
      uploadStatus.textContent =
        `Ảnh "${oversized.join(", ")}" nặng hơn ${MAX_FILE_SIZE_MB}MB nên chưa thêm vào danh sách. ` +
        `Vui lòng nén ảnh (vd. squoosh.app) rồi thử lại.`;
    } else if (uploadStatus.classList.contains("error")) {
      uploadStatus.classList.remove("error");
      uploadStatus.textContent = "";
    }
  }

  function renderPreviews() {
    if (!previewList) return;
    previewList.innerHTML = "";
    selectedFiles.forEach((entry) => {
      const wrap = document.createElement("div");
      wrap.className = "file-preview";
      wrap.dataset.id = entry.id;
      const img = document.createElement("img");
      img.src = URL.createObjectURL(entry.file);
      const bar = document.createElement("div");
      bar.className = "progress-bar";
      bar.innerHTML = '<span style="width:0%"></span>';
      wrap.appendChild(img);
      wrap.appendChild(bar);
      previewList.appendChild(wrap);
    });
  }

  function setFileProgress(id, percent, status) {
    const wrap = previewList.querySelector(`[data-id="${id}"]`);
    if (!wrap) return;
    const span = wrap.querySelector(".progress-bar span");
    if (span) span.style.width = percent + "%";
    if (status) wrap.classList.add(status);
  }

  function uploadToCloudinary(file, onProgress) {
    return new Promise((resolve, reject) => {
      const url = `https://api.cloudinary.com/v1_1/${cloud.cloudName}/image/upload`;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloud.uploadPreset);
      formData.append("folder", "wedding-guests");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      });
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          let message = "Tải ảnh lên thất bại (" + xhr.status + ")";
          try {
            const body = JSON.parse(xhr.responseText);
            if (body && body.error && body.error.message) message = body.error.message;
          } catch (e) {
            // Giữ nguyên message mặc định nếu Cloudinary không trả JSON hợp lệ.
          }
          reject(new Error(message));
        }
      };
      xhr.onerror = () => reject(new Error("Lỗi mạng khi tải ảnh lên"));
      xhr.send(formData);
    });
  }

  async function savePhotoMeta(url, name, message) {
    if (!window.sb) return;
    const { error } = await window.sb.from("photos").insert({ url, name, message });
    if (error) console.warn("Không lưu được thông tin ảnh:", error);
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isCloudinaryConfigured || !isSupabaseConfigured) {
        uploadStatus.textContent = "Chức năng upload chưa được cấu hình. Xem SETUP.md để bật tính năng này.";
        uploadStatus.classList.add("error");
        return;
      }
      if (!selectedFiles.length) {
        uploadStatus.textContent = "Vui lòng chọn ít nhất một ảnh để tải lên.";
        uploadStatus.classList.add("error");
        return;
      }

      const name = document.getElementById("uploaderName").value.trim() || "Khách mời";
      const message = document.getElementById("uploaderMessage").value.trim();

      submitBtn.disabled = true;
      uploadStatus.classList.remove("error");
      uploadStatus.textContent = `Đang tải lên 0/${selectedFiles.length} ảnh...`;

      let uploaded = 0;
      const newlyUploaded = [];
      const failures = [];

      for (const entry of selectedFiles) {
        try {
          const result = await uploadToCloudinary(entry.file, (percent) =>
            setFileProgress(entry.id, percent)
          );
          setFileProgress(entry.id, 100, "done");
          await savePhotoMeta(result.secure_url, name, message);
          newlyUploaded.push({ url: result.secure_url, name, message });
          uploaded++;
          uploadStatus.textContent = `Đang tải lên ${uploaded}/${selectedFiles.length} ảnh...`;
        } catch (err) {
          console.error(err);
          setFileProgress(entry.id, 100, "error");
          failures.push(`${entry.file.name}: ${err.message}`);
        }
      }

      submitBtn.disabled = false;

      if (uploaded > 0 && !failures.length) {
        uploadStatus.classList.remove("error");
        uploadStatus.textContent = `Đã gửi ${uploaded} ảnh thành công. Cảm ơn bạn đã chia sẻ khoảnh khắc!`;
      } else if (uploaded > 0 && failures.length) {
        uploadStatus.classList.add("error");
        uploadStatus.textContent = `Đã gửi ${uploaded} ảnh thành công. Một số ảnh lỗi: ${failures.join(" | ")}`;
      } else {
        uploadStatus.classList.add("error");
        uploadStatus.textContent = failures.join(" | ") || "Không có ảnh nào được tải lên thành công. Vui lòng thử lại.";
      }

      if (uploaded > 0) {
        guestPhotos = [...newlyUploaded, ...guestPhotos];
        renderGuestGrid();
        selectedFiles = [];
        renderPreviews();
        uploadForm.reset();
      }
    });
  }

  /* =====================================================
     4) LIGHTBOX
     ===================================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  let activeList = [];
  let activeIndex = 0;

  window.openLightbox = function (list, index) {
    activeList = list;
    activeIndex = index;
    showLightboxImage();
    lightbox.classList.add("active");
  };

  function showLightboxImage() {
    const photo = activeList[activeIndex];
    if (!photo) return;
    lightboxImg.src = cloudinaryTransform(photo.url, "f_auto,q_auto,w_1600");
    lightboxImg.alt = photo.caption || "";
    lightboxCaption.textContent = [photo.name, photo.caption].filter(Boolean).join(" — ");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightboxImg.src = "";
  }

  function nextImage(step) {
    if (!activeList.length) return;
    activeIndex = (activeIndex + step + activeList.length) % activeList.length;
    showLightboxImage();
  }

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => nextImage(-1));
  document.getElementById("lightboxNext").addEventListener("click", () => nextImage(1));
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") nextImage(-1);
    if (e.key === "ArrowRight") nextImage(1);
  });
});
