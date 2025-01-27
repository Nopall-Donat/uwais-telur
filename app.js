const express = require('express');
const path = require('path');
// const { connectDB } = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// // Koneksi ke database
// connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src'))); // Untuk file statis (CSS, gambar)

// Route untuk mengarahkan ke index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
