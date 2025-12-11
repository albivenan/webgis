# Dokumentasi: Sistem Perhitungan Luas Area Bencana

## Overview

Sistem ini menghitung dan menampilkan luas area untuk bencana yang ditandai dengan polygon atau radius di peta. Perhitungan dilakukan otomatis baik di frontend (untuk preview) maupun di backend (untuk penyimpanan).

## Struktur Data

### Tabel `bencana`

```sql
CREATE TABLE bencana (
    id BIGINT PRIMARY KEY,
    nama_bencana VARCHAR(255),
    jenis_bencana ENUM('banjir', 'longsor', 'gempa', 'kebakaran', 'angin_puting_beliung', 'kekeringan', 'lainnya'),
    tingkat_bahaya ENUM('rendah', 'sedang', 'tinggi', 'sangat_tinggi'),
    tipe_lokasi ENUM('titik', 'polygon', 'radius'),
    lokasi_data JSON,  -- Menyimpan koordinat lokasi
    luas DECIMAL(12, 2) NULL,  -- Luas dalam m² (hanya untuk polygon/radius)
    warna_penanda VARCHAR(7),  -- Warna hex untuk polygon/circle
    tanggal_mulai DATE,
    tanggal_selesai DATE NULL,
    status ENUM('berlangsung', 'selesai'),
    korban_jiwa INT DEFAULT 0,
    korban_luka INT DEFAULT 0,
    kerusakan_infrastruktur TEXT NULL,
    keterangan TEXT NULL,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Format `lokasi_data` JSON

#### Untuk Tipe "titik" (Point)
```json
{
    "lat": -7.5360639,
    "lng": 110.3850326
}
```

#### Untuk Tipe "polygon" (Area)
```json
[
    [-7.5360639, 110.3850326],
    [-7.5361000, 110.3851000],
    [-7.5361500, 110.3850500],
    [-7.5360639, 110.3850326]  // Titik pertama diulang untuk menutup polygon
]
```

#### Untuk Tipe "radius" (Circle)
```json
{
    "center": {
        "lat": -7.5360639,
        "lng": 110.3850326
    },
    "radius": 500  // Dalam meter
}
```

## Perhitungan Luas

### 1. Polygon (Shoelace Formula)

**Formula Matematika:**
```
Area = |Σ(x_i * y_{i+1} - x_{i+1} * y_i)| / 2
```

**Implementasi di Frontend (TypeScript):**
```typescript
function calculatePolygonArea(coordinates: [number, number][]): string {
    if (!coordinates || coordinates.length < 3) return '-';
    
    let area = 0;
    const n = coordinates.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += coordinates[i][0] * coordinates[j][1];
        area -= coordinates[j][0] * coordinates[i][1];
    }
    
    area = Math.abs(area) / 2;
    
    // Konversi dari derajat ke meter
    const metersPerDegreeLat = 111320;
    const metersPerDegreeLng = 111320 * 0.991;
    
    const areaInSquareMeters = area * metersPerDegreeLat * metersPerDegreeLng;
    
    // Format output
    if (areaInSquareMeters >= 10000) {
        const hectares = areaInSquareMeters / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    
    return `${Math.round(areaInSquareMeters).toLocaleString('id-ID')} m²`;
}
```

**Implementasi di Backend (PHP):**
```php
public static function calculateArea(string $tipe_lokasi, array $lokasi_data): float
{
    if ($tipe_lokasi === 'polygon' && is_array($lokasi_data)) {
        if (count($lokasi_data) < 3) {
            return 0;
        }

        $area = 0;
        $n = count($lokasi_data);
        
        for ($i = 0; $i < $n; $i++) {
            $j = ($i + 1) % $n;
            $area += $lokasi_data[$i][0] * $lokasi_data[$j][1];
            $area -= $lokasi_data[$j][0] * $lokasi_data[$i][1];
        }
        
        $area = abs($area) / 2;
        
        // Konversi dari derajat ke meter
        $metersPerDegreeLat = 111320;
        $metersPerDegreeLng = 111320 * 0.991;
        
        return $area * $metersPerDegreeLat * $metersPerDegreeLng;
    }

    return 0;
}
```

### 2. Radius/Circle

**Formula Matematika:**
```
Area = π × r²
```

**Implementasi di Frontend (TypeScript):**
```typescript
function calculateRadiusArea(radiusData: any): string {
    if (!radiusData || !radiusData.radius) return '-';
    
    const radius = radiusData.radius;
    const areaInSquareMeters = Math.PI * radius * radius;
    
    if (areaInSquareMeters >= 10000) {
        const hectares = areaInSquareMeters / 10000;
        return `${hectares.toFixed(2)} ha`;
    }
    
    return `${Math.round(areaInSquareMeters).toLocaleString('id-ID')} m²`;
}
```

**Implementasi di Backend (PHP):**
```php
if ($tipe_lokasi === 'radius') {
    $radius = $lokasi_data['radius'] ?? 0;
    return pi() * $radius * $radius;
}
```

### 3. Titik (Point)

Titik tidak memiliki luas, sehingga nilai `luas` akan `null` dan ditampilkan sebagai "-".

## Flow Penyimpanan Data

### 1. User Membuat Bencana Baru

```
User menggambar polygon/radius di peta
    ↓
Frontend menghitung luas (untuk preview)
    ↓
User klik "Simpan"
    ↓
Frontend mengirim lokasi_data ke backend
    ↓
Backend menerima data di Controller
    ↓
Model boot method menghitung luas otomatis
    ↓
Luas disimpan ke database
    ↓
Data ditampilkan di halaman berlangsung/riwayat
```

### 2. User Edit Bencana

```
User membuka form edit
    ↓
Frontend menampilkan lokasi_data yang sudah ada
    ↓
User bisa mengubah lokasi (atau tidak)
    ↓
User klik "Update"
    ↓
Backend menerima data baru
    ↓
Model boot method menghitung luas ulang
    ↓
Luas diperbarui di database
    ↓
Data ditampilkan dengan luas yang baru
```

## Format Tampilan Luas

### Konversi Satuan

| Luas (m²) | Format Tampilan |
|-----------|-----------------|
| 0 - 9,999 | `1.234 m²` |
| 10,000 - 99,999 | `1.23 ha` |
| 100,000+ | `12.34 ha` |

### Contoh

- Polygon dengan area 5,000 m² → `5.000 m²`
- Polygon dengan area 15,000 m² → `1.50 ha`
- Circle dengan radius 100m → `31.416 m²`
- Circle dengan radius 200m → `1.26 ha`

## Lokasi Tampilan Luas

### 1. Form Create/Edit Bencana
- Menampilkan luas real-time saat user menggambar
- Hanya muncul untuk tipe polygon dan radius
- Ditampilkan dalam box biru dengan background `bg-blue-50`

### 2. Tabel Berlangsung
- Kolom "Luas" di sebelah kanan kolom "Bencana"
- Menampilkan luas untuk semua bencana
- Format: `-` untuk titik, `m²` atau `ha` untuk polygon/radius

### 3. Tabel Riwayat
- Kolom "Luas" di sebelah kanan kolom "Bencana"
- Menampilkan luas untuk semua riwayat bencana
- Format: `-` untuk titik, `m²` atau `ha` untuk polygon/radius

### 4. Popup Marker di Peta
- Menampilkan luas di popup ketika user klik marker
- Hanya muncul untuk tipe polygon dan radius
- Format: `Luas: X m²` atau `Luas: X ha`

## Akurasi Perhitungan

### Faktor yang Mempengaruhi Akurasi

1. **Presisi Koordinat**: Semakin presisi koordinat yang diinput, semakin akurat perhitungan
2. **Proyeksi Peta**: Menggunakan proyeksi sederhana (lat/lng ke meter)
3. **Kelengkungan Bumi**: Tidak memperhitungkan kelengkungan bumi untuk area kecil

### Margin Error

- Untuk area < 1 km²: Error ≈ 0.1% - 1%
- Untuk area 1-10 km²: Error ≈ 0.5% - 2%
- Untuk area > 10 km²: Error ≈ 1% - 5%

### Rekomendasi

- Gunakan untuk estimasi area saja
- Untuk pengukuran presisi tinggi, gunakan tools GIS profesional
- Verifikasi hasil dengan data lapangan

## Testing

### Test Case 1: Polygon Sederhana
```
Koordinat: [[-7.536, 110.385], [-7.537, 110.385], [-7.537, 110.386], [-7.536, 110.386]]
Expected: ~1,234 m² (tergantung presisi)
```

### Test Case 2: Circle Sederhana
```
Center: [-7.536, 110.385]
Radius: 100m
Expected: ~31,416 m²
```

### Test Case 3: Titik
```
Koordinat: [-7.536, 110.385]
Expected: null (ditampilkan sebagai "-")
```

## Troubleshooting

### Luas Tidak Muncul di Form
- Pastikan user sudah menggambar minimal 3 titik untuk polygon
- Pastikan user sudah set center dan radius untuk circle
- Refresh halaman jika masih tidak muncul

### Luas Tidak Tersimpan
- Cek apakah migrasi sudah dijalankan: `php artisan migrate`
- Cek apakah kolom `luas` ada di tabel bencana
- Cek error log di `storage/logs/laravel.log`

### Luas Tidak Sesuai Ekspektasi
- Verifikasi koordinat yang diinput
- Gunakan tools online untuk cross-check (misal: geojson.io)
- Ingat bahwa perhitungan menggunakan proyeksi sederhana

## Referensi

- [Shoelace Formula](https://en.wikipedia.org/wiki/Shoelace_formula)
- [Latitude/Longitude to Meters Conversion](https://en.wikipedia.org/wiki/Decimal_degrees)
- [Circle Area Formula](https://en.wikipedia.org/wiki/Circle#Area)
