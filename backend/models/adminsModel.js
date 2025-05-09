const dbPromise = require('../../config/db');

module.exports = {
    // 1. View semua admin
    getAllAdmins: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT *
                FROM admins
                ORDER BY datetime(
                    substr(created_at, 7, 4) || '-' || substr(created_at, 4, 2) || '-' || substr(created_at, 1, 2) || ' ' || substr(created_at, 12)
                ) DESC
            `);
        } catch (err) {
            console.error('adminsModel.getAllAdmins error:', err);
            throw err;
        }
    },

    // Ambil semua admin berdasarkan tanggal dari ID
    getAdminsByDate: async (datePart) => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT * FROM admins
                WHERE admin_id LIKE ?
            `, [`A${datePart}%`]);
        } catch (err) {
            console.error('adminsModel.getAdminsByDate error:', err);
            throw err;
        }
    },

    // Cari admin berdasarkan ID
    getByIdAdmin: async (id) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT *
                FROM admins
                WHERE admin_id = ?
            `, [id]);
        } catch (err) {
            console.error('adminsModel.getByIdAdmin error:', err);
            throw err;
        }
    },

    // Cari admin berdasarkan username (untuk login)
    getAdminByUsername: async (username) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT *
                FROM admins
                WHERE username = ?
            `, [username]);
        } catch (err) {
            console.error('adminsModel.getAdminByUsername error:', err);
            throw err;
        }
    },

    // Update data admin
    updateByIdAdmin: async (id, username, name, hashedPassword, updatedAt) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                UPDATE admins
                SET username = ?, admin_name = ?, password = ?, updated_at = ?
                WHERE admin_id = ?
            `, [username, name, hashedPassword, updatedAt, id]);
        } catch (err) {
            console.error('adminsModel.updateByIdAdmin error:', err);
            throw err;
        }
    },

    // Tambah admin baru
    createAdmin: async (adminId, username, name, hashedPassword, createdAt, updatedAt) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO admins (admin_id, username, admin_name, password, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [adminId, username, name, hashedPassword, createdAt, updatedAt]);
        } catch (err) {
            console.error('adminsModel.createAdmin error:', err);
            throw err;
        }
    },

    // Hapus admin
    deleteAdmin: async (id) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                DELETE FROM admins WHERE admin_id = ?
            `, [id]);
        } catch (err) {
            console.error('adminsModel.deleteAdmin error:', err);
            throw err;
        }
    },

    // Pencarian & paginasi admin
    getAdminsPaginated: async (searchTerm, limit, offset) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT * FROM admins
                WHERE 
                    admin_name LIKE ? OR
                    username LIKE ? OR
                    admin_id LIKE ? OR
                    created_at LIKE ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, limit, offset]);
        } catch (err) {
            console.error('adminsModel.getAdminsPaginated error:', err);
            throw err;
        }
    },

    // Hitung jumlah total admin (untuk pagination)
    countAdmins: async (searchTerm) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT COUNT(*) as total FROM admins
                WHERE 
                    admin_name LIKE ? OR
                    username LIKE ? OR
                    admin_id LIKE ? OR
                    created_at LIKE ?
            `;
            const result = await db.get(query, [wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch]);
            return result.total;
        } catch (err) {
            console.error('adminsModel.countAdmins error:', err);
            throw err;
        }
    }
};