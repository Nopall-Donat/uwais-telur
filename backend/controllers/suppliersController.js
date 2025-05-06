const supplierModel = require('../models/suppliersModel');
const { getCurrentTimestampWIB } = require('../../utils/time');

const suppliersController = {
    viewIndexSupplier: async (req, res, next) => {
        try {
            const suppliers = await supplierModel.getAllSupplier();
            const message = req.session.message || null;
            delete req.session.message;

            res.render('suppliers/index', {
                title: 'Data Pemasok',
                suppliers,
                message,
                search: '',
                limit: 10,
                page: 1,
                totalPages: 1
            });
        } catch (err) {
            next(err);
        }
    },

    getAllSupplier: async (req, res, next) => {
        try {
            const suppliers = await supplierModel.getAllSupplier();
            res.json(suppliers);
        } catch (err) {
            console.error('getAllSupplier error:', err);
            next(err);
        }
    },

    getByIdSupplier: async (req, res, next) => {
        try {
            const supplierData = await supplierModel.getByIdSupplier(req.params.id);
            if (!supplierData) {
                return res.status(404).json({ error: 'Supplier not found' });
            }

            res.render('suppliers/details', {
                title: 'Detail Pemasok',
                supplier: supplierData
            });
        } catch (err) {
            console.error('getByIdSupplier error:', err);
            next(err);
        }
    },

    updateByIdSupplier: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
            const { id } = req.params;
            const updatedAt = getCurrentTimestampWIB();

            await supplierModel.updateByIdSupplier(id, name, phone_number, address, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil memperbarui data pemasok!' };
            res.redirect('/suppliers');
        } catch (err) {
            console.error('updateByIdSupplier error:', err);
            req.session.message = { type: 'danger', text: 'Gagal memperbarui data pemasok!' };
            res.redirect('/suppliers');
        }
    },

    createSupplier: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;

            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yy = String(now.getFullYear()).slice(-2);
            const datePart = `${dd}${mm}${yy}`;

            const createdAt = getCurrentTimestampWIB();
            const updatedAt = getCurrentTimestampWIB();

            const suppliersToday = await supplierModel.getSuppliersByDate(datePart);
            const orderNumber = String(suppliersToday.length + 1).padStart(2, '0');
            const supplierId = `S${datePart}${orderNumber}`;

            const isExist = await supplierModel.getByIdSupplier(supplierId);
            if (isExist) {
                throw new Error('Supplier ID already exists, please try again.');
            }

            await supplierModel.createSupplier(supplierId, name, phone_number, address, createdAt, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil menambahkan pemasok!' };
            res.redirect('/suppliers');
        } catch (err) {
            console.error('createSupplier error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan pemasok!' };
            res.redirect('/suppliers');
        }
    },

    deleteSupplier: async (req, res, next) => {
        try {
            const { id } = req.params;
            await supplierModel.deleteSupplier(id);

            req.session.message = { type: 'success', text: 'Berhasil menghapus pemasok!' };
            res.redirect('/suppliers');
        } catch (err) {
            console.error('deleteSupplier error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus pemasok!' };
            res.redirect('/suppliers');
        }
    },

    listSuppliers: async (req, res, next) => {
        try {
            const search = req.query.search || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [suppliers, totalSuppliers] = await Promise.all([
                supplierModel.getSuppliersPaginated(search, limit, offset),
                supplierModel.countSuppliers(search)
            ]);

            const totalPages = Math.ceil(totalSuppliers / limit);

            if (req.xhr) {
                res.render('suppliers/_table', { suppliers, search, limit, page, totalPages, title: 'Data Pemasok' }, (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error render partial table.');
                    }
                    res.send(html);
                });
            } else {
                res.render('suppliers/index', {
                    title: 'Data Pemasok',
                    suppliers,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null,
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('suppliersController.listSuppliers error:', err);
            res.redirect('/');
        }
    },
};

module.exports = suppliersController;