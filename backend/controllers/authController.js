const bcrypt = require('bcryptjs');
const adminsModel = require('../models/adminsModel');

module.exports = {
    renderLoginPage: (req, res) => {
        if (req.session.admin_id) return res.redirect('/');
        res.render('auth/login', { title: 'Login' });
    },

    processLogin: async (req, res) => {
        try {
            const { username, password } = req.body; // ✅ gunakan `username`, bukan `admin_id`
            console.log('Login attempt with username:', username);
            console.log('Login attempt with password:', password);

            if (!username || !password) {
                req.flash('error', 'Username dan password wajib diisi.');
                return res.redirect('/login');
            }

            const admin = await adminsModel.getAdminByUsername(username);

            if (!admin) {
                req.flash('error', 'Username tidak ditemukan.');
                return res.redirect('/login');
            }

            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                req.flash('error', 'Password salah.');
                return res.redirect('/login');
            }

            // ✅ Simpan info login ke session
            req.session.admin_id = admin.admin_id;
            req.session.admin_name = admin.admin_name;

            res.redirect('/');
        } catch (err) {
            console.error('Login error:', err);
            req.flash('error', 'Terjadi kesalahan saat login.');
            res.redirect('/login');
        }
    },

    logout: (req, res) => {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
};