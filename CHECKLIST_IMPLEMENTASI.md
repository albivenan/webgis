# Checklist Implementasi Foto Rumah

## ✅ Frontend Changes

### Create Form (`create.tsx`)
- [x] Import `Upload` dan `X` icons dari lucide-react
- [x] Tambah state `fotoPreview`
- [x] Tambah field `foto_rumah` di form data
- [x] Implementasi `handleFotoChange()` dengan validasi
- [x] Implementasi `handleRemoveFoto()`
- [x] Tambah UI upload area dengan dashed border
- [x] Tambah preview thumbnail dengan tombol hapus
- [x] Validasi: JPG, JPEG, PNG, max 2MB
- [x] Error handling dengan toast

### Edit Form (`edit.tsx`)
- [x] Import `Upload` dan `X` icons
- [x] Tambah `foto_rumah` ke interface KartuKeluarga
- [x] Tambah state `fotoPreview` dengan initial value dari existing foto
- [x] Tambah field `foto_rumah` di form data
- [x] Implementasi `handleFotoChange()` dan `handleRemoveFoto()`
- [x] Tambah UI upload area
- [x] Pre-fill preview dengan foto existing
- [x] Sama validasi seperti create

### Detail/Show Form (`show.tsx`)
- [x] Import `ImageOff` icon
- [x] Tambah `foto_rumah` ke interface KartuKeluarga
- [x] Tampilkan foto di bagian atas card
- [x] Responsive image styling
- [x] Fallback jika tidak ada foto

## ✅ Backend Changes

### Controller (`KartuKeluargaController.php`)
- [x] Import `Storage` facade
- [x] Update validasi di `store()`: `nullable|image|mimes:jpeg,jpg,png|max:2048`
- [x] Handle file upload di `store()`
- [x] Simpan path sebagai full URL
- [x] Update validasi di `update()`: `nullable|image|mimes:jpeg,jpg,png|max:2048`
- [x] Handle file upload di `update()`
- [x] Delete file lama saat update
- [x] Delete file saat `destroy()`

## ✅ Database
- [x] Kolom `foto_rumah` sudah ada di migration
- [x] Tipe: string (nullable)

## ✅ Configuration
- [ ] Run `php artisan storage:link` (manual step)
- [ ] Verify folder permissions: `storage/app/public/kartu-keluarga/`

## 📋 Testing Checklist

### Create Functionality
- [ ] Buka halaman Tambah KK
- [ ] Upload foto JPG (valid)
- [ ] Lihat preview muncul
- [ ] Klik X untuk hapus preview
- [ ] Upload foto PNG (valid)
- [ ] Coba upload file > 2MB (harus error)
- [ ] Coba upload file non-image (harus error)
- [ ] Submit form dengan foto
- [ ] Verifikasi foto tersimpan di storage
- [ ] Verifikasi foto tampil di halaman Detail

### Edit Functionality
- [ ] Buka halaman Edit KK dengan foto existing
- [ ] Lihat preview foto existing
- [ ] Upload foto baru
- [ ] Lihat preview berubah
- [ ] Submit form
- [ ] Verifikasi foto lama dihapus
- [ ] Verifikasi foto baru tampil di Detail

### Delete Functionality
- [ ] Buka halaman Index
- [ ] Delete KK dengan foto
- [ ] Verifikasi foto dihapus dari storage
- [ ] Verifikasi record dihapus dari database

### Edge Cases
- [ ] Create KK tanpa foto (harus berhasil)
- [ ] Edit KK tanpa mengubah foto (harus tetap ada)
- [ ] Edit KK dan hapus foto (set null)
- [ ] Upload foto dengan nama special characters
- [ ] Upload foto dengan ukuran tepat 2MB

## 🔍 Verification Steps

### 1. Database
```bash
# Check kolom foto_rumah ada
php artisan tinker
>>> DB::table('kartu_keluargas')->first();
```

### 2. Storage
```bash
# Check folder ada
ls -la storage/app/public/kartu-keluarga/

# Check symlink
ls -la public/storage
```

### 3. Frontend
```bash
# Check form render dengan benar
# Buka browser DevTools → Network tab
# Upload foto dan lihat request FormData
```

### 4. Backend
```bash
# Check logs
tail -f storage/logs/laravel.log

# Check file tersimpan
ls -la storage/app/public/kartu-keluarga/
```

## 📝 Notes

- Foto disimpan dengan nama random (UUID) untuk menghindari conflict
- Path disimpan sebagai full URL: `http://localhost:8000/storage/kartu-keluarga/[uuid].jpg`
- Validasi dilakukan di frontend (UX) dan backend (security)
- Foto lama otomatis dihapus saat update atau delete
- Opsional: User bisa skip upload foto

## 🚀 Deployment Checklist

- [ ] Run migrations: `php artisan migrate`
- [ ] Create storage link: `php artisan storage:link`
- [ ] Set folder permissions: `chmod -R 755 storage/app/public`
- [ ] Test upload di production
- [ ] Verify storage path di .env
- [ ] Backup existing data sebelum deploy

## 📞 Support

Jika ada error:
1. Check `storage/logs/laravel.log`
2. Verify folder permissions
3. Verify storage link exists
4. Check file size dan type
5. Clear cache: `php artisan cache:clear`
