// Error handler middleware
const errorHandler = (err, req, res) => {
    // Log error untuk debugging
    console.error(err.stack);

    // Status error, default 500 jika tidak ada
    const status = err.status || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    // Jika dalam mode development, kirim stack trace
    const error = process.env.NODE_ENV === 'development' ? {
        message,
        stack: err.stack
    } : {
        message
    };

    // Render halaman error
    res.status(status);
    
    // Jika request API (ajax), kirim JSON
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ error });
    }

    // Jika request biasa, render halaman error
    res.render('error', { 
        title: 'Error',
        status,
        message,
        error
    });
};

module.exports = errorHandler; 