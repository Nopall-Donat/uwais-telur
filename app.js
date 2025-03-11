const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const config = require('./config/config');

// Routes API
const pageRoutes = require('./routes/CLIENT/pageRoutes');
const loggerMiddleware = require('./API/middleware/loggerMiddleware');
const errorHandler = require('./API/middleware/errorMiddleware');

const app = express();
const PORT = config.port;

// Static files middleware dengan custom 404
app.use(loggerMiddleware);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/assets', express.static(path.join(__dirname, 'CLIENT', 'assets'), {
    fallthrough: false // Akan mengembalikan 404 jika file tidak ditemukan
}), (err, req, res, next) => {
    if (err.status === 404) {
        console.log(`Asset tidak ditemukan: ${req.path}`);
        return res.status(404).send('Asset tidak ditemukan');
    }
    next(err);
});

// Set view engine dan folder views untuk EJS
app.set('views', path.join(__dirname, 'CLIENT', 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', pageRoutes);

// ERROR handler
app.use((req, res, next) => {
    res.status(404).render('error', { title: "Halaman Tidak Ditemukan" });
});

app.use(errorHandler);

// Server
app.listen(PORT, () => {
    console.log(`Server berjalan di mode ${config.env}`);
    console.log(`http://localhost:${PORT}`);
});
