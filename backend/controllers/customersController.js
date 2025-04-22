const Customer = require('../models/customersModel');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    viewIndexCustomer: async (req, res, next) => {
        try {
            const customers = await Customer.getAllCustomer();
            res.render('customers/index', {
                title: 'Data Pelanggan',
                customers
            });
        } catch (err) {
            next(err);
        }
    },

    getAllCustomer: async (req, res, next) => {
        try {
            const customers = await Customer.getAllCustomer();
            res.json(customers);
        } catch (err) {
            next(err);
        }
    },

    getByIdCustomer: async (req, res, next) => {
        try {
            const customer = await Customer.getByIdCustomer(req.params.id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });
            res.json(customer);
        } catch (err) {
            next(err);
        }
    },

    getAllLimitCustomer: async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const customers = await Customer.getAllLimitCustomer(limit);
            res.json(customers);
        } catch (err) {
            next(err);
        }
    },

    updateByIdCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
            await Customer.updateByIdCustomer(req.params.id, name, phone_number, address);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    createCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
            const customerId = `CUST-${uuidv4().slice(0, 8)}`;
            await Customer.createCustomer(customerId, name, phone_number, address);
            res.json({ success: true, customer_id: customerId, name });
        } catch (err) {
            next(err);
        }
    },

    deleteCustomer: async (req, res, next) => {
        try {
            await Customer.deleteCustomer(req.params.id);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    getCustomerNameList: async (req, res, next) => {
        try {
            const customers = await Customer.getCustomerNameList();
            res.json(customers);
        } catch (err) {
            next(err);
        }
    }
};
