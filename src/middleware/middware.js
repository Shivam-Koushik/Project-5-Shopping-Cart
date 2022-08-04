const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel")
const Validator = require("../validators/validations")

const Authenticate = function (req, res, next) {
    try {
        let token = req.headers.authorization
        if (!token) return res.status(401).send({ status: false, message: "token must be present in the request header" });
        const newToken = token.split(" ")
        token = newToken[1]

        jwt.verify(token, "groupNumber25",function(err,decodedToken){
            if(err)  return res.status(401).send({ status: false, message: "token is not valid" });
            else {
                req.newUser = decodedToken.userId
                next();
            } 
        });
       
    } catch (err) {
       return res.status(500).send({ status: false, message: err.message })
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

            if(!newUserId) return res.status(400).send({ status: false, message: 'No user Found with this userId' })
            let newAuth = newUserId._id
        
            if (newAuth != userLoggedIn) return res.status(403).send({ status: false, message: 'Sorry U are not Authorised !!' })
        }
        next()
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.Authorisation = Authorisation
module.exports.Authenticate = Authenticate
