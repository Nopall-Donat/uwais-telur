const dbPromise = require('../../config/db');

module.exports = {
    // ================================
    // TRANSAKSI PEMBELIAN
    // ================================

    getPurchasesBySearchAndLimit: async (search, limit, offset = 0) => {
        try {
            const db = await dbPromise;
            const term = `%${search.toLowerCase()}%`;
            const query = `
                SELECT 
                    pt.purchase_transaction_id AS id,
                    s.name AS nama_supplier,
                    s.address AS alamat_supplier,
                    pt.total_amount AS total_tagihan,
                    COALESCE((
                        SELECT SUM(pp.payment_amount)
                        FROM purchase_payments pp
                        WHERE pp.purchase_transaction_id = pt.purchase_transaction_id
                    ), 0) AS total_bayar,
                    pt.transaction_time AS waktu_transaksi,
                    pt.status AS status_pembayaran,
                    a.admin_name AS nama_admin
                FROM purchase_transactions pt
                JOIN suppliers s ON pt.supplier_id = s.supplier_id
                JOIN admins a ON pt.admin_id = a.admin_id
                WHERE 
                    LOWER(pt.purchase_transaction_id) LIKE ? OR
                    LOWER(s.name) LIKE ? OR
                    LOWER(s.address) LIKE ? OR
                    LOWER(a.admin_name) LIKE ? OR
                    LOWER(pt.status) LIKE ? OR
                    LOWER(pt.transaction_time) LIKE ? OR
                    LOWER(CAST(pt.total_amount AS TEXT)) LIKE ? OR
                    LOWER(CAST((
                        SELECT COALESCE(SUM(pp.payment_amount), 0)
                        FROM purchase_payments pp
                        WHERE pp.purchase_transaction_id = pt.purchase_transaction_id
                    ) AS TEXT)) LIKE ?
                ORDER BY datetime(
                    substr(pt.transaction_time, 7, 4) || '-' || 
                    substr(pt.transaction_time, 4, 2) || '-' || 
                    substr(pt.transaction_time, 1, 2) || ' ' || 
                    substr(pt.transaction_time, 12)
                ) DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [
                term, term, term, term, term, term, term, term, limit, offset
            ]);
        } catch (err) {
            console.error('purchaseModel.getPurchasesBySearchAndLimit error:', err);
            throw err;
        }
    },

    countPurchasesBySearch: async (search) => {
        try {
            const db = await dbPromise;
            const term = `%${search.toLowerCase()}%`;
            const result = await db.get(`
                SELECT COUNT(*) as total
                FROM purchase_transactions pt
                JOIN suppliers s ON pt.supplier_id = s.supplier_id
                JOIN admins a ON pt.admin_id = a.admin_id
                WHERE 
                    LOWER(pt.purchase_transaction_id) LIKE ? OR
                    LOWER(s.name) LIKE ? OR
                    LOWER(s.address) LIKE ? OR
                    LOWER(a.admin_name) LIKE ? OR
                    LOWER(pt.status) LIKE ? OR
                    LOWER(pt.transaction_time) LIKE ? OR
                    LOWER(CAST(pt.total_amount AS TEXT)) LIKE ? OR
                    LOWER(CAST((
                        SELECT COALESCE(SUM(pp.payment_amount), 0)
                        FROM purchase_payments pp
                        WHERE pp.purchase_transaction_id = pt.purchase_transaction_id
                    ) AS TEXT)) LIKE ?
            `, [term, term, term, term, term, term, term, term]);
            return result.total || 0;
        } catch (err) {
            console.error('purchaseModel.countPurchasesBySearch error:', err);
            throw err;
        }
    },

    getTransactionIdsByDateTag: async (dateTag) => {
        try {
            const db = await dbPromise;
            const rows = await db.all(`
                SELECT purchase_transaction_id FROM purchase_transactions
                WHERE purchase_transaction_id LIKE ?
            `, [`BUY%${dateTag}`]);
            return rows;
        } catch (err) {
            console.error('purchaseModel.getTransactionIdsByDateTag error:', err);
            throw err;
        }
    },

    createPurchaseTransaction: async (transactionId, adminId, supplierId, timestamp) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO purchase_transactions (
                    purchase_transaction_id, admin_id, supplier_id,
                    total_amount, status, transaction_time
                ) VALUES (?, ?, ?, 0, 'Belum Lunas', ?)
            `, [transactionId, adminId, supplierId, timestamp]);
        } catch (err) {
            console.error('purchaseModel.createPurchaseTransaction error:', err);
            throw err;
        }
    },

    deletePurchaseById: async (transactionId) => {
        try {
            const db = await dbPromise;
            await db.run(`DELETE FROM purchase_payments WHERE purchase_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM purchase_orders WHERE purchase_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM purchase_transactions WHERE purchase_transaction_id = ?`, [transactionId]);
        } catch (err) {
            console.error('purchaseModel.deletePurchaseById error:', err);
            throw err;
        }
    },
    
    // ================================
    // DETAIL PESANAN TRANSAKSI PEMBELIAN
    // ================================

    getPurchaseTransactionDetail: async (transactionId) => {
        try {
            const db = await dbPromise;

            const header = await db.get(`
                SELECT 
                    pt.purchase_transaction_id AS id,
                    s.name AS supplier_name,
                    s.address AS supplier_address,
                    s.phone_number AS supplier_phone,
                    a.admin_name AS admin_name,
                    pt.total_amount AS total_tagihan,
                    pt.transaction_time,
                    pt.status AS status_pembayaran
                FROM purchase_transactions pt
                JOIN suppliers s ON pt.supplier_id = s.supplier_id
                JOIN admins a ON pt.admin_id = a.admin_id
                WHERE pt.purchase_transaction_id = ?
            `, [transactionId]);

            if (!header) return null;

            const orders = await db.all(`
                SELECT 
                    po.purchase_order_id,
                    po.item_code,
                    i.item_type,
                    po.quantity,
                    po.unit_price,
                    po.subtotal_price,
                    po.order_time
                FROM purchase_orders po
                JOIN items i ON po.item_code = i.item_code
                WHERE po.purchase_transaction_id = ?
            `, [transactionId]);

            const payments = await db.all(`
                SELECT 
                    pp.purchase_payment_id,
                    pp.payment_amount,
                    pp.payment_method,
                    pp.payment_time
                FROM purchase_payments pp
                WHERE pp.purchase_transaction_id = ?
            `, [transactionId]);

            const totalPaidResult = await db.get(`
                SELECT COALESCE(SUM(payment_amount), 0) AS total_dibayar
                FROM purchase_payments
                WHERE purchase_transaction_id = ?
            `, [transactionId]);

            header.total_dibayar = totalPaidResult.total_dibayar || 0;

            return { header, orders, payments };
        } catch (err) {
            console.error('purchaseModel.getPurchaseTransactionDetail error:', err);
            throw err;
        }
    },
    // 🔹 Generate ID baru untuk transaksi pembelian (purchase_order_id)
    getUsedOrderIdsByDate: async (dateTag) => {
        try {
            const db = await dbPromise;
            const rows = await db.all(`
                SELECT purchase_order_id FROM purchase_orders
                WHERE purchase_order_id LIKE ?
            `, [`PORD%${dateTag}`]);
            return rows;
        } catch (err) {
            console.error('purchaseModel.getUsedOrderIdsByDate error:', err);
            throw err;
        }
    },
    checkPurchaseOrderIdExists: async (orderId) => {
        try {
            const db = await dbPromise;
            const result = await db.get(`
                SELECT 1 FROM purchase_orders WHERE purchase_order_id = ?
            `, [orderId]);
            return !!result;
        } catch (err) {
            console.error('purchaseModel.checkPurchaseOrderIdExists error:', err);
            throw err;
        }
    },

    insertSinglePurchaseOrder: async (orderId, transactionId, itemCode, qty, price) => {
        try {
            const db = await dbPromise;
            const subtotal = qty * price;
            await db.run(`
                INSERT INTO purchase_orders (
                    purchase_order_id, purchase_transaction_id, item_code,
                    quantity, unit_price, subtotal_price, order_time
                ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [orderId, transactionId, itemCode, qty, price, subtotal]);
        } catch (err) {
            console.error('purchaseModel.insertSinglePurchaseOrder error:', err);
            throw err;
        }
    },

    getPurchaseOrderIdsByTransaction: async (transactionId) => {
        try {
            const db = await dbPromise;
            return await db.all(`
                SELECT purchase_order_id FROM purchase_orders
                WHERE purchase_transaction_id = ?
            `, [transactionId]);
        } catch (err) {
            console.error('purchaseModel.getPurchaseOrderIdsByTransaction error:', err);
            throw err;
        }
    },

    updateTotalAmountByTransactionId: async (transactionId) => {
        try {
            const db = await dbPromise;
            const result = await db.get(`
                SELECT COALESCE(SUM(subtotal_price), 0) AS total
                FROM purchase_orders
                WHERE purchase_transaction_id = ?
            `, [transactionId]);

            const totalAmount = result.total || 0;

            await db.run(`
                UPDATE purchase_transactions
                SET total_amount = ?
                WHERE purchase_transaction_id = ?
            `, [totalAmount, transactionId]);
        } catch (err) {
            console.error('purchaseModel.updateTotalAmountByTransactionId error:', err);
            throw err;
        }
    },

    updatePurchaseOrder: async (orderId, itemCode, qty, price) => {
        try {
            const db = await dbPromise;
            const subtotal = qty * price;
            await db.run(`
                UPDATE purchase_orders
                SET item_code = ?, quantity = ?, unit_price = ?, subtotal_price = ?, updated_at = CURRENT_TIMESTAMP
                WHERE purchase_order_id = ?
            `, [itemCode, qty, price, subtotal, orderId]);
        } catch (err) {
            console.error('purchaseModel.updatePurchaseOrder error:', err);
            throw err;
        }
    },

    deletePurchaseOrderById: async (orderId) => {
        try {
            const db = await dbPromise;
            await db.run(`DELETE FROM purchase_orders WHERE purchase_order_id = ?`, [orderId]);
        } catch (err) {
            console.error('purchaseModel.deletePurchaseOrderById error:', err);
            throw err;
        }
    },

    // ================================
    // PEMBAYARAN TRANSAKSI PEMBELIAN
    // ================================

    getPaymentsByTransactionId: async (transactionId) => {
        try {
            const db = await dbPromise;
            const query = `
                SELECT 
                    purchase_payment_id,
                    payment_amount, 
                    payment_method, 
                    payment_time 
                FROM purchase_payments 
                WHERE purchase_transaction_id = ?
                ORDER BY payment_time DESC
            `;
            return await db.all(query, [transactionId]);
        } catch (err) {
            console.error('purchaseModel.getPaymentsByTransactionId error:', err);
            throw err;
        }
    },

    getPaymentById: async (paymentId) => {
        try {
            const db = await dbPromise;
            return await db.get(`
                SELECT purchase_transaction_id, payment_amount
                FROM purchase_payments
                WHERE purchase_payment_id = ?
            `, [paymentId]);
        } catch (err) {
            console.error('purchaseModel.getPaymentById error:', err);
            throw err;
        }
    },

    getTotalPaidByTransaction: async (transactionId) => {
        try {
            const db = await dbPromise;
            const result = await db.get(`
                SELECT COALESCE(SUM(payment_amount), 0) AS total_paid
                FROM purchase_payments
                WHERE purchase_transaction_id = ?
            `, [transactionId]);
            return result.total_paid || 0;
        } catch (err) {
            console.error('purchaseModel.getTotalPaidByTransaction error:', err);
            throw err;
        }
    },

    insertPurchasePayment: async (paymentId, transactionId, amount, method) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO purchase_payments (
                    purchase_payment_id, purchase_transaction_id,
                    payment_amount, payment_method,
                    payment_time
                ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [paymentId, transactionId, amount, method]);
        } catch (err) {
            console.error('purchaseModel.insertPurchasePayment error:', err);
            throw err;
        }
    },

    updatePaymentStatus: async (transactionId) => {
        try {
            const db = await dbPromise;
            const result = await db.get(`
                SELECT
                    COALESCE(SUM(payment_amount), 0) AS total_dibayar,
                    (SELECT total_amount FROM purchase_transactions WHERE purchase_transaction_id = ?) AS total_tagihan
                FROM purchase_payments
                WHERE purchase_transaction_id = ?
            `, [transactionId, transactionId]);

            const status = result.total_dibayar >= result.total_tagihan ? 'Lunas' : 'Belum Lunas';

            await db.run(`
                UPDATE purchase_transactions
                SET status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE purchase_transaction_id = ?
            `, [status, transactionId]);
        } catch (err) {
            console.error('purchaseModel.updatePaymentStatus error:', err);
            throw err;
        }
    },

    deletePaymentById: async (paymentId) => {
        try {
            const db = await dbPromise;
            return await db.run(`DELETE FROM purchase_payments WHERE purchase_payment_id = ?`, [paymentId]);
        } catch (err) {
            console.error('purchaseModel.deletePaymentById error:', err);
            throw err;
        }
    },

    // ================================
    // BACKUP DATABASE PEMBELIAN
    // ================================

    getBackupData: async () => {
        try {
            const db = await dbPromise;

            const transactions = await db.all(`
                SELECT 
                    pt.purchase_transaction_id,
                    s.name AS supplier_name,
                    s.address,
                    pt.total_amount,
                    pt.status,
                    pt.transaction_time,
                    a.admin_name
                FROM purchase_transactions pt
                LEFT JOIN suppliers s ON pt.supplier_id = s.supplier_id
                LEFT JOIN admins a ON pt.admin_id = a.admin_id
                ORDER BY pt.transaction_time DESC
            `);

            const orders = await db.all(`
                SELECT 
                    po.purchase_order_id,
                    po.purchase_transaction_id,
                    i.item_type,
                    po.quantity,
                    po.unit_price,
                    po.subtotal_price,
                    po.order_time
                FROM purchase_orders po
                LEFT JOIN items i ON po.item_code = i.item_code
                ORDER BY po.order_time ASC
            `);

            const payments = await db.all(`
                SELECT 
                    pp.purchase_payment_id,
                    pp.purchase_transaction_id,
                    pp.payment_amount,
                    pp.payment_method,
                    pp.payment_time
                FROM purchase_payments pp
                ORDER BY pp.payment_time ASC
            `);

            return { transactions, orders, payments };

        } catch (err) {
            console.error('purchaseModel.getBackupData error:', err);
            throw err;
        }
    },

    // ================================
    // CETAK NOTA PEMBELIAN
    // ================================

    getPurchaseReceiptData: async (id) => {
        try {
            const db = await dbPromise;

            const transaction = await db.get(`
                SELECT pt.*, s.name AS supplier_name, s.phone_number, s.address,
                    a.admin_name
                FROM purchase_transactions pt
                LEFT JOIN suppliers s ON pt.supplier_id = s.supplier_id
                LEFT JOIN admins a ON pt.admin_id = a.admin_id
                WHERE pt.purchase_transaction_id = ?
            `, [id]);

            const orders = await db.all(`
                SELECT po.*, i.item_type AS item_name, i.unit
                FROM purchase_orders po
                LEFT JOIN items i ON po.item_code = i.item_code
                WHERE po.purchase_transaction_id = ?
            `, [id]);

            const payments = await db.all(`
                SELECT * FROM purchase_payments
                WHERE purchase_transaction_id = ?
                ORDER BY payment_time ASC
            `, [id]);

            return { transaction, orders, payments };
        } catch (err) {
            console.error('purchaseModel.getPurchaseReceiptData error:', err);
            throw err;
        }
    }
};