# ANALISIS EFISIENSI HALAMAN & REKOMENDASI REUSE

## 📊 POLA YANG SUDAH ADA

### 1. **Halaman Index (List + Map)**
Struktur yang konsisten di semua halaman:
- **Batas Wilayah** (`batas-wilayah/index.tsx`)
- **Bencana Berlangsung** (`bencana/berlangsung.tsx`)
- **Bencana Riwayat** (`bencana/riwayat.tsx`)
- **Lokasi Penduduk** (`data-kependudukan/lokasi-penduduk/index.tsx`)
- **Fasilitas** (`fasilitas/index.tsx`)

**Pola Umum:**
```
Layout: 2 kolom (desktop) / 1 kolom (mobile)
- Kolom 1 (2/3): Peta interaktif dengan LayersControl
- Kolom 2 (1/3): Daftar data dengan search/filter
```

### 2. **Halaman Create/Edit (Form + Map)**
Struktur yang konsisten:
- **Batas Wilayah** (`batas-wilayah/create.tsx`, `edit.tsx`)
- **Fasilitas** (`fasilitas/create.tsx`)

**Pola Umum:**
```
Layout: 2 kolom (desktop) / 1 kolom (mobile)
- Kolom 1 (1/3): Form dengan input fields
- Kolom 2 (2/3): Peta interaktif dengan drawing tools
```

---

## 🎯 KOMPONEN YANG BISA DIEXTRACT

### A. **MapContainer Setup** (Reusable)
Semua halaman menggunakan:
- Base layers (OpenStreetMap, Satellite, Topographic)
- Desa boundary polygon
- LayersControl
- maxBounds configuration

**Solusi:** Buat component `<MapWithLayers />` atau `<BaseMapContainer />`

### B. **Data List + Search** (Reusable)
Semua halaman memiliki:
- Search input dengan icon
- Table dengan data
- Pagination/scroll
- Action buttons (Edit, Delete, View)

**Solusi:** Buat component `<DataListCard />` dengan props untuk columns

### C. **Foto Upload** (Reusable)
Digunakan di:
- Batas Wilayah (create/edit)
- Fasilitas (create)
- Lokasi Penduduk (create)

**Solusi:** Buat component `<FotoUploadField />`

### D. **Polygon/Polyline Drawing** (Reusable)
Digunakan di:
- Batas Wilayah (create/edit) - PolygonDrawer
- Fasilitas (create) - PolylineDrawer

**Solusi:** Sudah ada, tinggal reuse

### E. **Marker Icons** (Reusable)
Digunakan di:
- Fasilitas
- Lokasi Penduduk
- Bencana

**Solusi:** Sudah ada di `@/lib/map-icons`, tinggal reuse

---

## 📋 REKOMENDASI UNTUK HALAMAN BARU

### **Untuk Halaman Bencana (Create)**
Gunakan pola dari `fasilitas/create.tsx`:
- Form di kolom kiri
- Peta dengan drawing tools di kolom kanan
- Support untuk 3 tipe lokasi: titik, polygon, radius

### **Untuk Halaman Lokasi Penduduk (Create)**
Gunakan pola dari `fasilitas/create.tsx`:
- Form di kolom kiri
- Peta dengan marker placement di kolom kanan
- Foto upload field

### **Untuk Halaman Rumah (Index)**
Gunakan pola dari `lokasi-penduduk/index.tsx`:
- Peta dengan markers di kolom kanan
- Daftar dengan search di kolom kiri
- Statistics cards di atas

---

## 🔄 EFISIENSI YANG BISA DITINGKATKAN

### 1. **Extract Common Map Setup**
```typescript
// components/maps/MapWithLayers.tsx
interface MapWithLayersProps {
  center?: [number, number];
  zoom?: number;
  children?: React.ReactNode;
  overlays?: Array<{
    name: string;
    component: React.ReactNode;
  }>;
}
```

### 2. **Extract Common List Card**
```typescript
// components/DataListCard.tsx
interface DataListCardProps {
  title: string;
  searchPlaceholder: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }>;
  onRowClick?: (item: any) => void;
  actions?: Array<{
    label: string;
    onClick: (item: any) => void;
  }>;
}
```

### 3. **Extract Common Form Layout**
```typescript
// components/MapFormLayout.tsx
interface MapFormLayoutProps {
  title: string;
  formContent: React.ReactNode;
  mapContent: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}
```

---

## 📊 PERBANDINGAN UKURAN FILE

| Halaman | Lines | Reusable % |
|---------|-------|-----------|
| batas-wilayah/index.tsx | 300+ | 70% |
| bencana/berlangsung.tsx | 500+ | 75% |
| bencana/riwayat.tsx | 400+ | 75% |
| lokasi-penduduk/index.tsx | 450+ | 70% |
| fasilitas/index.tsx | 350+ | 70% |
| batas-wilayah/create.tsx | 400+ | 60% |
| fasilitas/create.tsx | 600+ | 65% |

**Potensi Pengurangan:** 40-50% dengan extraction

---

## ✅ REKOMENDASI PRIORITAS

### Priority 1: Extract Map Components
- `<BaseMapContainer />` - Setup peta standar
- `<MapLegend />` - Sudah ada, tinggal standardisasi

### Priority 2: Extract List Components
- `<DataListCard />` - Untuk semua halaman index
- `<SearchInput />` - Sudah ada, tinggal reuse

### Priority 3: Extract Form Components
- `<MapFormLayout />` - Untuk create/edit
- `<FotoUploadField />` - Untuk upload foto

### Priority 4: Extract Utilities
- `formatLuas()` - Sudah ada, tinggal reuse
- `calculateArea()` - Sudah ada, tinggal reuse
- Color constants - Standardisasi di satu tempat

---

## 🚀 IMPLEMENTASI STRATEGY

1. **Jangan refactor existing** - Biarkan berjalan
2. **Buat components baru** - Extract ke `components/`
3. **Gunakan untuk halaman baru** - Bencana create, Rumah index, dll
4. **Gradual migration** - Update existing halaman saat maintenance

---

## 📝 KESIMPULAN

**Efisiensi saat ini:** 60-70% code reuse
**Potensi efisiensi:** 80-85% dengan extraction
**Effort:** Medium (2-3 hari untuk extract semua)
**ROI:** High (menghemat 40-50% code untuk halaman baru)

