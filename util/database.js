const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node-complete', 'root', '3352', {
	dialect: 'mysql',
	port: 3307,
	host: 'localhost',
});

module.exports = sequelize;
