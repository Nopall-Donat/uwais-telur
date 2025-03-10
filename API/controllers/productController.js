const Product = require('../models/productModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, price, stock } = req.body;
        const product = await Product.create({ name, price, stock });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
