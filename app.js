const express = require('express');
const path = require('path');
const config = require('./config/config');
const pageRoutes = require('./routes/pageRoutes');
const assetsMiddleware = require('./middleware/assetsMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = config.port;

app.use(loggerMiddleware);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', assetsMiddleware);

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
