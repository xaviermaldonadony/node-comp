const { validationResult } = require('express-validator/check');

const fileHelper = require('../util/file');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	if (!req.session.isLoggedIn) {
		return res.redirect('/login');
	}
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
		hasError: false,
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postAddProduct = (req, res, next) => {
	const { title, price, description } = req.body;
	const image = req.file;
	const errors = validationResult(req);
	console.log(image);
	console.log(errors);
	if (!image) {
		console.log('postAddProduct');
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
			},
			errorMessage: 'Attached file is not an image.',
			validationErrors: [],
		});
	}
	// error exsists
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Add Product',
			path: '/admin/add-product',
			editing: false,
			hasError: true,
			product: {
				title,
				price,
				description,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	// valid file
	const imageUrl = image.path;

	const product = new Product({
		title,
		price,
		description,
		imageUrl,
		userId: req.user,
	});

	product
		.save()
		.then((result) => {
			// console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => {
			// return res.status(500).render('admin/edit-product', {
			// 	pageTitle: 'Add Product',
			// 	path: '/admin/add-product',
			// 	editing: false,
			// 	hasError: true,
			// 	product: {
			// 		title,
			// 		imageUrl,
			// 		price,
			// 		description,
			// 	},
			// 	errorMessage: 'Database operation failed, please try again later',
			// 	validationErrors: [],
			// res.redirect('/500');
			const error = new Error(err);
			error.httpsStatusCode = 500;
			return next(error);
		});
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	const prodId = req.params.productId;

	if (!editMode) {
		return res.redirect('/');
	}

	Product.findById(prodId)
		.then((product) => {
			if (!product) {
				return res.redirect('/');
			}
			res.render('admin/edit-product', {
				pageTitle: 'Edit Product',
				path: '/admin/edit-product',
				editing: editMode,
				product,
				hasError: false,
				errorMessage: null,
				validationErrors: [],
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpsStatusCode = 500;
			return next(error);
		});
};

exports.postEditProduct = (req, res, next) => {
	const {
		productId,
		title: updatedTitle,
		price: updatedPrice,
		description: updatedDesc,
	} = req.body;
	const image = req.file;
	const errors = validationResult(req);

	// error exsists
	if (!errors.isEmpty()) {
		return res.status(422).render('admin/edit-product', {
			pageTitle: 'Edit Product',
			path: '/admin/edit-product',
			editing: true,
			hasError: true,
			product: {
				title: updatedTitle,
				price: updatedPrice,

				description: updatedDesc,
				_id: productId,
			},
			errorMessage: errors.array()[0].msg,
			validationErrors: errors.array(),
		});
	}

	Product.findById(productId)
		.then((product) => {
			// user/non owner,  can't edit them
			if (product.userId.toString() !== req.user._id.toString()) {
				return res.redirect('/');
			}
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			if (image) {
				fileHelper.deleFile(product.imageUrl);
				product.imageUrl = image.path;
			}

			return product.save().then((result) => {
				// console.log('updated Product');
				res.redirect('/admin/products');
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpsStatusCode = 500;
			return next(error);
		});
};

exports.getProducts = (req, res, next) => {
	Product.find({ userId: req.user._id })
		// .select('title price -_id')
		// gets our user instead of querying, only name
		// .populate('userId', 'name')
		.then((products) => {
			// console.log(products);
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			});
		})
		.catch((err) => {
			const error = new Error(err);
			error.httpsStatusCode = 500;
			return next(error);
		});
};

exports.deleteProduct = (req, res, next) => {
	console.log('postDeleteProduct');
	const { productId } = req.params;

	Product.findById(productId)
		.then((product) => {
			console.log('product', product);
			if (!product) {
				return next(new Error('Product not found'));
			}
			fileHelper.deleteFile(product.imageUrl);
			return Product.deleteOne({ _id: productId, userId: req.user._id });
		})
		.then(() => {
			console.log('Deleted Product');
			res.status(200).json({ message: 'Success!' });
		})
		.catch((err) => {
			res.status(500).json({ message: 'Deleting product failed.' });
		});
};
