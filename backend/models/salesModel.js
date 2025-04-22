const dbPromise = require('../../config/db');

module.exports = {
    // Untuk halaman index
    getAllSalesTransactions: async () => {
        try {
            const db = await dbPromise;
            return await db.all(`
            SELECT 
            st.sales_transaction_id AS id,
            c.name AS nama_pelanggan,
            c.address AS alamat_pelanggan,
            st.total_amount AS total_tagihan,
            COALESCE((
                SELECT SUM(sp.payment_amount)
                FROM sales_payments sp
                WHERE sp.sales_transaction_id = st.sales_transaction_id
            ), 0) AS total_bayar,
            st.transaction_time AS waktu_transaksi,
            st.status AS status_pembayaran,
            a.admin_name AS nama_admin
            FROM sales_transactions st
            JOIN customers c ON st.customer_id = c.customer_id
            JOIN admins a    ON st.admin_id    = a.admin_id
            ORDER BY st.transaction_time DESC
        `);
        } catch (err) {
            console.error('salesModel.getAllSalesTransactions error:', err);
            throw err;
        }
    },

    // Get limit N
    getAllSalesTransactionsLimit: async (limit) => {
        try {
            const db = await dbPromise;
            return await db.all(`
            SELECT 
            st.sales_transaction_id AS id,
            c.name AS customer_name,
            st.total_amount AS total_tagihan,
            COALESCE((
                SELECT SUM(sp.payment_amount)
                FROM sales_payments sp
                WHERE sp.sales_transaction_id = st.sales_transaction_id
            ), 0) AS total_bayar,
            st.transaction_time AS waktu_transaksi,
            st.status AS status_pembayaran,
            a.admin_name AS admin_name
            FROM sales_transactions st
            JOIN customers c ON st.customer_id = c.customer_id
            JOIN admins a    ON st.admin_id    = a.admin_id
            ORDER BY st.transaction_time DESC
            LIMIT ?
        `, [limit]);
        } catch (err) {
            console.error('salesModel.getAllSalesTransactionsLimit error:', err);
            throw err;
        }
    },

    // Get by ID (hanya header, bukan detail)
    getSalesById: async (transactionId) => {
        try {
            const db = await dbPromise;
            return await db.get(`
        SELECT 
            st.sales_transaction_id AS id,
            c.name AS customer_name,
            st.total_amount AS total_tagihan,
            st.transaction_time,
            st.status AS status_pembayaran,
            a.admin_name AS admin_name
            FROM sales_transactions st
            JOIN customers c ON st.customer_id = c.customer_id
            JOIN admins a    ON st.admin_id    = a.admin_id
            WHERE st.sales_transaction_id = ?
        `, [transactionId]);
        } catch (err) {
            console.error('salesModel.getSalesById error:', err);
            throw err;
        }
    },

    // Update transaksi header (misal: status atau total_amount)
    updateSalesById: async (transactionId, totalAmount, status) => {
        try {
            const db = await dbPromise;
            return await db.run(`
            UPDATE sales_transactions
            SET total_amount = ?, status = ?
            WHERE sales_transaction_id = ?
        `, [totalAmount, status, transactionId]);
        } catch (err) {
            console.error('salesModel.updateSalesById error:', err);
            throw err;
        }
    },

    // Delete seluruh transaksi dan anak-anaknya
    deleteSalesById: async (transactionId) => {
        try {
            const db = await dbPromise;
            await db.run(`DELETE FROM sales_payments WHERE sales_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM sales_orders   WHERE sales_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM sales_transactions WHERE sales_transaction_id = ?`, [transactionId]);
        } catch (err) {
            console.error('salesModel.deleteSalesById error:', err);
            throw err;
        }
    },

    // Detail transaksi (header + orders + payments)
    getSalesTransactionDetail: async (transactionId) => {
        try {
            const db = await dbPromise;

            const header = await db.get(`
        SELECT 
            st.sales_transaction_id AS id,
            c.name  AS customer_name,
            c.address  AS customer_address,
            c.phone_number AS customer_phone,
            a.admin_name    AS admin_name,
            st.total_amount AS total_tagihan,
            st.transaction_time,
            st.status AS status_pembayaran
            FROM sales_transactions st
            JOIN customers c ON st.customer_id = c.customer_id
            JOIN admins a    ON st.admin_id    = a.admin_id
            WHERE st.sales_transaction_id = ?
        `, [transactionId]);

            if (!header) return null;

            const orders = await db.all(`
        SELECT 
            so.sales_order_id,
            so.item_code,
            i.item_type,
            so.quantity,
            so.unit_price,
            so.subtotal_price,
            so.order_time
            FROM sales_orders so
            JOIN items i ON so.item_code = i.item_code
            WHERE so.sales_transaction_id = ?
        `, [transactionId]);

            const payments = await db.all(`
        SELECT 
            sp.sales_payment_id,
            sp.payment_amount,
            sp.payment_method,
            sp.payment_time
            FROM sales_payments sp
            WHERE sp.sales_transaction_id = ?
        `, [transactionId]);

            return { header, orders, payments };
        } catch (err) {
            console.error('salesModel.getSalesTransactionDetail error:', err);
            throw err;
        }
    },

    createSalesTransaction: async (transactionId, adminId, customerId) => {
        try {
            const db = await dbPromise;
            await db.run(`
        INSERT INTO sales_transactions
            (sales_transaction_id, admin_id, customer_id, total_amount, status, transaction_time)
            VALUES (?, ?, ?, 0, 'pending', CURRENT_TIMESTAMP)
        `, [transactionId, adminId, customerId]);
            return transactionId;
        } catch (err) {
            console.error('salesModel.createSalesTransaction error:', err);
            throw err;
        }
    },

    insertSalesOrder: async (orderId, transactionId, itemCode, quantity, unitPrice) => {
        try {
            const db = await dbPromise;
            const subtotal = quantity * unitPrice;
            await db.run(`
        INSERT INTO sales_orders
            (sales_order_id, sales_transaction_id, item_code, quantity, unit_price, subtotal_price, order_time)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [orderId, transactionId, itemCode, quantity, unitPrice, subtotal]);
            return orderId;
        } catch (err) {
            console.error('salesModel.insertSalesOrder error:', err);
            throw err;
        }
    },

    insertSalesPayment: async (paymentId, transactionId, amount, method) => {
        try {
            const db = await dbPromise;
            await db.run(`
        INSERT INTO sales_payments
            (sales_payment_id, sales_transaction_id, payment_amount, payment_method, payment_time)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [paymentId, transactionId, amount, method]);
            return paymentId;
        } catch (err) {
            console.error('salesModel.insertSalesPayment error:', err);
            throw err;
        }
    }
};
