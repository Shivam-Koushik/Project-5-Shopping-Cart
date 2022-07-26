const express = require('express');
const router = express.Router(); 
const userController = require('../controllers/userController')
const middleware = require('../middleware/middware')


router.post('/register',userController.register)
router.post('/login',userController.login)
router.get('/user/:userId/profile',middleware.Authenticate,middleware.Authorisation,userController.getProfile)
router.put('/user/:userId/profile',middleware.Authenticate,middleware.Authorisation,userController.updateProfile)


router.all("*", function (req,res) {
    res.status(404).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})


module.exports = router;