const errorMiddleware = (err, req, res) => {
    console.error(err.stack); // Logging error ke terminal

    const statusCode = err.status || 500; // Gunakan status error atau default 500
    const message = err.message || 'Terjadi kesalahan pada server';

    res.status(statusCode).render('error', {
        title: 'Error',
        statusCode: statusCode, 
        message: message 
    });
};

module.exports = errorMiddleware;