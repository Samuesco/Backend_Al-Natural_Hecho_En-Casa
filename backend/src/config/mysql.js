const mysql = require('mysql2/promise');

const pool = mysql.createPool({

    host: 'mysql',

    user: 'root',

    password: 'root',

    database: 'natural_products',

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0

});

module.exports = pool;