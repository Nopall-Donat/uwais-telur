const customerModel = require('../models/customersModel');
const { getCurrentTimestampWIB } = require('../../utils/time');

const customersController = {
    viewIndexCustomer: async (req, res, next) => {
        try {
            const customers = await customerModel.getAllCustomer();
            const message = req.session.message || null;
            delete req.session.message;
    
            res.render('customers/index', {
                title: 'Data Pelanggan',
                customers,
                message,
                search: '',
                limit: 10,
                page: 1, // Tambahkan ini
                totalPages: 1 // Tambahkan ini
            });
        } catch (err) {
            next(err);
        }
    },    

    getAllCustomer: async (req, res, next) => {
        try {
            const customers = await customerModel.getAllCustomer();
            res.json(customers);
        } catch (err) {
            console.error('getAllCustomer error:', err);
            next(err);
        }
    },

    getByIdCustomer: async (req, res, next) => {
        try {
            const customerData = await customerModel.getByIdCustomer(req.params.id);
            if (!customerData) {
                return res.status(404).json({ error: 'Customer not found' });
            }

            res.render('customers/details', {
                title: 'Detail Pelanggan',
                customer: customerData
            });
        } catch (err) {
            console.error('getByIdCustomer error:', err);
            next(err);
        }
    },

    // getAllLimitCustomer: async (req, res, next) => {
    //     try {
    //         const limit = parseInt(req.query.limit) || 10;
    //         const customers = await customerModel.getAllLimitCustomer(limit);
    //         res.json(customers);
    //     } catch (err) {
    //         console.error('getAllLimitCustomer error:', err);
    //         next(err);
    //     }
    // },

    updateByIdCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
            const { id } = req.params;
            const updatedAt = getCurrentTimestampWIB();

            await customerModel.updateByIdCustomer(id, name, phone_number, address, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil memperbarui data pelanggan!' };
            res.redirect('/customers');
        } catch (err) {
            console.error('updateByIdCustomer error:', err);
            req.session.message = { type: 'danger', text: 'Gagal memperbarui data pelanggan!' };
            res.redirect('/customers');
        }
    },

    createCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;

            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0'); // Bulan 0-11
            const yy = String(now.getFullYear()).slice(-2);
            const datePart = `${dd}${mm}${yy}`;

            const createdAt = getCurrentTimestampWIB();
            const updatedAt = getCurrentTimestampWIB();

            const customersToday = await customerModel.getCustomersByDate(datePart);
            const orderNumber = String(customersToday.length + 1).padStart(2, '0');
            const customerId = `P${datePart}${orderNumber}`;

            const isExist = await customerModel.getByIdCustomer(customerId);
            if (isExist) {
                throw new Error('Customer ID already exists, please try again.');
            }

            await customerModel.createCustomer(customerId, name, phone_number, address, createdAt, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil menambahkan pelanggan!' };
            res.redirect('/customers');
        } catch (err) {
            console.error('createCustomer error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan pelanggan!' };
            res.redirect('/customers');
        }
    },

    deleteCustomer: async (req, res, next) => {
        try {
            const { id } = req.params;
            await customerModel.deleteCustomer(id);

            req.session.message = { type: 'success', text: 'Berhasil menghapus pelanggan!' };
            res.redirect('/customers');
        } catch (err) {
            console.error('deleteCustomer error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus pelanggan!' };
            res.redirect('/customers');
        }
    },

    listCustomers: async (req, res, next) => {
        try {
            const search = req.query.search || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [customers, totalCustomers] = await Promise.all([
                customerModel.getCustomersPaginated(search, limit, offset),
                customerModel.countCustomers(search)
            ]);

            const totalPages = Math.ceil(totalCustomers / limit);

            if (req.xhr) {
                res.render('customers/_table', { customers, search, limit, page, totalPages, title: 'Data Pelanggan' }, (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error render partial table.');
                    }
                    res.send(html);
                });
            } else {
                res.render('customers/index', {
                    title: 'Data Pelanggan',
                    customers,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null,
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('customerController.listCustomers error:', err);
            res.redirect('/');
        }
    },
};

module.exports = customersController;