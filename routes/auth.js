const express = require('express');
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please enter a valid email address')
			.normalizeEmail(),
	],
	authController.getLogin
);
router.get('/signup', authController.getSignup);
router.post('/login', authController.postLogin);
router.post(
	'/signup',
	[
		check('email')
			.isEmail()
			.withMessage('Please enter a vaild email.')
			.custom((value, { req }) => {
				// if (value === 'test@test.com') {
				// 	throw new Error('This is email addres is alredy registered.');
				// }
				// return true;
				// if promise fulfills returns nothing, no error it is treated as succesfull
				// if rejection, validator will store it as an a error
				return User.findOne({ email: value }).then((userDoc) => {
					if (userDoc) {
						return Promise.reject(
							'E-mail exists already, please pick a different one.'
						);
					}
				});
			})
			.normalizeEmail(),
		body(
			'password',
			'Please enter a password with at least 1 number, 1 upper case character, 1 lowr case character and  5 characters long.'
		)
			// .isLength({ min: 5 })
			// .isAlphanumeric(),
			.isStrongPassword({
				minLength: 5,
				minLowercase: 1,
				minUppercase: 1,
				minNumbers: 1,
				minSymbols: 0,
			})
			.trim(),
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('password do not match!');
				}
				return true;
			}),
	],
	authController.postSignup
);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
