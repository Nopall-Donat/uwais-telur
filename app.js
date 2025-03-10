const express = require('express');
const path = require('path');
const config = require('./config/config');
const pageRoutes = require('./routes/pageRoutes');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = config.port;

app.use(loggerMiddleware);
// Static files middleware dengan custom 404
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
    fallthrough: false // Akan mengembalikan 404 jika file tidak ditemukan
}), (err, req, res, next) => {
    if (err.status === 404) {
        console.log(`Asset tidak ditemukan: ${req.path}`);
        return res.status(404).send('Asset tidak ditemukan');
    }
    next(err);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Uwais Telur' });
});

app.use('/', pageRoutes);

// 404 handler
app.use((req, res, next) => {
    const error = new Error('Halaman tidak ditemukan');
    error.status = 404;
    next(error);
});

// Error handler
app.use(errorHandler);

// Server
app.listen(PORT, () => {
    console.log(`Server berjalan di mode ${config.env}`);
    console.log(`http://localhost:${PORT}`);
});
