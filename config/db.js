const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/uwaistelur.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

module.exports = db;






// const { Sequelize } = require('sequelize');
// const config = require('./config');

// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: config.database.storage || './data/uwaistelur.db',
//     logging: config.env === 'development' ? console.log : false
// });

// const connectDB = async () => {
//     try {
//         await sequelize.authenticate();
//         console.log('Database terhubung!');
//     } catch (error) {
//         console.error('Koneksi database gagal:', error);
//     }
// };

// module.exports = { sequelize, connectDB };
