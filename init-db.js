const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Tentukan path untuk file database dan schema
const dbPath = path.join(__dirname, 'db', 'database.db');  // Nama file database
const schemaPath = path.join(__dirname, 'db', 'schema.sql'); // Nama file schema

// Buka atau buat database baru
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Gagal membuka database:", err.message);
        process.exit(1);
    }
    console.log("Database berhasil dibuat atau dibuka:", dbPath);
});

// Baca file schema
fs.readFile(schemaPath, 'utf8', (err, data) => {
    if (err) {
        console.error("Gagal membaca file schema:", err.message);
        process.exit(1);
    }

    // Jalankan perintah schema untuk membuat tabel dan struktur database
    db.exec(data, (err) => {
        if (err) {
            console.error("Gagal menjalankan schema:", err.message);
            process.exit(1);
        }
        console.log("Schema database berhasil diterapkan.");
        db.close((err) => {
            if (err) {
                console.error("Gagal menutup database:", err.message);
            } else {
                console.log("Database telah tertutup.");
            }
        });
    });
});
