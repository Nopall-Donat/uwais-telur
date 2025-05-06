const itemsModel = require('../models/itemsModel');
const suppliersModel = require('../models/suppliersModel');
const { getCurrentTimestampWIB } = require('../../utils/time');

const itemsController = {
    // Halaman index
    viewIndexItems: async (req, res, next) => {
        try {
            const items = await itemsModel.getAllItems();
            const suppliers = await suppliersModel.getAllSupplier(); // ✅ Panggil supplier di sini
            const message = req.session.message || null;
            delete req.session.message;

            res.render('items/index', {
                title: 'Data Stok Barang',
                items,
                suppliers, // ✅ Kirim ke view
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

    // Get semua item
    getAllItems: async (req, res, next) => {
        try {
            const items = await itemsModel.getAllItems();
            res.json(items);
        } catch (err) {
            console.error('getAllItems error:', err);
            next(err);
        }
    },

    // Detail item
    getByIdItem: async (req, res, next) => {
        try {
            const item = await itemsModel.getByIdItem(req.params.id);
            const suppliers = await suppliersModel.getAllSupplier(); // ✅ ambil supplier
    
            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }
    
            res.render('items/details', {
                title: 'Detail Stok Barang',
                item,
                suppliers // ✅ kirim ke view
            });
        } catch (err) {
            next(err);
        }
    },    

    // Tambah item baru
    createItem: async (req, res, next) => {
        try {
            const {
                item_code, item_type, supplier_id,
                stock_quantity, purchase_price,
                selling_price, unit
            } = req.body;

            const updatedAt = getCurrentTimestampWIB();

            // Cek jika item_code sudah ada
            const isExist = await itemsModel.getByIdItem(item_code);
            if (isExist) {
                req.session.message = { type: 'danger', text: 'Kode item sudah terdaftar!' };
                return res.redirect('/items');
            }

            await itemsModel.createItem(
                item_code, item_type, supplier_id,
                parseInt(stock_quantity), parseFloat(purchase_price),
                parseFloat(selling_price), unit, updatedAt
            );

            req.session.message = { type: 'success', text: 'Berhasil menambahkan item!' };
            res.redirect('/items');
        } catch (err) {
            console.error('createItem error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan item!' };
            res.redirect('/items');
        }
    },

    // Update item
    updateByIdItem: async (req, res, next) => {
        try {
            const {
                item_type, supplier_id, stock_quantity,
                purchase_price, selling_price, unit
            } = req.body;
            const { id } = req.params;
            const updatedAt = getCurrentTimestampWIB();

            await itemsModel.updateByIdItem(
                id, item_type, supplier_id,
                parseInt(stock_quantity), parseFloat(purchase_price),
                parseFloat(selling_price), unit, updatedAt
            );

            req.session.message = { type: 'success', text: 'Berhasil memperbarui data item!' };
            res.redirect('/items');
        } catch (err) {
            console.error('updateByIdItem error:', err);
            req.session.message = { type: 'danger', text: 'Gagal memperbarui data item!' };
            res.redirect('/items');
        }
    },

    // Hapus item
    deleteItem: async (req, res, next) => {
        try {
            const { id } = req.params;
            await itemsModel.deleteItem(id);

            req.session.message = { type: 'success', text: 'Berhasil menghapus item!' };
            res.redirect('/items');
        } catch (err) {
            console.error('deleteItem error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus item!' };
            res.redirect('/items');
        }
    },

    // Paginated AJAX untuk tabel
    listItems: async (req, res, next) => {
        try {
            const search = req.query.search || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [items, totalItems] = await Promise.all([
                itemsModel.getItemsPaginated(search, limit, offset),
                itemsModel.countItems(search)
            ]);

            const totalPages = Math.ceil(totalItems / limit);

            if (req.xhr) {
                res.render('items/_table', {
                    items, search, limit, page, totalPages, title: 'Data Stok'
                }, (err, html) => {
                    if (err) return res.status(500).send('Error render table.');
                    res.send(html);
                });
            } else {
                res.render('items/index', {
                    title: 'Data Stok',
                    items, search, limit, page, totalPages,
                    message: req.session.message || null
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('listItems error:', err);
            res.redirect('/');
        }
    },
};

module.exports = itemsController;