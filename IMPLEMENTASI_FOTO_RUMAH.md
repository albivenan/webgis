# Implementasi Kolom Foto Rumah - Kartu Keluarga

## 📋 Ringkasan Perubahan

Telah ditambahkan fitur upload foto rumah (opsional) pada form Tambah, Edit, dan tampilan Detail Kartu Keluarga.

## 🔧 File yang Dimodifikasi

### 1. **Frontend - React Components**

#### `resources/js/pages/data-kependudukan/kartu-keluarga/create.tsx`
- ✅ Tambah state `fotoPreview` untuk preview gambar
- ✅ Tambah field `foto_rumah` di form data
- ✅ Tambah fungsi `handleFotoChange()` untuk validasi dan preview
- ✅ Tambah fungsi `handleRemoveFoto()` untuk hapus foto
- ✅ Tambah UI upload area dengan drag-drop style
- ✅ Validasi: JPG, JPEG, PNG, max 2MB

#### `resources/js/pages/data-kependudukan/kartu-keluarga/edit.tsx`
- ✅ Sama seperti create.tsx
- ✅ Pre-fill preview dengan foto existing
- ✅ Handle update foto (delete old, upload new)

#### `resources/js/pages/data-kependudukan/kartu-keluarga/show.tsx`
- ✅ Tampilkan foto di bagian atas card informasi
- ✅ Responsive image dengan max-width dan max-height
- ✅ Fallback jika tidak ada foto

### 2. **Backend - Controller**

#### `app/Http/Controllers/KartuKeluargaController.php`
- ✅ Import `Storage` facade
- ✅ Update validasi `foto_rumah` dari `nullable|string` → `nullable|image|mimes:jpeg,jpg,png|max:2048`
- ✅ Method `store()`: Handle file upload ke storage
- ✅ Method `update()`: Handle update foto (delete old, upload new)
- ✅ Method `destroy()`: Delete foto saat hapus KK
- ✅ Simpan path lengkap ke database: `asset('storage/' . $path)`

### 3. **Database**
- ✅ Kolom `foto_rumah` sudah ada di migration (nullable)
- ✅ Tipe: string (menyimpan path/URL)

## 📁 Struktur Storage

```
storage/app/public/
└── kartu-keluarga/
    ├── [uuid].jpg
    ├── [uuid].png
    └── ...
```

Akses via: `/storage/kartu-keluarga/[uuid].jpg`

## 🎯 Fitur yang Diimplementasikan

### Create Form
```
┌─────────────────────────────────────┐
│ Data Kartu Keluarga                 │
├─────────────────────────────────────┤
│ [Nomor KK] [Kode Pos]               │
│ [Alamat Lengkap]                    │
│ [RT] [RW] [Desa/Kelurahan]          │
│ [Kecamatan] [Kab/Kota] [Provinsi]   │
│                                     │
│ Foto Rumah (Opsional)               │
│ ┌─────────────────────────────────┐ │
│ │  📤 Klik untuk upload foto      │ │
│ │  JPG, JPEG, PNG (Max 2MB)       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Edit Form
- Sama seperti Create
- Jika ada foto existing, tampilkan preview dengan tombol hapus (X)
- Bisa replace dengan foto baru

### Detail/Show
- Tampilkan foto di bagian atas
- Responsive dengan max-width 28rem (448px)
- Rounded corners dan shadow

## ✅ Validasi

### Frontend
- Tipe file: JPG, JPEG, PNG
- Ukuran max: 2MB
- Toast notification untuk error

### Backend
- Validasi image: `image|mimes:jpeg,jpg,png|max:2048`
- Automatic storage ke folder `kartu-keluarga`
- Path disimpan sebagai full URL

## 🔄 Alur Data

### Create
```
User upload foto
    ↓
Frontend validasi (size, type)
    ↓
Preview ditampilkan
    ↓
Submit form (FormData dengan file)
    ↓
Backend validasi
    ↓
Store file ke storage/app/public/kartu-keluarga/
    ↓
Simpan path ke database
    ↓
Redirect ke index
```

### Edit
```
User upload foto baru
    ↓
Frontend validasi
    ↓
Preview ditampilkan
    ↓
Submit form
    ↓
Backend validasi
    ↓
Delete file lama (jika ada)
    ↓
Store file baru
    ↓
Update path di database
    ↓
Redirect ke index
```

### Delete
```
User klik delete KK
    ↓
Backend delete foto dari storage
    ↓
Delete record dari database
    ↓
Redirect ke index
```

## 🔗 Relasi Halaman

```
Index (Daftar KK)
├── Create (Tambah KK + Foto)
├── Edit (Edit KK + Foto)
└── Show (Detail KK + Foto)
```

Sidebar menu sudah terhubung dengan benar:
- Data Kependudukan → Kartu Keluarga → Index

## 📝 Catatan Penting

1. **Storage Link**: Pastikan sudah run `php artisan storage:link` untuk symlink public storage
2. **File Permissions**: Folder `storage/app/public/kartu-keluarga/` harus writable
3. **Cleanup**: Foto lama otomatis dihapus saat update atau delete KK
4. **Opsional**: Foto tidak wajib, bisa kosong
5. **Preview**: Real-time preview sebelum submit

## 🚀 Testing

### Test Create dengan Foto
1. Buka halaman Tambah KK
2. Isi form data KK
3. Upload foto (JPG/PNG, max 2MB)
4. Lihat preview
5. Submit
6. Verifikasi foto tampil di halaman Detail

### Test Edit Foto
1. Buka halaman Edit KK yang sudah ada foto
2. Lihat preview foto existing
3. Upload foto baru
4. Lihat preview berubah
5. Submit
6. Verifikasi foto lama dihapus, foto baru tampil

### Test Delete
1. Buka halaman Index
2. Delete KK yang punya foto
3. Verifikasi foto dihapus dari storage

## 📊 Database Schema

```sql
ALTER TABLE kartu_keluargas ADD COLUMN foto_rumah VARCHAR(255) NULLABLE;
```

Sudah ada di migration: `2025_12_03_103517_create_kartu_keluargas_table.php`

## 🎨 UI/UX

- Upload area dengan dashed border (drag-drop style)
- Icon upload (lucide-react)
- Preview thumbnail 6x6 rem (96x96px)
- Tombol hapus (X) di corner preview
- Error messages dengan toast notification
- Loading state saat submit
- Responsive design

## 🔐 Security

- Validasi tipe file di backend
- Validasi ukuran file (max 2MB)
- File disimpan di folder terpisah
- Path disimpan sebagai URL (bukan path lokal)
- Automatic cleanup saat delete/update
