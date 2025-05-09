const adminsModel = require('../models/adminsModel');
const bcrypt = require('bcryptjs');
const { getCurrentTimestampWIB } = require('../../utils/time');

const adminsController = {
    viewIndexAdmins: async (req, res, next) => {
        try {
            const admins = await adminsModel.getAllAdmins();
            const message = req.session.message || null;
            delete req.session.message;

            res.render('admins/index', {
                title: 'Data Admin',
                admins,
                message,
                search: '',
                limit: 10,
                page: 1,
                totalPages: 1,
                message: req.session.message || null,
            });
        } catch (err) {
            next(err);
        }
    },

    getAllAdmins: async (req, res, next) => {
        try {
            const admins = await adminsModel.getAllAdmins();
            res.json(admins);
        } catch (err) {
            console.error('getAllAdmins error:', err);
            next(err);
        }
    },

    getByIdAdmin: async (req, res, next) => {
        try {
            const admin = await adminsModel.getByIdAdmin(req.params.id);
            if (!admin) return res.status(404).send('Admin tidak ditemukan.');

            res.render('admins/details', {
                title: 'Detail Admin',
                admin,
                message: req.session.message || null,
            });
        } catch (err) {
            next(err);
        }
    },

    createAdmin: async (req, res, next) => {
        try {
            const { username, admin_name, password, confirm_password } = req.body;

            if (password !== confirm_password) {
                req.session.message = { type: 'danger', text: 'Password konfirmasi tidak cocok.' };
                return res.redirect('/admins');
            }

            const now = new Date();
            const dd = String(now.getDate()).padStart(2, '0');
            const mm = String(now.getMonth() + 1).padStart(2, '0');
            const yy = String(now.getFullYear()).slice(-2);
            const datePart = `${dd}${mm}${yy}`;

            const createdAt = getCurrentTimestampWIB();
            const updatedAt = getCurrentTimestampWIB();

            const adminsToday = await adminsModel.getAdminsByDate(datePart);
            const orderNumber = String(adminsToday.length + 1).padStart(2, '0');
            const adminId = `A${datePart}${orderNumber}`;

            const hashedPassword = await bcrypt.hash(password, 12);

            await adminsModel.createAdmin(adminId, username, admin_name, hashedPassword, createdAt, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil menambahkan admin baru!' };
            res.redirect('/admins');
        } catch (err) {
            console.error('createAdmin error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menambahkan admin!' };
            res.redirect('/admins');
        }
    },

    updateByIdAdmin: async (req, res, next) => {
        try {
            const { username, admin_name, password, confirm_password } = req.body;
            const { id } = req.params;

            if (password !== confirm_password) {
                req.session.message = { type: 'danger', text: 'Password konfirmasi tidak cocok.' };
                return res.redirect('/admins/details/' + id);
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const updatedAt = getCurrentTimestampWIB();

            await adminsModel.updateByIdAdmin(id, username, admin_name, hashedPassword, updatedAt);

            req.session.message = { type: 'success', text: 'Berhasil memperbarui data admin!' };
            return res.redirect('/admins/details/' + id);
        } catch (err) {
            console.error('updateByIdAdmin error:', err);
            req.session.message = { type: 'danger', text: 'Gagal memperbarui admin!' };
            return res.redirect('/admins/details/' + id);
        }
    },

    deleteAdmin: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { confirm_password } = req.body;
            const sessionId = req.session.admin_id;

            const sessionAdmin = await adminsModel.getByIdAdmin(sessionId);
            const isValid = await bcrypt.compare(confirm_password, sessionAdmin.password);

            if (!isValid) {
                req.session.message = { type: 'danger', text: 'Password verifikasi salah. Tidak bisa menghapus.' };
                return res.redirect('/admins');
            }

            await adminsModel.deleteAdmin(id);

            req.session.message = { type: 'success', text: 'Berhasil menghapus admin!' };
            res.redirect('/admins');
        } catch (err) {
            console.error('deleteAdmin error:', err);
            req.session.message = { type: 'danger', text: 'Gagal menghapus admin!' };
            res.redirect('/admins');
        }
    },

    listAdmins: async (req, res, next) => {
        try {
            const search = req.query.search || '';
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;
            const offset = (page - 1) * limit;

            const [admins, totalAdmins] = await Promise.all([
                adminsModel.getAdminsPaginated(search, limit, offset),
                adminsModel.countAdmins(search)
            ]);

            const totalPages = Math.ceil(totalAdmins / limit);

            if (req.xhr) {
                res.render('admins/_table', { admins, search, limit, page, totalPages, title: 'Data Admin' }, (err, html) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Error render partial table.');
                    }
                    res.send(html);
                });
            } else {
                res.render('admins/index', {
                    title: 'Data Admin',
                    admins,
                    search,
                    limit,
                    page,
                    totalPages,
                    message: req.session.message || null,
                });
                delete req.session.message;
            }
        } catch (err) {
            console.error('adminsController.listAdmins error:', err);
            res.redirect('/');
        }
    }
};

module.exports = adminsController;