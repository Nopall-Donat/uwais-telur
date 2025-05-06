const dbPromise = require('../../config/db');

module.exports = {
    // 1. View semua supplier
    getAllSupplier: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT *
                FROM suppliers
                ORDER BY datetime(
                    substr(created_at, 7, 4) || '-' || substr(created_at, 4, 2) || '-' || substr(created_at, 1, 2) || ' ' || substr(created_at, 12)
                ) DESC
            `);
        } catch (err) {
            console.error('supplierModel.getAllSupplier error:', err);
            throw err;
        }
    },

    // 2. Ambil semua supplier berdasarkan tanggal di ID (Sddmmyy%)
    getSuppliersByDate: async (datePart) => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT * FROM suppliers
                WHERE supplier_id LIKE ?
            `, [`S${datePart}%`]);
        } catch (err) {
            console.error('supplierModel.getSuppliersByDate error:', err);
            throw err;
        }
    },

    // 3. Cari satu supplier berdasarkan ID
    getByIdSupplier: async (id) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT *
                FROM suppliers
                WHERE supplier_id = ?
            `, [id]);
        } catch (err) {
            console.error('supplierModel.getByIdSupplier error:', err);
            throw err;
        }
    },

    // 4. Update supplier by ID
    updateByIdSupplier: async (id, name, phoneNumber, address, updatedAt) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                UPDATE suppliers
                SET name = ?, phone_number = ?, address = ?, updated_at = ?
                WHERE supplier_id = ?
            `, [name, phoneNumber, address, updatedAt, id]);
        } catch (err) {
            console.error('supplierModel.updateByIdSupplier error:', err);
            throw err;
        }
    },

    // 5. Insert supplier baru
    createSupplier: async (supplierId, name, phone_number, address, createdAt, updatedAt) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO suppliers (supplier_id, name, phone_number, address, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [supplierId, name, phone_number, address, createdAt, updatedAt]);
        } catch (err) {
            console.error('supplierModel.createSupplier error:', err);
            throw err;
        }
    },

    // 6. Delete supplier
    deleteSupplier: async (id) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                DELETE FROM suppliers WHERE supplier_id = ?
            `, [id]);
        } catch (err) {
            console.error('supplierModel.deleteSupplier error:', err);
            throw err;
        }
    },

    // 7. Pagination + Search
    getSuppliersPaginated: async (searchTerm, limit, offset) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT * FROM suppliers
                WHERE 
                    name LIKE ? OR
                    phone_number LIKE ? OR
                    address LIKE ? OR
                    supplier_id LIKE ? OR
                    created_at LIKE ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [
                wildcardSearch,
                wildcardSearch,
                wildcardSearch,
                wildcardSearch,
                wildcardSearch,
                limit,
                offset
            ]);
        } catch (err) {
            console.error('supplierModel.getSuppliersPaginated error:', err);
            throw err;
        }
    },

    // 8. Hitung total baris untuk pagination
    countSuppliers: async (searchTerm) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT COUNT(*) as total FROM suppliers
                WHERE 
                    name LIKE ? OR
                    phone_number LIKE ? OR
                    address LIKE ? OR
                    supplier_id LIKE ? OR
                    created_at LIKE ?
            `;
            const result = await db.get(query, [
                wildcardSearch,
                wildcardSearch,
                wildcardSearch,
                wildcardSearch,
                wildcardSearch
            ]);
            return result.total;
        } catch (err) {
            console.error('supplierModel.countSuppliers error:', err);
            throw err;
        }
    }
};
