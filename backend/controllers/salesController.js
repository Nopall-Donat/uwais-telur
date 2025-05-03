const salesModel = require('../models/salesModel');
const customerModel = require('../models/customersModel');
const itemsModel = require('../models/itemsModel');

const salesController = {
    // 🔷 View halaman utama
    viewIndexSales: async (req, res, next) => {
        try {
            const sales = await salesModel.getSalesBySearchAndLimit('', 10, 0);
            const customers = await customerModel.getAllCustomer();

            const message = req.session.message || null;
            delete req.session.message;

            res.render('sales/index', {
                title: 'Data Penjualan',
                sales,
                customers,
                message,
                search: '',
                limit: 10,
                page: 1,
                totalPages: 1
            });
        } catch (err) {
            console.error('viewIndexSales error:', err);
            next(err);
        }
    },

    // 🔷 Data lengkap semua sales (untuk API)
    getAllSales: async (req, res, next) => {
        try {
            const data = await salesModel.getSalesBySearchAndLimit('', 1000, 0);
            res.json(data);
        } catch (err) {
            console.error('getAllSales error:', err);
            next(err);
        }
    },

    // 🔷 List sales dengan search + limit + page (AJAX)
    listSales: async (req, res, next) => {
        try {
            const search = req.query.search?.toLowerCase() || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [sales, totalData] = await Promise.all([
                salesModel.getSalesBySearchAndLimit(search, limit, offset),
                salesModel.countSalesBySearch(search)
            ]);

            const statusList = ['lunas', 'belum lunas', 'dibatalkan'];
            const keyword = search.trim().toLowerCase();

            let filteredSales = sales;

            if (statusList.includes(keyword)) {
                filteredSales = sales.filter(tx =>
                    tx.status_pembayaran.toLowerCase() === keyword
                );
            }

            const totalPages = Math.ceil(totalData / limit);

            if (req.xhr) {
                res.render('sales/_table', {
                    sales: filteredSales,
                    search,
                    limit,
                    page,
                    totalPages,
                    title: 'Data Penjualan'
                }, (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Gagal render data.');
                    }
                    res.send(html);
                });
            } else {
                res.render('sales/index', {
                    title: 'Data Penjualan',
                    sales: filteredSales,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('listSales error:', err);
            next(err);
        }
    },

    // 🔷 Detail view (render HTML)
    viewSalesDetail: async (req, res, next) => {
        try {
            const detail = await salesModel.getSalesTransactionDetail(req.params.id);
            if (!detail) return res.status(404).send('Transaksi tidak ditemukan.');

            const itemListFromDB = await itemsModel.getAllItems();

            res.render('sales/details', {
                title: 'Detail Transaksi Penjualan',
                detail: {
                    ...detail.header,
                    orders: detail.orders,
                    payments: detail.payments
                },
                items: itemListFromDB
            });
        } catch (err) {
            console.error('viewSalesDetail error:', err);
            next(err);
        }
    },

    // 🔷 Tambah transaksi
    createSales: async (req, res, next) => {
        try {
            const { transaction_id, admin_id, customer_id } = req.body;
            await salesModel.createSalesTransaction(transaction_id, admin_id, customer_id);

            req.session.message = { type: 'success', text: 'Transaksi berhasil ditambahkan!' };
            res.redirect('/sales');
        } catch (err) {
            console.error('createSales error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan transaksi!' };
            res.redirect('/sales');
        }
    },

    // 🔷 Tambah item
    addOrderToSales: async (req, res, next) => {
        try {
            const { order_id, sales_transaction_id, item_code, quantity, unit_price } = req.body;
            await salesModel.insertSalesOrder(order_id, sales_transaction_id, item_code, quantity, unit_price);
            res.status(201).json({ message: 'Item berhasil ditambahkan.' });
        } catch (err) {
            console.error('addOrderToSales error:', err);
            next(err);
        }
    },

    // 🔷 Tambah pembayaran
    addPaymentToSales: async (req, res, next) => {
        try {
            const { payment_id, sales_transaction_id, payment_amount, payment_method } = req.body;
            await salesModel.insertSalesPayment(payment_id, sales_transaction_id, payment_amount, payment_method);
            res.status(201).json({ message: 'Pembayaran berhasil ditambahkan.' });
        } catch (err) {
            console.error('addPaymentToSales error:', err);
            next(err);
        }
    },

    // 🔷 Update transaksi
    updateSales: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { total_amount, status } = req.body;
            await salesModel.updateSalesById(id, total_amount, status);

            req.session.message = { type: 'success', text: 'Transaksi berhasil diperbarui.' };
            res.redirect('/sales');
        } catch (err) {
            console.error('updateSales error:', err);
            req.session.message = { type: 'danger', text: 'Gagal memperbarui transaksi!' };
            res.redirect('/sales');
        }
    },

    // 🔷 Hapus transaksi
    deleteSales: async (req, res, next) => {
        try {
            const { id } = req.params;
            await salesModel.deleteSalesById(id);

            req.session.message = { type: 'success', text: 'Transaksi berhasil dihapus.' };
            res.redirect('/sales');
        } catch (err) {
            console.error('deleteSales error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus transaksi!' };
            res.redirect('/sales');
        }
    }
};

module.exports = salesController;