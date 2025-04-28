require('dotenv').config();

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    
    // Database
    database: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        name: process.env.DB_NAME,
        storage: process.env.DB_STORAGE
    },

    // Session
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    },

};

module.exports = config; 