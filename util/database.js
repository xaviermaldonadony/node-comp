const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

let _db;
const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
);

const mongoConnect = (callback) => {
	MongoClient.connect(DB)
		.then((client) => {
			console.log('Connected');
			_db = client.db();
			callback();
		})
		.catch((err) => {
			console.log(err);
			throw err;
		});
};
const getDb = () => {
	if (_db) {
		return _db;
	}
	throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
