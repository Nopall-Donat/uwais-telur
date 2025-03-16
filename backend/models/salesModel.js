const dbPromise = require('../../config/db');

module.exports = {
    getAllSalesTransactions: async () => {
        try {
            const db = await dbPromise; // Menunggu inisialisasi db
            const sql = `
                SELECT 
                st.sales_transaction_id AS id_transaksi,
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
                JOIN admins a ON st.admin_id = a.admin_id
                ORDER BY st.transaction_time DESC
            `;
            const rows = await db.all(sql);
            return rows; // Kembalikan data array
        } catch (err) {
            console.error('Error in getAllSalesTransactions:', err);
            // Rethrow agar bisa ditangani di Controller atau Middleware error
            throw err;
        }
    },

    getSalesTransactionDetail: async (salesTransactionId) => {
        try {
            const db = await dbPromise;
            // Query header
            const sqlHeader = `
                SELECT 
                st.sales_transaction_id,
                st.total_amount,
                st.transaction_time,
                st.status,
                c.customer_id,
                c.name AS customer_name,
                c.address AS customer_address,
                c.phone_number AS customer_phone,
                a.admin_name
                FROM sales_transactions st
                JOIN customers c ON st.customer_id = c.customer_id
                JOIN admins a ON st.admin_id = a.admin_id
                WHERE st.sales_transaction_id = ?
            `;
            const header = await db.get(sqlHeader, [salesTransactionId]);
            if (!header) return null; // Data tidak ditemukan

            // Query orders
            const sqlOrders = `
                SELECT 
                so.sales_order_id,
                so.item_code,
                i.item_type,
                so.quantity,
                so.unit_price,
                so.subtotal_price,
                so.order_time,
                so.status AS order_status
                FROM sales_orders so
                JOIN items i ON so.item_code = i.item_code
                WHERE so.sales_transaction_id = ?
            `;
            const orders = await db.all(sqlOrders, [salesTransactionId]);

            // Query payments
            const sqlPayments = `
                SELECT 
                sp.sales_payment_id,
                sp.payment_amount,
                sp.payment_method,
                sp.payment_time
                FROM sales_payments sp
                WHERE sp.sales_transaction_id = ?
                ORDER BY sp.payment_time ASC
            `;
            const payments = await db.all(sqlPayments, [salesTransactionId]);

            return { ...header, orders, payments };
        } catch (err) {
            console.error('Error in getSalesTransactionDetail:', err);
            throw err;
        }
    },

    // Contoh create
    createSalesTransaction: async (salesTransactionId, adminId, customerId, totalAmount, status) => {
        try {
            const db = await dbPromise;
            const sql = `
                INSERT INTO sales_transactions 
                (sales_transaction_id, admin_id, customer_id, total_amount, status, transaction_time)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `;
            const result = await db.run(sql, [
                salesTransactionId,
                adminId,
                customerId,
                totalAmount,
                status
            ]);
            return result.lastID;
        } catch (err) {
            console.error('Error in createSalesTransaction:', err);
            throw err;
        }
    },

    // Tambahkan method lain (insertSalesOrder, insertSalesPayment, dsb.) sesuai kebutuhan
};
