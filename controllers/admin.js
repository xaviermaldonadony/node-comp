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
	req.user
		.createProduct({
			title,
			price,
			imageUrl,
			description,
		})
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
	req.user
		.getProducts({ where: { id: prodId } })
		.then(([product]) => {
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

	Product.findByPk(productId)
		.then((product) => {
			product.title = updatedTitle;
			product.price = updatedPrice;
			product.description = updatedDesc;
			product.imageUrl = updatedImageUrl;
			return product.save();
		})
		.then((result) => {
			console.log('updated Product');
			res.redirect('/admin/products');
		})
		.catch((err) => err);
};

exports.getProducts = (req, res, next) => {
	req.user
		.getProducts()
		// Product.findAll()
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
	Product.findByPk(prodId)
		.then((product) => product.destroy())
		.then((result) => res.redirect('/admin/products'))
		.catch((err) => console.log(err));
};
