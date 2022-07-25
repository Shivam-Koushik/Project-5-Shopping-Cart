const express = require('express');
const router = express.Router(); 
const userController = require('../controllers/userController')


router.post('/register',userController.register)
router.post('/login',userController.login)
router.post('/user/:userId/profile',userController.getProfile)


router.all("/*", function (req,res) {
    res.status(400).send({
        status: false,
        message: "Make Sure Your Endpoint is Correct or Not!"
    })
})


module.exports = router;