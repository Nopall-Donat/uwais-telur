const salesModel = require('../models/salesModel');

module.exports = {
    viewIndexSales: async (req, res) => {
        try {
            const sales = await salesModel.getAllSalesTransactions();
            res.render('sales/index', {
                title: 'Data Penjualan',
                sales
            });
        } catch (err) {
            console.error('viewIndexSales error:', err);
            res.status(500).send('Gagal memuat halaman penjualan.');
        }
    },


    getAllSales: async (req, res) => {
        try {
            const data = await salesModel.getAllSalesTransactions();
            res.json(data);
        } catch (err) {
            console.error('getAllSales error:', err);
            res.status(500).json({ message: 'Gagal mengambil data penjualan.' });
        }
    },

    getAllSalesLimit: async (req, res) => {
        try {
            const limit = parseInt(req.params.limit);
            const data = await salesModel.getAllSalesTransactionsLimit(limit);
            res.json(data);
        } catch (err) {
            console.error('getAllSalesLimit error:', err);
            res.status(500).json({ message: 'Gagal mengambil data penjualan dengan limit.' });
        }
    },

    getSalesById: async (req, res) => {
        try {
            const { id } = req.params;
            const data = await salesModel.getSalesById(id);
            if (!data) {
                return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
            }
            res.json(data);
        } catch (err) {
            console.error('getSalesById error:', err);
            res.status(500).json({ message: 'Gagal mengambil data transaksi.' });
        }
    },

    viewSalesDetail: async (req, res) => {
        try {
            const { id } = req.params;
            const detailData = await salesModel.getSalesTransactionDetail(id);

            if (!detailData) {
                return res.status(404).send('Detail transaksi tidak ditemukan.');
            }

            const { header, orders, payments } = detailData;

            // Gabungkan semua data ke satu objek `detail` agar cocok dengan detail.ejs
            const detail = {
                ...header,
                orders,
                payments
            };

            res.render('sales/details', {
                title: 'Detail Transaksi Penjualan',
                detail
            });
        } catch (err) {
            console.error('viewSalesDetail error:', err);
            res.status(500).send('Gagal memuat detail transaksi.');
        }
    },

    createSales: async (req, res) => {
        try {
            const transactionId = "P003";
            const { admin_id, customer_id } = req.body;
            await salesModel.createSalesTransaction(transactionId, admin_id, customer_id);
            res.status(201).json({ message: 'Transaksi berhasil dibuat.', transactionId });
        } catch (err) {
            console.error('createSales error:', err);
            res.status(500).json({ message: 'Gagal membuat transaksi.' });
        }
    },

    addOrderToSales: async (req, res) => {
        try {
            const orderId = "hello";
            const { sales_transaction_id, item_code, quantity, unit_price } = req.body;
            await salesModel.insertSalesOrder(orderId, sales_transaction_id, item_code, quantity, unit_price);
            res.status(201).json({ message: 'Item berhasil ditambahkan ke transaksi.', orderId });
        } catch (err) {
            console.error('addOrderToSales error:', err);
            res.status(500).json({ message: 'Gagal menambahkan item.' });
        }
    },

    addPaymentToSales: async (req, res) => {
        try {
            const paymentId = "hello";
            const { sales_transaction_id, payment_amount, payment_method } = req.body;
            await salesModel.insertSalesPayment(paymentId, sales_transaction_id, payment_amount, payment_method);
            res.status(201).json({ message: 'Pembayaran berhasil ditambahkan.', paymentId });
        } catch (err) {
            console.error('addPaymentToSales error:', err);
            res.status(500).json({ message: 'Gagal menambahkan pembayaran.' });
        }
    },

    updateSales: async (req, res) => {
        try {
            const { id } = req.params;
            const { total_amount, status } = req.body;
            await salesModel.updateSalesById(id, total_amount, status);
            res.json({ message: 'Transaksi berhasil diperbarui.' });
        } catch (err) {
            console.error('updateSales error:', err);
            res.status(500).json({ message: 'Gagal memperbarui transaksi.' });
        }
    },

    deleteSales: async (req, res) => {
        try {
            const { id } = req.params;
            await salesModel.deleteSalesById(id);
            res.json({ message: 'Transaksi berhasil dihapus.' });
        } catch (err) {
            console.error('deleteSales error:', err);
            res.status(500).json({ message: 'Gagal menghapus transaksi.' });
        }
    }
};
