const salesModel = require('../models/salesModel');

module.exports = {
    indexSales: async (req, res, next) => {
        try {
            const salesList = await salesModel.getAllSalesTransactions();
            res.render('sales/index', {
                title: 'Transaksi - Uwais Telur',
                salesList
            });
        } catch (err) {
            // Lempar ke error handler Express
            next(err);
        }
    },

    detailSales: async (req, res, next) => {
        try {
            const { id } = req.params;
            const detail = await salesModel.getSalesTransactionDetail(id);
            if (!detail) {
                // Tidak ditemukan → 404
                return res.status(404).render('error', {
                    title: 'Detail Transaksi - Uwais Telur',
                    statusCode: 404,
                    message: 'Transaksi tidak ditemukan'
                });
            }
            res.render('sales/details', {
                title: 'Detail Transaksi - Uwais Telur',
                detail
            });
        } catch (err) {
            next(err);
        }
    },

    createSales: async (req, res, next) => {
        try {
            const { salesTransactionId, adminId, customerId, totalAmount, status } = req.body;
            await salesModel.createSalesTransaction(salesTransactionId, adminId, customerId, totalAmount, status);
            res.redirect(`/sales/${salesTransactionId}/detail`);
        } catch (err) {
            next(err);
        }
    }
};
