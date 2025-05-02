const dbPromise = require('../../config/db');

module.exports = {
    // 1. View semua item
    getAllItems: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT item_code, item_type, selling_price
                FROM items
                ORDER BY item_code ASC
            `);
        } catch (err) {
            console.error('itemModel.getAllItems error:', err);
            throw err;
        }
    },
    
    // 2. Cari item berdasarkan item_code
    getItemByCode: async (itemCode) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT *
                FROM items
                WHERE item_code = ?
            `, [itemCode]);
        } catch (err) {
            console.error('itemsModel.getItemByCode error:', err);
            throw err;
        }
    },

    // 3. Insert item baru
    createItem: async (itemCode, itemType, supplierId, stockQuantity, purchasePrice, sellingPrice, unit, updatedAt) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO items (item_code, item_type, supplier_id, stock_quantity, purchase_price, selling_price, unit, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [itemCode, itemType, supplierId, stockQuantity, purchasePrice, sellingPrice, unit, updatedAt]);
        } catch (err) {
            console.error('itemsModel.createItem error:', err);
            throw err;
        }
    },

    // 4. Update item
    updateItemByCode: async (itemCode, itemType, supplierId, stockQuantity, purchasePrice, sellingPrice, unit, updatedAt) => {
        try {
            const db = await dbPromise;
            await db.run(`
                UPDATE items
                SET item_type = ?, supplier_id = ?, stock_quantity = ?, purchase_price = ?, selling_price = ?, unit = ?, updated_at = ?
                WHERE item_code = ?
            `, [itemType, supplierId, stockQuantity, purchasePrice, sellingPrice, unit, updatedAt, itemCode]);
        } catch (err) {
            console.error('itemsModel.updateItemByCode error:', err);
            throw err;
        }
    },

    // 5. Delete item
    deleteItemByCode: async (itemCode) => {
        try {
            const db = await dbPromise;
            await db.run(`
                DELETE FROM items
                WHERE item_code = ?
            `, [itemCode]);
        } catch (err) {
            console.error('itemsModel.deleteItemByCode error:', err);
            throw err;
        }
    }
};
