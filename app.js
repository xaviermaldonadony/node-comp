const path = require('path');
const fs = require('fs');
// const https = require('https');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
// const morgan = require('morgan');

const errorController = require('./controllers/error');
const User = require('./models/user');

dotenv.config({ path: './config.env' });

const MONGO_DB_URI = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD
).replace('<USER>', process.env.MONGO_USER);

const app = express();
const store = new MongoDBStore({
	uri: MONGO_DB_URI,
	collection: 'sessions',
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');

const fileStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		// error usually goes where null is at
		// null, okay to store it
		cb(null, 'images');
	},
	filename: (req, file, cb) => {
		cb(null, `${new Date().toISOString()}-${file.originalname}`);
	},
});
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// const accessLogStream = fs.createWriteStream(
// 	path.join(__dirname, 'access.log'),
// 	{
// 		flags: 'a',
// 	}
// );

app.use(helmet());
app.use(compression());
// app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(
	session({
		secret: 'my secret session',
		resave: false,
		saveUninitialized: false,
		store,
	})
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	// local varibles passed onto the views
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	User.findById(req.session.user._id)
		.then((user) => {
			// set a user only for this request, create a user based on session
			// user only lives on that req but it's data is from the session
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch((err) => {
			// use it in async calls,or call backs
			next(new Error(err));
		});
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
	// res.redirect('/500');
	res.status(500).render('500', {
		pageTitle: 'Something went wrong',
		path: '/500',
		isAuthenticated: req.session.isLoggedIn,
	});
});

mongoose
	.connect(MONGO_DB_URI)
	.then((result) => {
		// https
		// .createServer({ key: privateKey, cert: certificate }, app)
		// .listen(process.env.PORT || 3000);
		app.listen(process.env.PORT || 3000);
	})
	.catch((err) => {
		console.log(err);
	});

// 12
