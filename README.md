# u.park by UNIGA 🚗🛵⚡
### Sistem Smart Parking & Booking Slot Parkir Universitas Garut
*Mobile-First Web Application (Tugas IoT / Smart Campus Universitas Garut)*

Aplikasi web mobile-first yang fungsional, interaktif, dan modern untuk sistem pemesanan slot parkir terintegrasi gerbang IoT di **Universitas Garut (UNIGA)**. Mengadaptasi penuh palet warna dan tema visual **M-Tix (Dark Teal & Black Gradient)** dengan tipografi modern **Google Fonts 'Plus Jakarta Sans'** dan **'Outfit'**.

---

## 🎨 Palet Warna & Visual Theme (Konsisten)

| Komponen | Kode Warna | Deskripsi Visual |
| :--- | :--- | :--- |
| **Background Utama** | Linear Gradient `#05090C` ke `#0B252A` | Hitam pekat di atas menuju Dark Teal di tengah dan bawah |
| **Card & Elemen UI** | `#112A30` (Border: `#224952`) | M-Tix Teal Container dengan efek blur dan subtle border |
| **Aksen Utama** | `#26A69A` & `#4DB6AC` | Cyan & Teal neon khas u.park UNIGA |
| **Slot `Available`** | `#1C3338` (Teks `#78909C`) | Slot kosong siap dipesan |
| **Slot `On hold`** | `#E2E8F0` (Teks `#0F172A`) | Slot sedang dipilih / menunggu scan QR gerbang (Putih menyala) |
| **Slot `Taken`** | `#C84B31` (Teks `#FFFFFF`) | Slot sudah scan QR & terisi kendaraan (Merah Bata / Oranye Gelap) |
| **Slot `Not Available`**| `#64748B` (Teks `#94A3B8`) | Slot dalam pemeliharaan / ditutup |

---

## 🚀 Alur Kerja Sistem (5 Alur Terintegrasi)

### 1. Alur Autentikasi (Wajib Pertama Kali)
- Muncul pertama kali saat aplikasi dibuka (halaman beranda terkunci sebelum login).
- **Tab Switcher:** Pilihan "Masuk" dan "Daftar Akun".
- **Form Pendaftaran:**
  - Nama Lengkap, NPM (`240611001`), Nomor WhatsApp.
  - Password & Konfirmasi Password dengan indikator kecocokan realtime.
  - Tombol ikon mata (Eye/EyeOff) untuk memperlihatkan dan menyembunyikan teks password di kedua kolom.
- **Verifikasi OTP:**
  - 6 Digit kotak kode OTP dengan countdown timer 60 detik.
  - Bantuan presentasi: *"Mode Demo: Masukkan kode OTP 123456"* dan tombol 1-klik **Auto-Fill OTP**.

### 2. Alur Beranda (M-Tix Style, Bersih & Fokus Booking)
- **Header:** Logo tebal **"u.park by UNIGA"** dan pill badge **"UNIGA"** (Lokasi terpadu).
- **Banner Status IoT & Status Akun:**
  - Status koneksi gate IoT live: *"IoT QR Gate Scanner UNIGA: Online"* dengan pulsing green dot.
  - Status Akun: *"Status Akun: Aktif (Bisa Booking)"* atau *"Status Akun: DIBEKUKAN"*.
- **3 Menu Utama:**
  - 🚗 **Parkir Mobil** (Emas/Kuning): Denah 40 slot mobil.
  - 🛵 **Parkir Motor** (Cyan/Teal): Denah 80 slot motor.
  - ⚡ **Simulasi Scanner IoT** (Oranye): Lab uji coba gerbang dan pembekuan akun.
- **Pilih Area Parkir (2 Area Terpusat):**
  - Card 1: Area Parkir Mobil UNIGA (Kapasitas 40 Slot, counter sisa kosong, bar kapasitas).
  - Card 2: Area Parkir Motor UNIGA (Kapasitas 80 Slot, counter sisa kosong, bar kapasitas).
- **Bottom Navigation Bar:** Tab **Home**, **Tiket QR** (dengan notifikasi badge aktif), dan **Profil**.

### 3. Alur Denah Booking Slot (Layout Bioskop)
- **Header:** Back button, judul area, lokasi terpadu UNIGA, serta tanggal dan jam *realtime* (WIB).
- **Penanda Gerbang:** Trapesium putih menyala (*glowing barrier bar*) bertuliskan **"GERBANG MASUK & SCANNER QR IOT"** dengan arah panah masuk kendaraan.
- **Grid Slot Parkir:**
  - 2 blok (kiri dan kanan) terpisah jalur tengah (jalan mobil/motor).
  - **Mobil:** 40 slot (`A1` s/d `E8`).
  - **Motor:** 80 slot (`M1-01` s/d `M5-16`), kotak rapat bergaya kursi bioskop.
  - Slot kosong berubah menjadi putih terang (`On hold`) saat diklik.
  - Bar legend status di bagian bawah.

### 4. Sistem QR Code, Countdown 15 Menit & Pembekuan Akun
- **Aturan 1 NPM = Maksimal 1 Slot Aktif:** Mencegah penimbunan slot parkir.
- **Konfirmasi Booking:** Mengisi/memverifikasi Plat Nomor Kendaraan (contoh: `Z 1234 GAR`).
- **Tiket QR Pass:**
  - Tampilan tiket bioskop dengan garis sobekan perforasi.
  - Scannable dynamic QR Code.
  - Hitung mundur **15:00 menit** realtime.
- **Mekanisme Check-in Gerbang IoT:**
  - Tombol *"Simulasikan Scan QR di Gerbang Parkir (IoT Gate)"*.
  - Suara chime gembira (*Web Audio API*), palang gerbang terbuka 90°, lampu hijau menyala.
  - Timer 15 menit otomatis berhenti, status tiket menjadi *PARKIR AKTIF*, dan slot di denah berubah dari putih (`On hold`) menjadi merah bata (`Taken`).
  - Tombol berubah menjadi opsi *Check-out* untuk membebaskan slot saat keluar parkir.
- **Mekanisme Sanksi Pembekuan Akun (>15 Menit):**
  - Tombol demo *"Simulasikan Waktu Habis (>15 Menit)"*.
  - Suara buzzer peringatan.
  - Booking hangus, slot kembali hijau/teal gelap (`Available`).
  - Status Akun NPM berubah menjadi **DIBEKUKAN**.
  - Mahasiswa diblokir dari pemesanan slot baru (muncul peringatan merah).
  - Tombol pemulihan *"Reset / Buka Pembekuan Akun (Mode Demo)"* tersedia di Profil & Lab IoT.

### 5. Lab Simulator IoT
- Animasi servo motor palang gerbang (rotasi 0° hingga 90°).
- Indikator lampu LED merah dan hijau.
- Simulasi pembacaan jarak sensor ultrasonik.
- Live Telemetry MQTT / Hardware Event Log.

---

## 📁 Struktur Berkas

```text
upark-uniga/
├── index.html        # Struktur HTML5 Single-Page Application (PWA ready)
├── styles.css        # Desain visual M-Tix Dark Teal & Black Gradient, responsif smartphone
├── app.js            # Engine logika, state management, timer 15m, audio sintesis, booking rules
├── qrcode.js         # Pure JS Standalone Dynamic QR Code generator (100% offline)
├── start_server.ps1  # Server lokal bawaan PowerShell (.NET HttpListener) untuk tes di HP
├── test_flows.js     # Skrip pengujian otomatis (100% Pass)
└── README.md         # Dokumentasi teknis dan panduan presentasi
```

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi dibuat tanpa ketergantungan node_modules eksternal sehingga dapat langsung dibuka:

### Opsi 1: Langsung Buka File (Offline / Tanpa Instalasi)
Cukup **klik dua kali** berkas `index.html` pada browser apa saja (Google Chrome, Microsoft Edge, Safari, Firefox).

### Opsi 2: Jalankan Local Server (Bisa Dibuka di Smartphone Asli)
Jika ingin menguji langsung dari smartphone melalui jaringan WiFi yang sama:
1. Klik kanan pada `start_server.ps1` -> **Run with PowerShell**  
   *(atau buka PowerShell dan jalankan: `powershell -ExecutionPolicy Bypass -File .\start_server.ps1`)*
2. Terminal akan menampilkan IP lokal laptop Anda (contoh: `http://192.168.1.15:8080`).
3. Buka alamat tersebut di browser smartphone Anda untuk pengalaman interaktif penuh!

---

## 🎓 Kredensial Uji Coba (Mode Demo Presentasi)

| Parameter | Nilai Demo |
| :--- | :--- |
| **NPM Mahasiswa** | `240611001` |
| **Password** | `uniga123` |
| **Kode OTP** | `123456` (tersedia tombol Auto-Fill) |
| **Nomor Plat** | `Z 1234 GAR` |
| **Batas Waktu Scan** | `15:00` Menit |
