const bcrypt = require('bcryptjs');
const adminsModel = require('../models/adminsModel');

module.exports = {
    renderLoginPage: (req, res) => {
        if (req.session.admin_id) return res.redirect('/');
        res.render('auth/login', { title: 'Login' });
    },

    processLogin: async (req, res) => {
        try {
            const { username, password } = req.body;
            console.log('Login attempt with username:', username);
            console.log('Login attempt with password:', password);

            if (!username || !password) {
                req.session.message = { type: 'danger', text: 'Username dan password wajib diisi.' };
                return res.redirect('/login');
            }

            const admin = await adminsModel.getAdminByUsername(username);

            if (!admin) {
                req.session.message = { type: 'danger', text: 'Username tidak ditemukan.' };
                return res.redirect('/login');
            }

            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                req.session.message = { type: 'danger', text: 'Password salah.' };
                return res.redirect('/login');
            }

            req.session.admin_id = admin.admin_id;
            req.session.admin_name = admin.admin_name;

            return res.redirect('/');
        } catch (err) {
            console.error('Login error:', err);
            req.session.message = { type: 'danger', text: 'Terjadi kesalahan saat login.' };
            return res.redirect('/login');
        }
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};