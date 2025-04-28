const dbPromise = require('../../config/db');

module.exports = {
    // 1. View semua pelanggan
    getAllCustomer: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT *
                FROM customers
                ORDER BY name ASC
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
    findCustomerById: async (id) => {
        try {
            const db = await dbPromise;
            return await db.get(`
            SELECT * FROM customers
            WHERE customer_id = ?
        `, [id]);
        } catch (err) {
            console.error('customerModel.findCustomerById error:', err);
            throw err;
        }
    },

    // 3. Get limit customer (misalnya top 10)
    getAllLimitCustomer: async (limit = 10) => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT * FROM customers
                ORDER BY name ASC
                LIMIT ?
            `, [limit]);
        } catch (err) {
            console.error('customerModel.getAllLimitCustomer error:', err);
            throw err;
        }
    },

    // 4. Update customer by ID
    updateByIdCustomer: async (id, name, phoneNumber, address) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                UPDATE customers
                SET name = ?, phone_number = ?, address = ?
                WHERE customer_id = ?
            `, [name, phoneNumber, address, id]);
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

    // 7. Untuk dropdown
    getCustomerNameList: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT customer_id, name
                FROM customers
                ORDER BY name ASC
            `);
        } catch (err) {
            console.error('customerModel.getCustomerNameList error:', err);
            throw err;
        }
    }
};
