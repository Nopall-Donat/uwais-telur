const db = require('../../config/db'); // Pastikan file ini mengekspor koneksi sqlite3

const SalesModel = {
    // Fungsi untuk mengambil semua data transaksi sales
    getAll: (callback) => {
        const query = `SELECT * FROM sales_transactions`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error mengambil data transaksi sales:', err);
                return callback(err, null);
            }
            callback(null, rows);
        });
    }
};

module.exports = SalesModel;
