const path = require('path');
const express = require('express');

const assetsMiddleware = express.static(path.join(__dirname, '../assets'));

module.exports = assetsMiddleware;
