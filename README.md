# HoloNight

Proyek website bertema Hollow Knight oleh:
- Backend : Nathanael Jovan Wahyudi
- Frontend : Muhammad Umar Faiz Alfa Rizqy

## Struktur File

### HTML Files
- **index.html** - Halaman utama dengan menu Login dan Register
- **login.html** - Halaman form login dengan validasi
- **register.html** - Halaman form registrasi dengan validasi

### CSS Files (folder: style/)
- **style.css** - Styling untuk halaman utama (index.html)
- **login.css** - Styling untuk halaman login dan register

### Assets (folder: src/)
- **background/login.mp4** - Video background untuk semua halaman
- **img/logo.png** - Logo Hollow Knight untuk halaman utama
- **img/line1.png** - Garis dekoratif pemisah
- **img/input.png** - Background untuk input field (opsional)

### Fonts (folder: fonts/)
- **Cinzel-SemiBold.ttf** - Font utama untuk semua teks

## Fitur

### Halaman Index
- Video background dengan overlay gradient
- Logo Hollow Knight
- Menu navigasi ke Login dan Register
- Hover effect pada menu

### Halaman Login
- Form login dengan username dan password
- Validasi kredensial (Username: `knight`, Password: `hollownest`)
- Pesan error jika login gagal
- Tombol Back untuk kembali ke halaman utama

### Halaman Register
- Form registrasi dengan 4 field:
  - Username
  - Email
  - Password
  - Confirm Password
- Validasi:
  - Cek user sudah terdaftar
  - Password minimal 6 karakter
  - Password harus sama dengan Confirm Password
- Data disimpan di localStorage
- Pesan sukses/error
- Auto redirect ke login setelah berhasil register

## Teknologi
- HTML5
- CSS3
- JavaScript (Vanilla)
- MySQL

## Desain
- Tema: Dark dengan gradient biru
- Font: Cinzel (elegan dan fantasy)
- Efek: Glow, shadow, dan hover animations
- Responsive design

## Tools digunakan
- Figma
- Photoshop

