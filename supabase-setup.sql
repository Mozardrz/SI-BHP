-- ============================================================
-- SI-BHP : Setup Database Supabase
-- Cara pakai: Supabase Dashboard -> SQL Editor -> New query
--             -> paste seluruh isi file ini -> Run
-- ============================================================

-- 1. LABORATORIUM
create table if not exists labs (
  id text primary key,
  lab_name text not null,
  head_name text not null,
  head_nip text,
  created_at timestamptz default now()
);

-- 2. MATA KULIAH
create table if not exists courses (
  id text primary key,
  course_code text,
  course_name text not null,
  lab_id text references labs(id),
  semester int default 1,
  day_of_week text,
  start_time text,
  end_time text,
  description text,
  created_at timestamptz default now()
);

-- 3. PENGGUNA
create table if not exists users (
  id text primary key,
  first_name text,
  last_name text,
  name text not null,
  username text unique,
  password text,           -- sementara (akan diganti Supabase Auth di tahap berikutnya)
  email text,
  role text default 'user',       -- 'admin' | 'user'
  user_type text default 'mahasiswa', -- 'mahasiswa' | 'dosen' | 'admin'
  avatar text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. BAHAN HABIS PAKAI
create table if not exists materials (
  id text primary key,
  no int,
  material_name text not null,
  specification text,
  course_id text references courses(id),
  lab_id text references labs(id),
  semester int default 1,
  practical_hours int default 4,
  quality text default 'good',
  unit text default 'Pcs',
  stock int not null default 0 check (stock >= 0),
  min_stock int not null default 0 check (min_stock >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. PERMOHONAN
create table if not exists requests (
  id text primary key,
  material_id text references materials(id),
  course_id text,
  user_id text references users(id),
  quantity int not null check (quantity > 0),
  semester int,
  practical_hours int,
  practical_date date,
  status text default 'pending',  -- pending | approved | rejected | cancelled
  admin_note text,
  processed_by text,
  created_at timestamptz default now()
);

-- 6. RIWAYAT AUDIT (LEDGER)
create table if not exists transactions (
  id text primary key,
  material_id text,
  type text not null,             -- in | out | adjustment
  quantity int not null default 0,
  date date default current_date,
  recorded_by text,
  note text,
  created_at timestamptz default now()
);

-- ============================================================
-- RLS: sementara diizinkan penuh untuk anon (aplikasi masih pakai
-- login buatan sendiri). Akan DIKETATKAN saat pindah ke Supabase
-- Auth: mahasiswa hanya lihat miliknya, audit tidak bisa dihapus.
-- ============================================================
alter table labs enable row level security;
alter table courses enable row level security;
alter table users enable row level security;
alter table materials enable row level security;
alter table requests enable row level security;
alter table transactions enable row level security;

drop policy if exists "allow all (sementara)" on labs;
drop policy if exists "allow all (sementara)" on courses;
drop policy if exists "allow all (sementara)" on users;
drop policy if exists "allow all (sementara)" on materials;
drop policy if exists "allow all (sementara)" on requests;
drop policy if exists "allow all (sementara)" on transactions;

create policy "allow all (sementara)" on labs for all using (true) with check (true);
create policy "allow all (sementara)" on courses for all using (true) with check (true);
create policy "allow all (sementara)" on users for all using (true) with check (true);
create policy "allow all (sementara)" on materials for all using (true) with check (true);
create policy "allow all (sementara)" on requests for all using (true) with check (true);
create policy "allow all (sementara)" on transactions for all using (true) with check (true);

-- ============================================================
-- SEED: 13 Laboratorium/Bengkel Teknik Mesin + akun admin awal
-- ============================================================
insert into labs (id, lab_name, head_name, head_nip) values
  ('lab-01', 'Bengkel Mesin Perkakas', 'Razali, S.T., M.T', '197312252012121004'),
  ('lab-02', 'Bengkel Kerja Bangku dan Plat', 'Syahrizal, S.T., M.T', '197310142021211005'),
  ('lab-03', 'Bengkel Motor Bakar', 'Ibnu Hajar, S.T., M.T', '197108102021211001'),
  ('lab-04', 'Bengkel Las dan Fabrikasi', 'Rahmat Fajrul, M.T', '198709162022031002'),
  ('lab-05', 'Laboratorium Uji Material', 'Suhardiman, S.T, M.T', '197205132021211002'),
  ('lab-06', 'Laboratorium Fluida dan Thermal', 'Abdul Gafur, S.Si., M.T', '198802232019031009'),
  ('lab-07', 'Laboratorium Metrologi Industri dan Kendali Mutu', 'Alfansuri, S.T., M.Sc', '197601172015041001'),
  ('lab-08', 'Laboratorium Pemrograman dan Desain', 'Firman Alhaffis, S.T., M.T', '198401302019031005'),
  ('lab-09', 'Laboratorium Pneumatik dan Hidrolik', 'Bambang Dwi Haripriadi, S.T., M.T', '197801302021211004'),
  ('lab-10', 'Laboratorium CNC', 'Sunarto, S.Pd., M.T', '197412192021211003'),
  ('lab-11', 'Laboratorium Studio Gambar', 'Imran, S.Pd., M.T', '197503272014041001'),
  ('lab-12', 'Laboratorium Mekatronika', 'Burhan Hafid, M.T', '199407112025061004'),
  ('lab-13', 'Laboratorium Perawatan Mesin Industri', 'Akmal Indra, S.Pd., M.T', '197509122021211002')
on conflict (id) do nothing;

insert into users (id, first_name, last_name, name, username, password, role, user_type) values
  ('usr-admin-01', 'Admin', 'Utama', 'Admin Utama Lab', 'admin', 'admin123', 'admin', 'admin')
on conflict (id) do nothing;

-- ============================================================
-- IZIN AKSES: buka privilege tabel untuk role aplikasi
-- (project Supabase baru kadang belum memberi grant ke anon)
-- ============================================================
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

-- Segarkan cache API Supabase agar perubahan langsung terbaca
notify pgrst, 'reload schema';
