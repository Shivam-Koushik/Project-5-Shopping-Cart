const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const {Authenticate, Authorisation} = require('../middleware/middware')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderCotroller')

// <------------User Api's----------------->
router.post('/register', userController.register)
router.post('/login', userController.login)
router.get('/user/:userId/profile', Authenticate, Authorisation, userController.getProfile)
router.put('/user/:userId/profile', Authenticate, Authorisation, userController.updateProfile)

//<------------------Products Api's------------------->
router.post('/products', productController.product)
router.get('/products', productController.getAllProducts)
router.put('/products/:productId', productController.updateProduct)
router.get('/products/:productId', productController.getProductById)
router.delete('/products/:productId', productController.deleteProductById)

//<------------------Cart Api's-------------------------->
router.post('/users/:userId/cart', Authenticate, Authorisation, cartController.createCart)
router.put('/users/:userId/cart', Authenticate, Authorisation, cartController.updateCart)
router.get('/users/:userId/cart',Authenticate, Authorisation, cartController.getCart)
router.delete('/users/:userId/cart', Authenticate, Authorisation, cartController.deleteCart)

// <-----------Order Api's----------------->
router.post('/users/:userId/orders', Authenticate, Authorisation, orderController.createOrder)
router.put('/users/:userId/orders', Authenticate, Authorisation, orderController.updateOrder)

router.all("*", function (req, res) {
    res.status(404).send({
        status: false,
        message: "Page Not Found 🙄"
    })
})

module.exports = router;