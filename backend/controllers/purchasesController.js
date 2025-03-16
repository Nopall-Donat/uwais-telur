exports.getAllPurchases = (req, res) => {
    res.render('purchases/index', { title: 'Data Pembelian - Uwais Telur' });
};

exports.getDetailPurchase = (req, res) => {
    res.render('purchases/details', { title: 'Detail Pembelian', purchaseId: req.params.id });
};