const express = require('express');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const config = require('./config/config');

// Routes API
const loggerMiddleware = require('./backend/middleware/loggerMiddleware');
const errorMiddleware = require('./backend/middleware/errorMiddleware');

// Import route
const salesRoutes = require('./backend/routes/sales');
const purchasesRoutes = require('./backend/routes/purchases');
const itemsRoutes = require('./backend/routes/items');
const customersRoutes = require('./backend/routes/customers');
const suppliersRoutes = require('./backend/routes/suppliers');
const adminsRoutes = require('./backend/routes/admins');

const app = express();
const PORT = config.port;

// Static files middleware dengan custom 404
app.use(loggerMiddleware);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'frontend', 'assets'), {
    fallthrough: false // Akan mengembalikan 404 jika file tidak ditemukan
}), (err, req, res, next) => {
    if (err.status === 404) {
        console.log(`Asset tidak ditemukan: ${req.path}`);
        return res.status(404).send('Asset tidak ditemukan');
    }
    next(err);
});

// Set view engine dan folder views untuk EJS
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', salesRoutes);
app.use('/purchases', purchasesRoutes);
app.use('/items', itemsRoutes);
app.use('/customers', customersRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/admins', adminsRoutes);

// Middleware untuk menangani halaman yang tidak ditemukan (404)
app.use((req, res, next) => {
    const error = new Error('Halaman tidak ditemukan');
    error.status = 404;
    next(error); // Kirim error ke errorMiddleware
});

// Middleware error handling
app.use(errorMiddleware);

// Server
app.listen(PORT, () => {
    console.log(`Server berjalan di mode ${config.env}`);
    console.log(`http://localhost:${PORT}`);
});
