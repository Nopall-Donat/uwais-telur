const dbPromise = require('../../config/db');

module.exports = {
    // 1. Ambil semua transaksi dengan search + pagination
    getSalesBySearchAndLimit: async (search, limit, offset = 0) => {
        try {
            const db = await dbPromise;
            const term = `%${search.toLowerCase()}%`;
            const query = `
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
                JOIN admins a ON st.admin_id = a.admin_id
                WHERE 
                    LOWER(st.sales_transaction_id) LIKE ? OR
                    LOWER(c.name) LIKE ? OR
                    LOWER(c.address) LIKE ? OR
                    LOWER(a.admin_name) LIKE ? OR
                    LOWER(st.status) LIKE ? OR
                    LOWER(st.transaction_time) LIKE ? OR
                    LOWER(CAST(st.total_amount AS TEXT)) LIKE ? OR
                    LOWER(CAST((
                        SELECT COALESCE(SUM(sp.payment_amount), 0)
                        FROM sales_payments sp
                        WHERE sp.sales_transaction_id = st.sales_transaction_id
                    ) AS TEXT)) LIKE ?
                ORDER BY datetime(
                    substr(st.transaction_time, 7, 4) || '-' || 
                    substr(st.transaction_time, 4, 2) || '-' || 
                    substr(st.transaction_time, 1, 2) || ' ' || 
                    substr(st.transaction_time, 12)
                ) DESC
                LIMIT ? OFFSET ?
            `;
            return await db.all(query, [
                term, term, term, term, term, term, term, term, limit, offset
            ]);
        } catch (err) {
            console.error('salesModel.getSalesBySearchAndLimit error:', err);
            throw err;
        }
    },
    
    // 2. Hitung total data transaksi untuk pagination
    countSalesBySearch: async (search) => {
        try {
            const db = await dbPromise;
            const term = `%${search.toLowerCase()}%`;
            const result = await db.get(`
                SELECT COUNT(*) as total
                FROM sales_transactions st
                JOIN customers c ON st.customer_id = c.customer_id
                JOIN admins a ON st.admin_id = a.admin_id
                WHERE 
                    LOWER(st.sales_transaction_id) LIKE ? OR
                    LOWER(c.name) LIKE ? OR
                    LOWER(c.address) LIKE ? OR
                    LOWER(a.admin_name) LIKE ? OR
                    LOWER(st.status) LIKE ? OR
                    LOWER(st.transaction_time) LIKE ? OR
                    LOWER(CAST(st.total_amount AS TEXT)) LIKE ? OR
                    LOWER(CAST((
                        SELECT COALESCE(SUM(sp.payment_amount), 0)
                        FROM sales_payments sp
                        WHERE sp.sales_transaction_id = st.sales_transaction_id
                    ) AS TEXT)) LIKE ?
            `, [term, term, term, term, term, term, term, term]);
            return result.total || 0;
        } catch (err) {
            console.error('salesModel.countSalesBySearch error:', err);
            throw err;
        }
    },    

    // 3. Ambil detail transaksi (header + order + payment)
    getSalesTransactionDetail: async (transactionId) => {
        try {
            const db = await dbPromise;

            const header = await db.get(`
                SELECT 
                    st.sales_transaction_id AS id,
                    c.name AS customer_name,
                    c.address AS customer_address,
                    c.phone_number AS customer_phone,
                    a.admin_name AS admin_name,
                    st.total_amount AS total_tagihan,
                    st.transaction_time,
                    st.status AS status_pembayaran
                FROM sales_transactions st
                JOIN customers c ON st.customer_id = c.customer_id
                JOIN admins a ON st.admin_id = a.admin_id
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

    // 4. Buat transaksi baru (HEADER)
    createSalesTransaction: async (transactionId, adminId, customerId) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO sales_transactions (sales_transaction_id, admin_id, customer_id, total_amount, status, transaction_time)
                VALUES (?, ?, ?, 0, 'Belum Lunas', CURRENT_TIMESTAMP)
            `, [transactionId, adminId, customerId]);
            return transactionId;
        } catch (err) {
            console.error('salesModel.createSalesTransaction error:', err);
            throw err;
        }
    },

    // 5. Tambah ORDER ke transaksi
    insertSalesOrder: async (orderId, transactionId, itemCode, quantity, unitPrice) => {
        try {
            const db = await dbPromise;
            const subtotal = quantity * unitPrice;
            await db.run(`
                INSERT INTO sales_orders (sales_order_id, sales_transaction_id, item_code, quantity, unit_price, subtotal_price, order_time)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [orderId, transactionId, itemCode, quantity, unitPrice, subtotal]);
            return orderId;
        } catch (err) {
            console.error('salesModel.insertSalesOrder error:', err);
            throw err;
        }
    },

    // 6. Tambah pembayaran ke transaksi
    insertSalesPayment: async (paymentId, transactionId, amount, method) => {
        try {
            const db = await dbPromise;
            await db.run(`
                INSERT INTO sales_payments (sales_payment_id, sales_transaction_id, payment_amount, payment_method, payment_time)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [paymentId, transactionId, amount, method]);
            return paymentId;
        } catch (err) {
            console.error('salesModel.insertSalesPayment error:', err);
            throw err;
        }
    },

    // 7. Update transaksi setelah total dan status diketahui
    updateSalesById: async (transactionId, totalAmount, status) => {
        try {
            const db = await dbPromise;
            await db.run(`
                UPDATE sales_transactions
                SET total_amount = ?, status = ?
                WHERE sales_transaction_id = ?
            `, [totalAmount, status, transactionId]);
        } catch (err) {
            console.error('salesModel.updateSalesById error:', err);
            throw err;
        }
    },

    // 8. Hapus seluruh transaksi (termasuk order dan payment)
    deleteSalesById: async (transactionId) => {
        try {
            const db = await dbPromise;
            await db.run(`DELETE FROM sales_payments WHERE sales_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM sales_orders WHERE sales_transaction_id = ?`, [transactionId]);
            await db.run(`DELETE FROM sales_transactions WHERE sales_transaction_id = ?`, [transactionId]);
        } catch (err) {
            console.error('salesModel.deleteSalesById error:', err);
            throw err;
        }
    }
};