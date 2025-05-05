const logger = (req, res, next) => {
    if (req.url.startsWith('/.well-known/')) {
        return next(); // Lewati logging untuk path tersebut
    }

    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
};

module.exports = logger;