const express = require('express');
const router = express.Router(); 
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const middleware = require('../middleware/middware')

// <------------User Api's----------------->
router.post('/register',userController.register)
router.post('/login',userController.login)
router.get('/user/:userId/profile',middleware.Authenticate,middleware.Authorisation,userController.getProfile)
router.put('/user/:userId/profile',middleware.Authenticate,middleware.Authorisation,userController.updateProfile)

//<------------------Products Api's------------------->
router.post('/products',productController.product)
router.get('/products',productController.getAllProducts)
router.put('/products/:productId', productController.updateProduct)
router.get('/products/:productId', productController.getProductById)
router.delete('/products/:productId', productController.deleteProductById)

//<------------------Cart Api's-------------------------->



router.all("*", function (req,res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})

module.exports = router;