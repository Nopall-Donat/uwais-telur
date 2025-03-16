const dbPromise = require('../../config/db');

module.exports = {
    /**
     * Mengambil daftar pelanggan (ID + Name) untuk keperluan dropdown, dsb.
     */
    getAllCustomers: async () => {
        const db = await dbPromise;
        const sql = `
        SELECT 
            customer_id,
            name,
            phone_number,
            address
        FROM customers
        ORDER BY name ASC
        `;
        const rows = await db.all(sql);
        return rows;
    },

    /**
     * Hanya mengambil (id, name) pelanggan untuk dropdown "pilih pelanggan".
     */
    getCustomerNameList: async () => {
        const db = await dbPromise;
        const sql = `
        SELECT 
            customer_id, 
            name 
        FROM customers
        ORDER BY name ASC
        `;
        const rows = await db.all(sql);
        return rows;
    },

    /**
     * Menambahkan pelanggan baru (misal jika belum ada).
     * Asumsi ID pelanggan sudah disiapkan (misal 'C001') di sisi Controller.
     */
    createCustomer: async (customerId, name, phoneNumber, address) => {
        const db = await dbPromise;
        const sql = `
            INSERT INTO customers 
                (customer_id, name, phone_number, address)
            VALUES (?, ?, ?, ?)
            `;
        const result = await db.run(sql, [
            customerId,
            name,
            phoneNumber,
            address
        ]);
        return result.lastID;
    },

    /**
     * Update data pelanggan (opsional).
     */
    updateCustomer: async (customerId, name, phoneNumber, address) => {
        const db = await dbPromise;
        const sql = `
            UPDATE customers
            SET name = ?, phone_number = ?, address = ?
            WHERE customer_id = ?
        `;
        const result = await db.run(sql, [
            name,
            phoneNumber,
            address,
            customerId
        ]);
        return result.changes; // jumlah baris yang terpengaruh
    }
};
