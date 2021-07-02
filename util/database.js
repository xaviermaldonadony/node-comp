const mysql = require('mysql2');

const pool = mysql.createPool({
	host: 'localhost',
	user: 'root',
	database: 'sakila',
	password: '3352',
	port: 3307,
});

module.exports = pool.promise();
