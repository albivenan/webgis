# 🧭 Sistem Informasi Geospasial & Kependudukan

> Aplikasi berbasis web untuk visualisasi dan manajemen data kependudukan, fasilitas, lahan, serta informasi bencana berbasis peta interaktif dengan kemampuan pelacakan lokasi secara real-time.  
> Dikembangkan dengan **React + Laravel Ziggy + Leaflet**, mendukung integrasi data spasial (GeoJSON) dari QGIS.

---

## 🌟 **Deskripsi Singkat**

**Sistem Informasi Geospasial** ini dirancang untuk memberikan kemudahan dalam manajemen data berbasis wilayah. Dengan integrasi fitur **Pencarian Lokasi Real-time**, pengguna kini dapat menemukan titik koordinat spesifik atau melacak posisi perangkat secara langsung di atas peta interaktif.

Aplikasi ini sangat ideal untuk instansi pemerintahan, lembaga riset, atau pengembang yang membutuhkan akurasi data spasial tinggi untuk pengambilan keputusan.

---

## 🚀 **Fitur Utama**

### 1. **Pencarian & Pelacakan Lokasi Real-time** 🆕
- **Smart Search:** Mencari lokasi, alamat, atau fasilitas secara instan dengan fitur auto-suggest.
- **Geolocation:** Melacak posisi pengguna saat ini secara real-time menggunakan GPS/Network provider.
- **Auto-Focus:** Peta secara otomatis melakukan *zoom* dan *panning* ke lokasi yang ditemukan atau posisi pengguna.

---

### 2. **Dashboard Interaktif**
- Menampilkan metrik dan statistik utama secara real-time.
- Titik awal untuk navigasi ke seluruh modul sistem.
- Menyediakan insight cepat tentang status data kependudukan, lahan, dan fasilitas.

---

### 3. **Visualisasi Peta Komprehensif**
- Menggunakan **`react-leaflet`** untuk rendering peta interaktif dan dinamis.
- Mendukung berbagai layer:
  - Lokasi penduduk  
  - Fasilitas umum & privat  
  - Jalan & infrastruktur  
  - Batas wilayah & lahan  
  - Titik bencana dan area terdampak
- Mendukung **zoom**, **pan**, **marker interaktif**, serta overlay **polygon GeoJSON**.

---

### 4. **Manajemen Data Kependudukan**
- **Lokasi Penduduk:** menampilkan persebaran penduduk berdasarkan koordinat spasial.  
- **Data Kartu Keluarga (KK):** mengelola dan menampilkan detail anggota keluarga.  
- **Analisis Demografi:** visualisasi perbandingan jumlah penduduk berdasarkan usia, jenis kelamin, dan wilayah.

---

### 5. **Manajemen Fasilitas Terpadu**
- Kategori fasilitas:
  - 🏛️ **Umum:** sekolah, rumah sakit, kantor pemerintahan.  
  - 🏠 **Privat:** rumah tinggal, usaha, bangunan pribadi.  
  - 🚧 **Jalan:** infrastruktur publik seperti jalan raya atau gang.  
- CRUD data fasilitas dengan lokasi peta interaktif.

---

### 6. **Pengelolaan Lahan & Batas Wilayah**
- Modul **Kelola Lahan** menampilkan batas administratif (RT, RW, Desa) dalam bentuk poligon spasial.  
- Memungkinkan edit langsung di peta (*draw & edit polygon*).

---

### 7. **Informasi & Manajemen Bencana**
- **Tragedi Berlangsung:** menampilkan data real-time lokasi bencana aktif.  
- **Riwayat Tragedi:** arsip dan analisis kejadian masa lalu untuk mitigasi.  
- Integrasi dengan koordinat spasial untuk pelacakan cepat di peta.

---

### 8. **Pengaturan & Manajemen Pengguna**
- Modul **Manajemen User** untuk akun, peran (role), dan izin akses.
- Integrasi penuh dengan **Laravel Ziggy** untuk sinkronisasi rute.

---

## 🎨 **Keunggulan & Manfaat**

| Aspek | Penjelasan |
|-------|-------------|
| **Pencarian Cepat** | Menemukan data kependudukan atau lahan dalam hitungan detik. |
| **Akurasi Real-time** | Mendukung pelacakan posisi terkini untuk keperluan lapangan. |
| **UX Modern & Responsif** | Sidebar dapat diciutkan (collapsible) untuk menyesuaikan layar. |
| **Integrasi Backend** | Komunikasi mulus antara React dan Laravel melalui Ziggy routes. |
| **Skalabilitas** | Mudah dikembangkan untuk modul baru seperti laporan tematik. |

---

## 🧩 **Teknologi yang Digunakan**

| Kategori | Teknologi |
|-----------|------------|
| **Frontend** | React, TypeScript, TailwindCSS |
| **Peta & GIS** | React-Leaflet, Leaflet Control Search, GeoJSON |
| **Backend** | Laravel + Ziggy (Routing Integrasi) |
| **UI Library** | ShadCN/UI, Lucide-React Icons |
| **Version Control** | Git & GitHub |

---

## ⚙️ **Instalasi & Konfigurasi**

### 🔧 **1. Clone Repository**
```bash
git clone [https://github.com/username/nama-repo.git](https://github.com/username/nama-repo.git)
cd nama-repo
