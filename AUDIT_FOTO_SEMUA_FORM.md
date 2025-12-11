# Audit: Status Input Foto di Semua Form Aplikasi

## 📋 Summary

Audit lengkap untuk mengecek apakah semua form di aplikasi sudah memiliki input foto.

---

## ✅ Form yang SUDAH Memiliki Input Foto

### 1. Bencana (Create & Edit)
**File:** `resources/js/pages/bencana/create.tsx`
**Status:** ✅ SUDAH ADA
**Field:** `foto`
**Tipe:** File upload dengan preview
**Validasi:** 
- Max size: 2MB
- Format: JPG, JPEG, PNG
**Database:** `bencana.foto` (sudah ada di migrasi 2025_12_10)

### 2. Fasilitas (Create & Edit)
**File:** `resources/js/pages/fasilitas/create.tsx` & `edit.tsx`
**Status:** ✅ SUDAH ADA
**Field:** `foto`
**Tipe:** File upload dengan preview
**Validasi:**
- Max size: 2MB
- Format: JPG, JPEG, PNG
**Database:** `fasilitas.foto` (sudah ada di migrasi 2025_12_10)

### 3. Lokasi Penduduk (Create)
**File:** `resources/js/pages/data-kependudukan/lokasi-penduduk/create.tsx`
**Status:** ✅ SUDAH ADA
**Field:** `foto_rumah` (untuk rumah baru dan existing)
**Tipe:** File upload dengan preview
**Validasi:**
- Max size: 2MB
- Format: JPG, JPEG, PNG
**Database:** `rumah.foto_rumah` (sudah ada di migrasi 2025_12_04)

### 4. Lokasi Penting
**File:** `resources/js/pages/manajemen-data/lokasi-penting/index.tsx`
**Status:** ✅ SUDAH ADA (di database)
**Field:** `foto`
**Database:** `lokasi_penting.foto` (sudah ada di migrasi 2025_12_02)
**Note:** Perlu cek apakah form sudah ada input foto

---

## ❌ Form yang BELUM Memiliki Input Foto

### 1. Batas Wilayah (Create & Edit)
**File:** `resources/js/pages/batas-wilayah/create.tsx` & `edit.tsx`
**Status:** ❌ BELUM ADA
**Perlu Ditambah:** ✅ YES
**Database:** `batas_wilayah.foto` (akan ditambah via migrasi 2025_12_11)

---

## 📊 Tabel Status

| Form | Create | Edit | Database | Status |
|------|--------|------|----------|--------|
| Bencana | ✅ | ✅ | ✅ | LENGKAP |
| Fasilitas | ✅ | ✅ | ✅ | LENGKAP |
| Lokasi Penduduk | ✅ | - | ✅ | LENGKAP |
| Lokasi Penting | ? | ? | ✅ | PERLU CEK |
| Batas Wilayah | ❌ | ❌ | ✅ (akan ada) | PERLU TAMBAH |

---

## 🔧 Migrasi yang Sudah Ada

### Sudah Ada
1. `2025_12_10_add_foto_to_bencana_table.php` - Kolom `foto` di tabel `bencana`
2. `2025_12_10_add_foto_to_fasilitas_table.php` - Kolom `foto` di tabel `fasilitas`
3. `2025_12_02_103258_create_lokasi_penting_table.php` - Kolom `foto` di tabel `lokasi_penting`
4. `2025_12_04_120400_create_rumah_table.php` - Kolom `foto_rumah` di tabel `rumah`

### Baru Dibuat
1. `2025_12_11_add_foto_to_all_tables.php` - Ensure kolom `foto` di semua tabel

---

## 📝 Action Items

### 1. Tambah Input Foto ke Batas Wilayah
**Priority:** HIGH
**Files to Modify:**
- `resources/js/pages/batas-wilayah/create.tsx`
- `resources/js/pages/batas-wilayah/edit.tsx`

**Implementation:**
```typescript
// Tambah state
const [fotoPreview, setFotoPreview] = useState<string | null>(null);

// Tambah ke useForm
foto: null as File | null,

// Tambah handler functions
const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => { ... }
const handleRemoveFoto = () => { ... }

// Tambah field di form
<div className="space-y-2">
    <Label htmlFor="foto">Foto Batas Wilayah (Opsional)</Label>
    <div className="flex items-center gap-4">
        <div className="flex-1">
            <label htmlFor="foto" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Klik untuk upload foto</p>
                    <p className="text-xs text-muted-foreground">JPG, JPEG, PNG (Max 2MB)</p>
                </div>
                <input
                    id="foto"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFotoChange}
                    className="hidden"
                />
            </label>
        </div>
        {fotoPreview && (
            <div className="relative w-24 h-24">
                <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                    type="button"
                    onClick={handleRemoveFoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}
    </div>
</div>
```

### 2. Cek Lokasi Penting Form
**Priority:** MEDIUM
**Action:** Verifikasi apakah form lokasi penting sudah memiliki input foto

### 3. Jalankan Migrasi
**Priority:** HIGH
**Command:** `php artisan migrate`

---

## 🚀 Deployment Checklist

- [ ] Tambah input foto ke Batas Wilayah (create & edit)
- [ ] Cek form Lokasi Penting
- [ ] Jalankan migrasi: `php artisan migrate`
- [ ] Test upload foto di semua form
- [ ] Verifikasi foto tersimpan di database
- [ ] Verifikasi foto ditampilkan di halaman detail

---

## 📊 Database Schema

### Tabel dengan Kolom Foto

```sql
-- bencana
ALTER TABLE bencana ADD COLUMN foto VARCHAR(255) NULL AFTER keterangan;

-- fasilitas
ALTER TABLE fasilitas ADD COLUMN foto VARCHAR(255) NULL AFTER tipe_akses;

-- lokasi_penting
ALTER TABLE lokasi_penting ADD COLUMN foto VARCHAR(255) NULL AFTER deskripsi;

-- rumah
ALTER TABLE rumah ADD COLUMN foto_rumah VARCHAR(255) NULL AFTER keterangan;

-- batas_wilayah
ALTER TABLE batas_wilayah ADD COLUMN foto VARCHAR(255) NULL AFTER keterangan;
```

---

## 🎯 Summary

### Sudah Lengkap
- ✅ Bencana (create, edit, database)
- ✅ Fasilitas (create, edit, database)
- ✅ Lokasi Penduduk (create, database)

### Perlu Ditambah
- ❌ Batas Wilayah (create, edit) - URGENT

### Perlu Dicek
- ⚠️ Lokasi Penting (form)

---

**Status:** ⚠️ SEBAGIAN LENGKAP - PERLU TAMBAH BATAS WILAYAH
**Last Updated:** 2025-12-11
**Priority:** HIGH
