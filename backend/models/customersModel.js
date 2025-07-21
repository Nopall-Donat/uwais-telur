const dbPromise = require('../../config/db');

module.exports = {
    // 1. View semua pelanggan
    getAllCustomer: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT *
                FROM customers
                ORDER BY datetime(
                    substr(created_at, 7, 4) || '-' || substr(created_at, 4, 2) || '-' || substr(created_at, 1, 2) || ' ' || substr(created_at, 12)
                ) DESC LIMIT 10
            `);
        } catch (err) {
            console.error('customerModel.getAllCustomer error:', err);
            throw err;
        }
    },
    
    // Untuk ambil semua customer berdasarkan tanggal di ID (Pddmmyy%)
    getCustomersByDate: async (datePart) => {
        try {
            const db = await dbPromise;
            return await db.all(`
            SELECT * FROM customers
            WHERE customer_id LIKE ?
        `, [`P${datePart}%`]);
        } catch (err) {
            console.error('customerModel.getCustomersByDate error:', err);
            throw err;
        }
    },

    // Untuk cari satu customer by ID
    getByIdCustomer: async (id) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT *
                FROM customers
                WHERE customer_id = ?
            `, [id]);
        } catch (err) {
            console.error('customerModel.getByIdCustomer error:', err);
            throw err;
        }
    },

    // 4. Update customer by ID
    updateByIdCustomer: async (id, name, phoneNumber, address, updatedAt) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                UPDATE customers
                SET name = ?, phone_number = ?, address = ?, updated_at = ?
                WHERE customer_id = ?
            `, [name, phoneNumber, address, updatedAt, id]);
        } catch (err) {
            console.error('customerModel.updateByIdCustomer error:', err);
            throw err;
        }
    },

    // 5. Insert customer baru
    createCustomer: async (customerId, name, phone_number, address, createdAt, updatedAt) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO customers (customer_id, name, phone_number, address, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [customerId, name, phone_number, address, createdAt, updatedAt]);
        } catch (err) {
            console.error('customerModel.createCustomer error:', err);
            throw err;
        }
    },

    // 6. Delete customer
    deleteCustomer: async (id) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                DELETE FROM customers WHERE customer_id = ?
            `, [id]);
        } catch (err) {
            console.error('customerModel.deleteCustomer error:', err);
            throw err;
        }
    },

    getCustomersPaginated: async (searchTerm, limit, offset) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT * FROM customers
                WHERE 
                    name LIKE ? OR
                    phone_number LIKE ? OR
                    address LIKE ? OR
                    customer_id LIKE ? OR
                    created_at LIKE ?
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, limit, offset]);
        } catch (err) {
            console.error('customerModel.getCustomersPaginated error:', err);
            throw err;
        }
    },

    countCustomers: async (searchTerm) => {
        try {
            const db = await dbPromise;
            const wildcardSearch = `%${searchTerm}%`;
            const query = `
                SELECT COUNT(*) as total FROM customers
                WHERE 
                    name LIKE ? OR
                    phone_number LIKE ? OR
                    address LIKE ? OR
                    customer_id LIKE ? OR
                    created_at LIKE ?
            `;
            const result = await db.get(query, [wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch, wildcardSearch]);
            return result.total;
        } catch (err) {
            console.error('customerModel.countCustomers error:', err);
            throw err;
        }
    } 
};