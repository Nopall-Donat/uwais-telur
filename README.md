📦 UWAIS TELUR - Aplikasi Penjualan Telur Berbasis Web

📌 Deskripsi Singkat:
Uwais Telur adalah aplikasi berbasis web yang dikembangkan untuk membantu UMKM agen telur dalam mencatat transaksi penjualan, pembelian, pengelolaan stok, data pelanggan, suplier, serta pencetakan nota transaksi. Proyek ini dikembangkan sebagai Tugas Akhir Mahasiswa Sistem Informasi dengan metode Rapid Application Development (RAD).

✨ Fitur-Fitur Utama:
1️⃣ Pencatatan transaksi penjualan
2️⃣ Manajemen data pelanggan
3️⃣ Manajemen data suplier
4️⃣ Pengelolaan stok barang
5️⃣ Pencatatan pembelian ke suplier
6️⃣ Pencetakan nota transaksi (bisa print)
7️⃣ Dashboard ringkasan transaksi & stok
8️⃣ Fitur pencarian, filter, dropdown limit, dan pagination
9️⃣ Validasi input dan umpan balik alert pengguna

🛠️ Teknologi yang Digunakan:
🔹 Backend: Node.js + ExpressJS
🔹 Frontend: EJS Template + Bootstrap (NiceAdmin)
🔹 Database: SQLite (bisa dikembangkan ke MySQL)
🔹 Arsitektur: Model-View-Controller (MVC)

📂 Struktur Folder Proyek (disederhanakan):
1. backend → controller & model
2. routes → endpoint per modul
3. CLIENT/views → tampilan HTML (EJS)
4. CLIENT/assets → CSS, JS, gambar
5. config → koneksi & konfigurasi DB
6. uwaistelur.db → database SQLite lokal
7. app.js → file utama backend server
8. package.json → konfigurasi dependensi node
9. README.txt → file dokumentasi ini

🚀 Cara Menjalankan Aplikasi:
1. Clone repositori:
   git clone https://github.com/Nopall-Donat/uwais-telur.git

2. Masuk ke folder dan install dependensi:
   cd uwais-telur
   npm install

3. Jalankan server lokal:
   node app.js

4. Akses aplikasi melalui browser:
   http://localhost:3000

🧪 Metode Pengujian:
🔸 Blackbox Testing: Pengujian fungsi utama tanpa melihat kode program
🔸 UAT (User Acceptance Testing):
   - Alpha Testing: oleh pengembang (uji fungsi & logika)
   - Beta Testing: oleh pengguna akhir (admin toko)
🔸 Instrumen: Checklist uji fitur, observasi langsung, kuisioner kepuasan

👨‍💻 Developer:
Nama: Muhammad Naufal Arif
Program Studi: Sistem Informasi
Universitas: Sekolah Tinggi Teknologi Terpadu Nurul Fikri
Tahun: 2025

📄 Lisensi:
Repositori ini dibuat untuk keperluan akademik (Tugas Akhir) dan tidak diperbolehkan digunakan untuk tujuan komersial tanpa izin tertulis dari pengembang.
