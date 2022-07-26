const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const Validator = require("../validators/validations")

const Authenticate = function (req, res, next) {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(401).send({ status: false, msg: "token must be present in the request header" });
        const newToken = token.split(" ")
        token = newToken[1]

        jwt.verify(token, "groupNumber25",function(err,decodedToken){
            if(err)  return res.status(401).send({ status: false, msg: "token is not valid" });
            req.newUser = decodedToken.userId 
        });
       return next()
    } catch (err) {
       return res.status(500).send({ status: false, msg: err.message })
    }
}


const Authorisation = async function (req, res, next) {
    try {
        let userLoggedIn = req.newUser
        let userId = req.params.userId

        if (userId) {
            // update or delete 
            if(!Validator.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not valid" })
            
            let newUserId = await userModel.findOne({ _id: userId })

            if(!newUserId) return res.status(400).send({ status: false, msg: 'Please enter valid userId' })
            let newAuth = newUserId._id
        
            if (newAuth != userLoggedIn) return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
        }
        // else {
            
        //     let requestUser = req.body.userId
        //     if(!requestUser)  return res.status(400).send({ status: false, message: "Please enter userId" })
        //     if(!Validator.isValidObjectId(requestUser)) return res.status(400).send({ status: false, message: "userId is not valid" })
        //     if (requestUser != userLoggedIn) return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' })
        // }
        next()
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.Authorisation = Authorisation
module.exports.Authenticate = Authenticate
