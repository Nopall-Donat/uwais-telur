const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const config = require('./config/config');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
const PORT = config.port;

// ================================
// 🔧 Middleware Kustom & Umum
// ================================
const loggerMiddleware = require('./backend/middleware/loggerMiddleware');
const errorMiddleware = require('./backend/middleware/errorMiddleware');

// ================================
// 🔁 Routes Import
// ================================
const authRoutes = require('./backend/routes/auth');
const salesRoutes = require('./backend/routes/sales');
const purchasesRoutes = require('./backend/routes/purchases');
const itemsRoutes = require('./backend/routes/items');
const customersRoutes = require('./backend/routes/customers');
const suppliersRoutes = require('./backend/routes/suppliers');
const adminsRoutes = require('./backend/routes/admins');

// ================================
// 🔐 Middleware Global
// ================================
app.use(loggerMiddleware);

app.get('/.well-known/*', (req, res) => {
    res.status(204).send(); // Sukses tanpa konten
});

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            fontSrc: ["'self'", "data:"],
        },
    },
}));

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(flash());

app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized
}));

// Inject data session ke view
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    res.locals.admin_id = req.session.admin_id;
    res.locals.admin_name = req.session.admin_name;
    next();
});

// ================================
// 🌐 Static File Handling
// ================================
app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets'), {
    fallthrough: false
}), (err, req, res, next) => {
    if (err.status === 404) {
        console.log(`Asset tidak ditemukan: ${req.path}`);
        return res.status(404).send('Asset tidak ditemukan');
    }
    next(err);
});

// ================================
// 🎨 View Engine
// ================================
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'ejs');

// ================================
// 🚀 Routing
// ================================
app.use('/', authRoutes); // Login/logout duluan
app.use('/', salesRoutes);
app.use('/customers', customersRoutes);
app.use('/purchases', purchasesRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/items', itemsRoutes);
app.use('/admins', adminsRoutes);

// ================================
// ❌ Error Handling
// ================================
app.use(errorMiddleware);

app.use((req, res, next) => {
    const error = new Error('Halaman tidak ditemukan');
    error.status = 404;
    next(error);
});

// ================================
// ✅ Start Server
// ================================
app.listen(PORT, () => {
    console.log(`Server berjalan di mode ${config.env}`);
    console.log(`http://localhost:${PORT}`);
});