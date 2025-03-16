const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

/**
 * Inisialisasi koneksi database SQLite secara Promise-based.
 */
async function initDb() {
    try {
        const db = await open({
            filename: path.join(__dirname, '../database/uwaistelur.db'),
            driver: sqlite3.Database
        });
        console.log('Database connected successfully!');
        return db;
    } catch (err) {
        console.error('Failed to connect to DB:', err);
        throw err; // Lempar error agar bisa ditangani di level atas
    }
}

module.exports = initDb(); // Ekspor hasil koneksi database
