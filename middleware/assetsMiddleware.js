const path = require('path');
const express = require('express');
const app = express();

// Middleware untuk file statis
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

// Jalankan server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
