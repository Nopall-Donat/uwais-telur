module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (!req.session.admin_id) return res.redirect('/login');
        next();
    },
    redirectIfAuthenticated: (req, res, next) => {
        if (req.session.admin_id) return res.redirect('/');
        next();
    }
}
