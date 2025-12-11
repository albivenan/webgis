# Analisis Form Tambah, Edit, dan Detail Kartu Keluarga

## 📋 Struktur Saat Ini

### 1. **Sidebar Menu** (`app-sidebar.tsx`)
- Menu "Data Kependudukan" dengan submenu:
  - Lokasi Penduduk
  - Data Kartu Keluarga ✓
  - Persebaran Penduduk

### 2. **Halaman Index** (`kartu-keluarga/index.tsx`)
- Menampilkan daftar KK dengan kolom: No., No. KK, Alamat, Kepala Keluarga, Aksi
- Tombol aksi: View (detail), Edit, Delete
- Pagination: 10 data per halaman

### 3. **Halaman Create** (`kartu-keluarga/create.tsx`)
- **Card 1: Data Kartu Keluarga**
  - Nomor KK (required)
  - Kode Pos (required)
  - Alamat Lengkap (required, textarea)
  - RT/RW (required)
  - Desa/Kelurahan (required)
  - Kecamatan (required)
  - Kab/Kota (required)
  - Provinsi (required)

- **Card 2: Anggota Keluarga**
  - Dinamis (bisa tambah/hapus anggota)
  - Per anggota: NIK, Nama, Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Status Hubungan, Status Perkawinan, Pekerjaan, Keterangan

### 4. **Halaman Edit** (`kartu-keluarga/edit.tsx`)
- Struktur sama dengan Create
- Pre-filled dengan data existing
- Tombol: Batal, Simpan Perubahan

### 5. **Halaman Detail/Show** (`kartu-keluarga/show.tsx`)
- **Card 1: Informasi Kartu Keluarga** (read-only)
- **Card 2: Anggota Keluarga** (read-only)
- Tombol: Edit, Kembali ke Daftar

### 6. **Backend**
- **Controller**: `KartuKeluargaController.php`
  - Validasi sudah include `foto_rumah` (nullable|string)
  - Model sudah include `foto_rumah` di fillable
  
- **Model**: `KartuKeluarga.php`
  - Kolom `foto_rumah` sudah ada di migration
  - Relasi: `anggotaKeluarga()`, `rumah()`

- **Database**: Kolom `foto_rumah` sudah ada (nullable)

## 🎯 Rencana Penambahan Kolom Foto

### Fitur yang akan ditambahkan:
1. **Upload Foto** di form Create dan Edit
   - Input file dengan preview
   - Validasi: jpg, jpeg, png, max 2MB
   - Opsional (nullable)

2. **Tampilkan Foto** di halaman Detail
   - Preview foto dengan ukuran yang sesuai
   - Fallback image jika tidak ada foto

3. **Update Controller**
   - Handle file upload ke storage
   - Simpan path ke database
   - Delete foto lama saat update

4. **Update Routes** (jika perlu)
   - Tambah route untuk serve foto

## 📁 File yang akan dimodifikasi:
1. `resources/js/pages/data-kependudukan/kartu-keluarga/create.tsx` - Tambah input foto
2. `resources/js/pages/data-kependudukan/kartu-keluarga/edit.tsx` - Tambah input foto + preview
3. `resources/js/pages/data-kependudukan/kartu-keluarga/show.tsx` - Tampilkan foto
4. `app/Http/Controllers/KartuKeluargaController.php` - Handle upload
5. `routes/web.php` - Tambah route untuk serve foto (optional)

## ✅ Status Sidebar Menu
- Sudah terhubung dengan benar ke halaman kartu keluarga
- Relasi halaman: Index → Create/Edit/Show → Index
