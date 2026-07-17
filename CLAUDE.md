# CLAUDE.md — Memory Proyek SI-BHP

> ⚠️ **INSTRUKSI UNTUK CLAUDE:** File ini adalah memory proyek. Setiap kali kamu selesai
> membuat perubahan signifikan (fitur baru, perbaikan bug, perubahan format surat, dll),
> **WAJIB memperbarui bagian "Status Terkini" dan "Riwayat Update" di file ini** dalam
> respons yang sama — tanpa diminta. Tulis singkat, satu baris per perubahan.

## Tentang Proyek

**SI-BHP** — Sistem Informasi Inventaris Bahan Habis Pakai, Jurusan Teknik Mesin,
Politeknik Negeri Bengkalis. Pemilik: Abiyyu (pemula di web development — jelaskan
konsep teknis dengan bahasa sederhana, Bahasa Indonesia).

- Repo: https://github.com/Mozardrz/SI-BHP (branch `main`)
- Stack: React 18 + Vite, Tailwind CSS, Recharts, jsPDF, xlsx, **Supabase** (@supabase/supabase-js)
- Data: **Supabase Postgres** (project `dhfntzywjpevvbtkafew`, kunci di `.env` — gitignored).
  Semua akses data lewat `src/utils/storage.js` (async). Skema & seed: `supabase-setup.sql`.
- Jalankan: `npm run dev` → login `admin` / `admin123`. CATATAN: restart dev server jika `.env` berubah.

## Arsitektur Penting

- `src/utils/storage.js` — SEMUA CRUD data (labs, courses, materials, requests, transactions, users). Kalau migrasi ke backend, cukup ganti file ini.
- `src/utils/letter.js` — generator surat permohonan (HTML preview + `window.print()`). Format mengikuti `surat.docx` di root (sumber kebenaran format surat — selalu baca ulang docx ini jika user bilang formatnya berubah).
- `src/data/initialSeedData.js` — seed 13 lab + kepala lab + NIP.
- `src/data/kopLogo.js` — logo KOP surat (base64, dari KOP POLBENG.docx).
- `src/context/AuthContext.jsx` — login, sesi, profil, dark mode.
- Role: `admin` (teknisi) & `user`; tipe user (`user_type`): mahasiswa / dosen / admin.
- Aset: `src/assets/` (logo1.jpeg = logo aktif, gedung.jpeg = foto login).

## Konvensi

- Seluruh UI Bahasa Indonesia. Istilah: **BHP** (bukan BAP), **Dosen/Tendik** (bukan Dosen) di semua pilihan UI — kecuali TTD surat tetap "Dosen" (sesuai docx).
- Prodi (pilihan tetap): D3-Teknik Elektronika, D3-Teknik Mesin, D4-Teknik Mesin Produksi dan Perawatan.
- Riwayat Audit bersifat **immutable** — jangan pernah tambahkan fitur hapus di sana; koreksi lewat entri penyesuaian.
- Permohonan: hapus hanya untuk pending/ditolak; yang disetujui pakai "Batalkan" (stok dikembalikan). Keduanya wajib alasan + tercatat di audit.

## Status Terkini (per 16 Juli 2026)

Fitur selesai: dashboard, master BHP (+spesifikasi, +lab), 13 lab ter-seed, mata kuliah,
permohonan + approve/tolak/batalkan/hapus (dengan audit), cetak surat mahasiswa & dosen
(preview + print, KOP Polbeng, TTD kepala lab sesuai lab terpilih), stok kritis, riwayat
audit, kelola pengguna (username/password/tipe), profil (nama/foto kamera-file/password),
login page dengan foto gedung + logo1, ekspor PDF/Excel.

Format surat terkini: judul bertingkat 2 baris tanpa nomor; alamat "Kepada / Kepala
<nama lab> / Di Tempat"; identitas mahasiswa Nama-NIM-Prodi/Kelas-Laboratorium, dosen
Nama-Laboratorium; TTD kiri Pemohon (Mahasiswa+NIM / Dosen tanpa NIP), TTD kanan
"Mengetahui, Kepala <nama lab>" + nama & NIP kepala lab.

## Rencana Berikutnya (belum dikerjakan)

1. **Supabase Auth** — ganti login username/password buatan (password masih plaintext di tabel users) dengan Supabase Auth, lalu **ketatkan RLS** (sekarang masih allow-all untuk anon).
2. Deploy ke Netlify + hubungkan repo GitHub.
3. Uji coba (pilot) di 1 lab → rilis se-jurusan.
4. Ide tertunda: permohonan multi-bahan (template surat mendukung 5 baris), nomor surat otomatis (di-skip atas permintaan user), hapus file mati `src/pages/Equipment.jsx`.

## Riwayat Update

- 2026-07-16 (larut): **MIGRASI SUPABASE SELESAI** — storage.js full async ke Supabase (semua CRUD + approval engine + audit), AuthContext login via DB (role select di login dihapus, cukup username+password), semua halaman & Navbar/Sidebar di-async-kan, widget "Mode Demo/Reset" dihapus, E2E test lulus (approve/batal/restock/hapus + audit). RLS masih allow-all (grant anon perlu dijalankan terpisah di SQL Editor — pernah gagal karena user me-rerun skrip lama yang error di create policy).

- 2026-07-16 (malam): Mulai Tahap 1 Supabase — install @supabase/supabase-js, buat `.env` (gitignored) + `src/utils/supabase.js` + `supabase-setup.sql` (6 tabel, RLS sementara allow-all, seed 13 lab + admin). Revisi UI: logo1.jpeg, overlay login SI-BHP/Jurusan TM, label Dosen/Tendik, prodi di form cetak, surat tanpa nomor + "Kepada/Kepala <lab>/Di Tempat" + TTD "Kepala <lab>". CLAUDE.md dibuat.

- 2026-07-16: Rebrand BAP→BHP; fitur lab (13 seed); surat permohonan (mhs/dosen) + revisi format (judul bertingkat, tanpa nomor, Kepada/Di Tempat, Prodi/Kelas, TTD "Kepala <lab>"); profil + foto kamera; kelola pengguna username/password/tipe; hapus/batalkan permohonan + audit; login page foto gedung + logo1; label Dosen/Tendik; ekspor PDF master tanpa TTD; commit awal ke GitHub.
