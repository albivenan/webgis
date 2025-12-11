# 🧭 Sistem Informasi Geospasial & Kependudukan

> Aplikasi berbasis web untuk visualisasi dan manajemen data kependudukan, fasilitas, lahan, serta informasi bencana berbasis peta interaktif.  
> Dikembangkan dengan **React + Laravel Ziggy + Leaflet**, mendukung integrasi data spasial (GeoJSON) dari QGIS.

---

## 🌟 **Deskripsi Singkat**

**Sidebar Navigasi** adalah komponen utama yang menjadi pusat akses untuk seluruh modul dalam sistem ini.  
Dirancang agar mudah digunakan dan responsif, sidebar menyediakan navigasi terstruktur menuju fitur-fitur seperti **Dashboard**, **Peta Interaktif**, **Manajemen Kependudukan**, dan **Informasi Bencana**.

Aplikasi ini cocok digunakan oleh instansi pemerintahan, lembaga riset, atau pengembang sistem informasi berbasis GIS (Geographic Information System).

---

## 🚀 **Fitur Utama**

### 1. **Dashboard Interaktif**
- Menampilkan metrik dan statistik utama secara real-time.
- Titik awal untuk navigasi ke seluruh modul sistem.
- Menyediakan insight cepat tentang status data kependudukan, lahan, dan fasilitas.

---

### 2. **Visualisasi Peta Komprehensif**
- Menggunakan **`react-leaflet`** untuk rendering peta interaktif dan dinamis.
- Mendukung berbagai layer:
  - Lokasi penduduk  
  - Fasilitas umum & privat  
  - Jalan & infrastruktur  
  - Batas wilayah & lahan  
  - Titik bencana dan area terdampak
- Mendukung **zoom**, **pan**, **marker interaktif**, serta overlay **polygon GeoJSON**.

---

### 3. **Manajemen Data Kependudukan**
- **Lokasi Penduduk:** menampilkan persebaran penduduk berdasarkan koordinat spasial.  
- **Data Kartu Keluarga (KK):** mengelola dan menampilkan detail anggota keluarga.  
- **Analisis Demografi:** visualisasi perbandingan jumlah penduduk berdasarkan usia, jenis kelamin, dan wilayah.

---

### 4. **Manajemen Fasilitas Terpadu**
- Kategori fasilitas:
  - 🏛️ **Umum:** sekolah, rumah sakit, kantor pemerintahan.  
  - 🏠 **Privat:** rumah tinggal, usaha, bangunan pribadi.  
  - 🚧 **Jalan:** infrastruktur publik seperti jalan raya atau gang.  
- CRUD data fasilitas dengan lokasi peta interaktif.

---

### 5. **Pengelolaan Lahan & Batas Wilayah**
- Modul **Kelola Lahan** menggantikan "Batas Wilayah" dengan tampilan poligon spasial.  
- Memungkinkan edit langsung di peta (draw & edit polygon).  
- Menampilkan batas administratif seperti RT, RW, desa, dan kecamatan.

---

### 6. **Informasi & Manajemen Bencana**
- **Tragedi Berlangsung:** menampilkan data real-time lokasi bencana aktif.  
- **Riwayat Tragedi:** arsip dan analisis kejadian masa lalu untuk mitigasi.  
- Integrasi dengan koordinat spasial untuk pelacakan cepat di peta.

---

### 7. **Pengaturan & Manajemen Pengguna**
- Modul **Manajemen User** untuk akun, peran (role), dan izin akses.
- Integrasi penuh dengan **Laravel Ziggy** memastikan sinkronisasi rute antara backend dan frontend.

---

## 🎨 **Keunggulan & Manfaat**

| Aspek | Penjelasan |
|-------|-------------|
| **UX Modern & Responsif** | Sidebar dapat diciutkan (collapsible) untuk menyesuaikan tampilan layar. |
| **Integrasi Backend Kuat** | Komunikasi mulus antara React dan Laravel melalui Ziggy routes. |
| **Struktur Navigasi Logis** | Menu dengan ikon intuitif dari `lucide-react` memudahkan orientasi pengguna. |
| **Data Terorganisir** | Pengelompokan fitur ke dalam kategori tematik meningkatkan efisiensi kerja. |
| **Skalabilitas Tinggi** | Mudah dikembangkan untuk modul baru seperti statistik wilayah atau laporan tematik. |

---

## 🧩 **Teknologi yang Digunakan**

| Kategori | Teknologi |
|-----------|------------|
| **Frontend** | React, TypeScript, TailwindCSS |
| **Peta & GIS** | React-Leaflet, GeoJSON, QGIS |
| **Backend** | Laravel + Ziggy (Routing Integrasi) |
| **UI Library** | ShadCN/UI, Lucide-React Icons |
| **Manajemen Paket** | NPM / Yarn |
| **Version Control** | Git & GitHub |

---

## ⚙️ **Instalasi & Konfigurasi**

### 🔧 **1. Clone Repository**
```bash
git clone https://github.com/username/nama-repo.git
cd nama-repo
````

### 💻 **2. Instal Dependensi Frontend**

```bash
npm install
# atau
yarn install
```

### 🧠 **3. Jalankan Aplikasi**

```bash
npm run dev
# atau
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173` (jika menggunakan Vite) atau sesuai konfigurasi server lokal Anda.

---

## 🗺️ **Menggunakan Data GeoJSON dari QGIS**

1. Buka data spasial di **QGIS**.
2. Klik kanan layer → **Export → Save Features As...** → pilih format `GeoJSON`.
3. Simpan file dan import ke aplikasi melalui folder `public/data/`.
4. Gunakan `react-leaflet` untuk memuat file:

   ```tsx
   <GeoJSON data={geojsonData} />
   ```

---

## 📸 **Tangkapan Layar (Screenshots)**

| Tampilan                                                | Deskripsi                                       |
| ------------------------------------------------------- | ----------------------------------------------- |
| ![Dashboard](https://via.placeholder.com/400x220)       | Dashboard interaktif dengan ringkasan data      |
| ![Peta Interaktif](https://via.placeholder.com/400x220) | Modul peta React-Leaflet dengan GeoJSON         |
| ![Sidebar](https://via.placeholder.com/400x220)         | Sidebar navigasi collapsible dengan ikon Lucide |

*(Ganti placeholder di atas dengan screenshot aplikasi Anda)*

---

## 🤝 **Kontribusi**

Kontribusi sangat terbuka!
Silakan buat **Pull Request (PR)** atau **Issue** jika ingin:

* Menambah fitur baru
* Memperbaiki bug
* Mengoptimalkan kinerja atau tampilan UI

Langkah umum kontribusi:

```bash
git checkout -b feature/nama-fitur
git commit -m "Menambahkan fitur X"
git push origin feature/nama-fitur
```

---

## 📄 **Lisensi**

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## 👨‍💻 **Pengembang**

**Gei Zhinjian Albivenanza**
Informatics Engineering — Universitas Islam Nahdlatul Ulama Jepara (UNISNU)
📍 Fokus: ERP, GIS, dan Sistem Informasi Berbasis Web & Mobile
🌐 [LinkedIn](https://linkedin.com) • [GitHub](https://github.com/username)

---

> 💬 *“Membangun sistem berbasis data spasial untuk keputusan yang lebih cerdas.”*

---

```
