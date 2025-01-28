const express = require('express');
const path = require('path');
// const { connectDB } = require('./config/db');
// const productRoutes = require('./routes/productRoutes');
// const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// // Koneksi ke database
// connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, ''))); // Untuk file statis (CSS, gambar)
// Middleware untuk file statis
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Set view engine menjadi EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route untuk mengarahkan ke index.html
// app.get('/', (req, res) => {
//     res.render(path.join(__dirname, 'views', 'index.ejs'));
// });  
app.get('/', (req, res) => {
    res.render('index', { title: 'Uwais Telur' });
});

// // API routes
// app.use('/api/products', productRoutes);
// app.use('/api/transactions', transactionRoutes);

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
