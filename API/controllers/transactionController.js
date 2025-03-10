const Transaction = require('../models/transactionModel');
const Product = require('../models/productModel');

exports.addTransaction = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const product = await Product.findByPk(productId);
        if (!product || product.stock < quantity) {
            return res.status(400).json({ error: 'Stok tidak cukup' });
        }

        const totalPrice = quantity * product.price;
        product.stock -= quantity;
        await product.save();

        const transaction = await Transaction.create({ productId, quantity, totalPrice });
        res.status(201).json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
