const SalesModel = require('../models/salesModel');

exports.getAllSales = (req, res, next) => {
    SalesModel.getAll((err, transactions) => {
        if (err) {
            return next(err);
        }
        res.render('sales/index', {
            title: 'Transaksi - Uwais Telur',
            transactions
        });
    });
};

exports.getDetailSales = (req, res) => {
    res.render('sales/detail', { title: 'Detail Penjualan', saleId: req.params.id });
};