// const { Sequelize } = require('sequelize');
// const config = require('./config');

// const sequelize = new Sequelize({
//     dialect: 'sqlite',
//     storage: config.database.storage || './data/uwais-telur.sqlite',
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
