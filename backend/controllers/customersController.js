const customer = require('../models/customersModel');
const { getCurrentTimestampWIB } = require('../../utils/time');

module.exports = {
    viewIndexCustomer: async (req, res, next) => {
        try {
            const customers = await customer.getAllCustomer();
    
            // Ambil message lalu hapus setelah dibaca
            const message = req.session.message;
            delete req.session.message;
    
            res.render('customers/index', {
                title: 'Data Pelanggan',
                customers,
                message // kirim ke view
            });
        } catch (err) {
            next(err);
        }
    },      

    getAllCustomer: async (req, res, next) => {
        try {
            const customers = await customer.getAllCustomer();
            res.json(customers);
        } catch (err) {
            next(err);
        }
    },

    getByIdCustomer: async (req, res, next) => {
        try {
            const customer = await customer.getByIdCustomer(req.params.id);
            if (!customer) return res.status(404).json({ error: 'Customer not found' });
            res.json(customer);
        } catch (err) {
            next(err);
        }
    },

    getAllLimitCustomer: async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const customers = await customer.getAllLimitCustomer(limit);
            res.json(customers);
        } catch (err) {
            next(err);
        }
    },

    updateByIdCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
            await customer.updateByIdCustomer(req.params.id, name, phone_number, address);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    createCustomer: async (req, res, next) => {
        try {
            const { name, phone_number, address } = req.body;
    
            // 1. Generate tanggal hari ini (pakai Date biasa untuk bikin kode ID)
            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0'); // ingat, bulan 0-11
            const yy = String(now.getFullYear()).slice(-2);
    
            // 2. Ambil timestamp Waktu Indonesia Barat (untuk created_at & updated_at)
            const createdAt = getCurrentTimestampWIB();
            const updatedAt = getCurrentTimestampWIB();
    
            const datePart = `${dd}${mm}${yy}`;
    
            // 3. Cari berapa banyak customer yang sudah dibuat hari ini
            const customersToday = await customer.getCustomersByDate(datePart);
    
            // 4. Hitung urutan berikutnya
            const orderNumber = String(customersToday.length + 1).padStart(2, '0'); // 01, 02, 03...
    
            // 5. Bentuk final ID
            const customerId = `P${datePart}${orderNumber}`;
    
            // 6. Pastikan ID ini benar-benar belum ada
            const isExist = await customer.findCustomerById(customerId);
            if (isExist) {
                throw new Error('Customer ID already exists, please try again.');
            }
    
            // 7. Simpan ke database
            await customer.createCustomer(customerId, name, phone_number, address, createdAt, updatedAt);
    
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
            await customer.deleteCustomer(id);
    
            req.session.message = { type: 'success', text: 'Berhasil menghapus pelanggan!' };
            res.redirect('/customers');
        } catch (err) {
            req.session.message = { type: 'danger', text: 'Gagal menghapus pelanggan!' };
            res.redirect('/customers');
        }
    },
    
    getCustomerNameList: async (req, res, next) => {
        try {
            const customers = await customer.getCustomerNameList();
            res.json(customers);
        } catch (err) {
            next(err);
        }
    }
};
