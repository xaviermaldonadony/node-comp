const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
	res.render('admin/edit-product', {
		pageTitle: 'Add Product',
		path: '/admin/add-product',
		editing: false,
	});
};

exports.postAddProduct = (req, res, next) => {
	const { title, imageUrl, price, description } = req.body;
	const userId = req.user._id;
	const product = new Product(
		title,
		price,
		description,
		imageUrl,
		null,
		userId
	);

	product
		.save()
		.then((result) => {
			console.log('Created Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/');
	}

	const prodId = req.params.productId;
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
			});
		})
		.catch((err) => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
	const {
		productId,
		title: updatedTitle,
		price: updatedPrice,
		imageUrl: updatedImageUrl,
		description: updatedDesc,
	} = req.body;

	const product = new Product(
		updatedTitle,
		updatedPrice,
		updatedDesc,
		updatedImageUrl,
		productId
	);

	product
		.save()
		.then((result) => {
			console.log('updated Product');
			res.redirect('/admin/products');
		})
		.catch((err) => err);
};

exports.getProducts = (req, res, next) => {
	Product.fetchAll()
		.then((products) =>
			res.render('admin/products', {
				prods: products,
				pageTitle: 'Admin Products',
				path: '/admin/products',
			})
		)
		.catch((err) => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
	const prodId = req.body.productId;
	Product.deleteById(prodId)
		.then(() => {
			console.log('Deleted Product');
			res.redirect('/admin/products');
		})
		.catch((err) => console.log(err));
};
