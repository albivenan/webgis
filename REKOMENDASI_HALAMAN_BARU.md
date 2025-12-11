# REKOMENDASI IMPLEMENTASI HALAMAN BARU

## 🎯 HALAMAN YANG PERLU DIBUAT

### 1. **Bencana - Create/Edit**
**Status:** Sudah ada `bencana/create.tsx` (perlu cek)
**Pola:** Gunakan dari `fasilitas/create.tsx`
**Fitur:**
- Form dengan input: nama, jenis, tingkat bahaya, tanggal, korban
- Peta dengan 3 mode: titik, polygon, radius
- Support foto upload
- Auto-calculate luas untuk polygon/radius

**Reuse dari:**
- `fasilitas/create.tsx` - Form layout & map setup
- `PolygonDrawer` component
- `FotoUploadField` logic
- `calculateArea()` function

---

### 2. **Lokasi Penduduk - Create/Edit**
**Status:** Ada `lokasi-penduduk/create.tsx` (perlu cek)
**Pola:** Gunakan dari `fasilitas/create.tsx`
**Fitur:**
- Form dengan input: alamat, RT/RW, no HP, keterangan
- Peta dengan marker placement
- Foto upload
- Link ke Kartu Keluarga (optional)

**Reuse dari:**
- `fasilitas/create.tsx` - Form layout
- `lokasi-penduduk/index.tsx` - Marker logic
- `FotoUploadField` logic
- `createFacilityIcon()` untuk rumah icon

---

### 3. **Rumah - Index** (BARU)
**Status:** Belum ada halaman khusus
**Pola:** Gunakan dari `lokasi-penduduk/index.tsx`
**Fitur:**
- Peta dengan markers rumah
- Daftar rumah dengan search
- Statistics: total rumah, total KK, total penduduk
- Foto preview di popup
- Link ke detail rumah

**Reuse dari:**
- `lokasi-penduduk/index.tsx` - Struktur lengkap
- `RumahMarker` component (sudah ada)
- `BaseMapContainer` (akan dibuat)
- `DataListCard` (akan dibuat)

---

### 4. **Rumah - Create/Edit** (BARU)
**Status:** Belum ada
**Pola:** Gunakan dari `fasilitas/create.tsx`
**Fitur:**
- Form dengan input: alamat, RT/RW, keterangan
- Peta dengan marker placement
- Foto upload
- Link ke Kartu Keluarga

**Reuse dari:**
- `fasilitas/create.tsx` - Form layout
- `MapFormLayout` (akan dibuat)
- `FotoUploadField` logic

---

## 📐 STRUKTUR FOLDER YANG DIREKOMENDASIKAN

```
resources/js/
├── pages/
│   ├── batas-wilayah/
│   │   ├── index.tsx ✓
│   │   ├── create.tsx ✓
│   │   └── edit.tsx ✓
│   ├── bencana/
│   │   ├── berlangsung.tsx ✓
│   │   ├── riwayat.tsx ✓
│   │   ├── create.tsx (perlu cek)
│   │   └── edit.tsx (perlu cek)
│   ├── data-kependudukan/
│   │   ├── lokasi-penduduk/
│   │   │   ├── index.tsx ✓
│   │   │   ├── create.tsx (perlu cek)
│   │   │   └── edit.tsx (perlu cek)
│   │   ├── rumah/
│   │   │   ├── index.tsx (BARU)
│   │   │   ├── create.tsx (BARU)
│   │   │   └── edit.tsx (BARU)
│   │   ├── kartu-keluarga/
│   │   └── persebaran-penduduk/
│   └── fasilitas/
│       ├── index.tsx ✓
│       ├── create.tsx ✓
│       ├── edit.tsx ✓
│       └── show.tsx ✓
├── components/
│   ├── maps/
│   │   ├── BaseMapContainer.tsx (BARU)
│   │   ├── MapFormLayout.tsx (BARU)
│   │   ├── DataListCard.tsx (BARU)
│   │   ├── FotoUploadField.tsx (BARU)
│   │   ├── MapLegend.tsx ✓
│   │   ├── PolygonDrawer.tsx ✓
│   │   ├── PolylineDrawer.tsx ✓
│   │   └── BaseMapLayers.tsx ✓
│   └── ...
└── lib/
    ├── map-icons.ts ✓
    ├── map-utils.ts (BARU - untuk formatLuas, calculateArea)
    └── ...
```

---

## 🔧 KOMPONEN YANG PERLU DIBUAT

### 1. **BaseMapContainer.tsx**
```typescript
interface BaseMapContainerProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  children?: React.ReactNode;
  maxBounds?: L.LatLngBounds;
  minZoom?: number;
}
```

### 2. **MapFormLayout.tsx**
```typescript
interface MapFormLayoutProps {
  title: string;
  description?: string;
  formContent: React.ReactNode;
  mapContent: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitButtonText?: string;
}
```

### 3. **DataListCard.tsx**
```typescript
interface DataListCardProps {
  title: string;
  searchPlaceholder?: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    render?: (value: any, item: any) => React.ReactNode;
  }>;
  onRowClick?: (item: any) => void;
  actions?: Array<{
    icon?: React.ReactNode;
    label?: string;
    onClick: (item: any, e: React.MouseEvent) => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
  emptyMessage?: string;
  height?: string;
}
```

### 4. **FotoUploadField.tsx**
```typescript
interface FotoUploadFieldProps {
  label?: string;
  value?: File | null;
  preview?: string | null;
  onChange: (file: File | null) => void;
  onPreviewChange: (preview: string | null) => void;
  maxSize?: number; // bytes
  accept?: string;
}
```

### 5. **map-utils.ts**
```typescript
export const formatLuas = (luas?: number): string => { ... }
export const calculateArea = (coordinates: [number, number][]): number => { ... }
export const LAND_USE_COLORS = { ... }
export const DANGER_LEVEL_COLORS = { ... }
```

---

## 📋 CHECKLIST IMPLEMENTASI

### Phase 1: Extract Components (Priority)
- [ ] Buat `BaseMapContainer.tsx`
- [ ] Buat `MapFormLayout.tsx`
- [ ] Buat `DataListCard.tsx`
- [ ] Buat `FotoUploadField.tsx`
- [ ] Buat `map-utils.ts`

### Phase 2: Halaman Baru (Menggunakan Components)
- [ ] Buat `data-kependudukan/rumah/index.tsx`
- [ ] Buat `data-kependudukan/rumah/create.tsx`
- [ ] Buat `data-kependudukan/rumah/edit.tsx`

### Phase 3: Verifikasi Halaman Existing
- [ ] Cek `bencana/create.tsx`
- [ ] Cek `bencana/edit.tsx`
- [ ] Cek `lokasi-penduduk/create.tsx`
- [ ] Cek `lokasi-penduduk/edit.tsx`

### Phase 4: Gradual Migration (Optional)
- [ ] Update `batas-wilayah/index.tsx` gunakan `DataListCard`
- [ ] Update `bencana/berlangsung.tsx` gunakan `DataListCard`
- [ ] Update `fasilitas/create.tsx` gunakan `MapFormLayout`

---

## 🎨 DESIGN CONSISTENCY

### Colors
```typescript
// Land Use
LAND_USE_COLORS = {
  'Pertanian': '#84cc16',
  'Pemukiman': '#f59e0b',
  'Perkebunan': '#22c55e',
  'Hutan': '#15803d',
  'Industri': '#64748b',
  'Fasilitas Umum': '#3b82f6',
  'Lainnya': '#9ca3af',
}

// Danger Levels
DANGER_LEVEL_COLORS = {
  'rendah': '#22c55e',
  'sedang': '#facc15',
  'tinggi': '#f97316',
  'sangat_tinggi': '#ef4444',
}
```

### Icons
- Rumah: `createFacilityIcon('rumah')`
- Bencana: `createDisasterIcon(type, level)`
- Fasilitas: `facilityIcons[type]`

### Layouts
- Index: 2 kolom (map + list)
- Create/Edit: 2 kolom (form + map)
- Statistics: 3 kolom cards

---

## 🚀 QUICK START

### Untuk membuat halaman baru dengan efisien:

1. **Copy struktur dari halaman serupa**
   ```bash
   cp -r resources/js/pages/fasilitas/create.tsx resources/js/pages/data-kependudukan/rumah/create.tsx
   ```

2. **Update imports dan props**
   - Ganti `fasilitas` dengan `rumah`
   - Ganti form fields sesuai kebutuhan
   - Ganti route names

3. **Gunakan components yang sudah ada**
   - `MapFormLayout` untuk layout
   - `FotoUploadField` untuk foto
   - `BaseMapContainer` untuk peta
   - `DataListCard` untuk list

4. **Test dan deploy**

---

## 📊 ESTIMASI EFFORT

| Task | Effort | Notes |
|------|--------|-------|
| Extract Components | 4-6 jam | BaseMapContainer, MapFormLayout, DataListCard, FotoUploadField |
| Rumah Index | 2-3 jam | Copy dari lokasi-penduduk/index.tsx |
| Rumah Create | 2-3 jam | Copy dari fasilitas/create.tsx |
| Rumah Edit | 1-2 jam | Copy dari create.tsx |
| Testing | 2-3 jam | E2E testing |
| **Total** | **13-17 jam** | ~2 hari kerja |

---

## ✅ KESIMPULAN

**Strategi terbaik:**
1. Jangan refactor existing halaman (sudah berjalan)
2. Extract components baru untuk reuse
3. Gunakan components untuk halaman baru
4. Gradual migration untuk existing halaman saat maintenance

**Benefit:**
- 40-50% pengurangan code untuk halaman baru
- Konsistensi design & UX
- Maintenance lebih mudah
- Faster development

