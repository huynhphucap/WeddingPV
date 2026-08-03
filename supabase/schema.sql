-- =========================================================
-- Supabase schema cho thiệp cưới (Phúc & Vy)
-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor > New query
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- RSVP (xác nhận tham dự) ----------
create table if not exists public.rsvp (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  party text,
  guest_count int,
  note text
);

-- ---------- Wishes (sổ lưu bút) ----------
create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null
);

-- ---------- Photos (ảnh khách mời tải lên qua Cloudinary) ----------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  message text,
  url text not null
);

-- ---------- Row Level Security ----------
-- Trang web dùng "anon key" công khai ở phía trình duyệt, nên PHẢI bật RLS
-- và chỉ cấp đúng quyền cần thiết cho role "anon".
alter table public.rsvp enable row level security;
alter table public.wishes enable row level security;
alter table public.photos enable row level security;

-- Khách có thể gửi RSVP, nhưng KHÔNG được đọc lại danh sách khách khác
-- (giữ riêng tư họ tên/số lượng tham dự) — chủ trang xem trong Table Editor.
create policy "rsvp_public_insert" on public.rsvp
  for insert to anon
  with check (true);

-- Sổ lưu bút: ai cũng gửi được và xem được toàn bộ lời chúc (hiển thị công khai).
create policy "wishes_public_insert" on public.wishes
  for insert to anon
  with check (true);

create policy "wishes_public_select" on public.wishes
  for select to anon
  using (true);

-- Album ảnh khách mời: ai cũng thêm được và xem được toàn bộ ảnh.
create policy "photos_public_insert" on public.photos
  for insert to anon
  with check (true);

create policy "photos_public_select" on public.photos
  for select to anon
  using (true);
