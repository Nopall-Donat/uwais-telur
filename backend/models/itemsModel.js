const dbPromise = require('../../config/db');

module.exports = {
    // 1. Get all items (stok)
    getAllItems: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT i.*, s.name AS supplier_name
                FROM items i
                JOIN suppliers s ON i.supplier_id = s.supplier_id
                ORDER BY datetime(i.updated_at) DESC LIMIT 10
            `);
        } catch (err) {
            console.error('itemsModel.getAllItems error:', err);
            throw err;
        }
    },

    // 2. Get items by date part in item_code
    getItemsByDate: async (datePart) => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT * FROM items
                WHERE item_code LIKE ?
            `, [`I${datePart}%`]);
        } catch (err) {
            console.error('itemsModel.getItemsByDate error:', err);
            throw err;
        }
    },

    // 3. Get item by ID
    getByIdItem: async (itemCode) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT * FROM items WHERE item_code = ?
            `, [itemCode]);
        } catch (err) {
            console.error('itemsModel.getByIdItem error:', err);
            throw err;
        }
    },

    // 4. Update item
    updateByIdItem: async (itemCode, item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                UPDATE items
                SET item_type = ?, supplier_id = ?, stock_quantity = ?, purchase_price = ?, selling_price = ?, unit = ?, updated_at = ?
                WHERE item_code = ?
            `, [item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at, itemCode]);
        } catch (err) {
            console.error('itemsModel.updateByIdItem error:', err);
            throw err;
        }
    },

    // 5. Create item
    createItem: async (item_code, item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO items (item_code, item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [item_code, item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at]);
        } catch (err) {
            console.error('itemsModel.createItem error:', err);
            throw err;
        }
    },

    // 6. Delete item
    deleteItem: async (itemCode) => {
        try {
            const db = await dbPromise;
            return await db.run(`
                DELETE FROM items WHERE item_code = ?
            `, [itemCode]);
        } catch (err) {
            console.error('itemsModel.deleteItem error:', err);
            throw err;
        }
    },

    // 7. Pagination & search
    getItemsPaginated: async (searchTerm, limit, offset) => {
        try {
            const db = await dbPromise;
            const keyword = `%${searchTerm}%`;
            const query = `
                SELECT i.*, s.name AS supplier_name
                FROM items i
                JOIN suppliers s ON i.supplier_id = s.supplier_id
                WHERE 
                    item_type LIKE ? OR
                    item_code LIKE ? OR
                    s.name LIKE ?
                ORDER BY updated_at DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [keyword, keyword, keyword, limit, offset]);
        } catch (err) {
            console.error('itemsModel.getItemsPaginated error:', err);
            throw err;
        }
    },

    countItems: async (searchTerm) => {
        try {
            const db = await dbPromise;
            const keyword = `%${searchTerm}%`;
            const query = `
                SELECT COUNT(*) as total
                FROM items i
                JOIN suppliers s ON i.supplier_id = s.supplier_id
                WHERE 
                    item_type LIKE ? OR
                    item_code LIKE ? OR
                    s.name LIKE ?
            `;
            const result = await db.get(query, [keyword, keyword, keyword]);
            return result.total;
        } catch (err) {
            console.error('itemsModel.countItems error:', err);
            throw err;
        }
    },

    // Update item stock quantity

    // 🔼 Tambah stok (setelah pembelian)
    updateStockIncrease: async (itemCode, quantity) => {
        try {
            const db = await dbPromise;
            await db.run(`
            UPDATE items
            SET stock_quantity = stock_quantity + ?, updated_at = CURRENT_TIMESTAMP
            WHERE item_code = ?
        `, [quantity, itemCode]);
        } catch (err) {
            console.error('itemsModel.updateStockIncrease error:', err);
            throw err;
        }
    },

    // 🔽 Kurangi stok (setelah penjualan)
    updateStockDecrease: async (itemCode, quantity) => {
        try {
            const db = await dbPromise;
            await db.run(`
            UPDATE items
            SET stock_quantity = stock_quantity - ?, updated_at = CURRENT_TIMESTAMP
            WHERE item_code = ?
        `, [quantity, itemCode]);
        } catch (err) {
            console.error('itemsModel.updateStockDecrease error:', err);
            throw err;
        }
    },

};