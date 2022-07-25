const userModel = require('../models/userModel')
const validator = require('../validators/validations')
const {uploadFile} = require('../controllers/awsS3Controller')
const bcrypt = require('bcrypt');

const saltRounds = 8

const register = async function (req, res) {
    try {
        const body = req.body
        const profileImage = req.files
        
        const{fname,lname,email,phone,password,address} = body
        const{shipping,billing}= address

        if(!validator.isValidBody(body)) return res.status(400).send({ status: false, message: "Provide details incide body" })

        if(!fname) return res.status(400).send({ status: false, message: "fname is required" }) 
        if(!(/^[A-Za-z]{2,15}$/).test(fname.trim())) return res.status(400).send({ status: false, message: "fname not valid" }) 

        if(!lname) return res.status(400).send({ status: false, message: "lname is required" }) 
        if(!(/^[A-Za-z]{2,15}$/).test(lname.trim())) return res.status(400).send({ status: false, message: "lname not valid" })

        if(!email) return res.status(400).send({ status: false, message: "email is required" }) 
        if(!validator.isValidEmail(email))  return res.status(400).send({ status: false, message: "Enter valid email" }) 
        const uniqueEmail = await userModel.findOne({email})
        if(uniqueEmail) return res.status(409).send({ status: false, message: "email is already exist" }) 

        if(profileImage.length==0) return res.status(409).send({ status: false, message: "ProfileImage is required" }) 
        if(profileImage && profileImage.length > 0){
            const uploadImage = await uploadFile(profileImage[0])
            body['profileImage'] = uploadImage;
        }

        if(!phone) return res.status(400).send({ status: false, message: "phone is required" })
        if(!validator.isValidMobile(phone)) return res.status(400).send({ status: false, message: "phone is not in the valid formate" })
        const uniquePhone = await userModel.findOne({phone})
        if(uniquePhone) return res.status(400).send({ status: false, message: "phone is already exist" })

        if(!password) return res.status(400).send({ status: false, message: "password is required" })
        if(!validator.isValidPassword(password)) return res.status(400).send({ status: false, message: "password is not in the valid formate" })

        if(!validator.isValidBody(address)) return res.status(400).send({ status: false, message: "address is required" })

        if(!validator.isValidBody(shipping)) return res.status(400).send({ status: false, message: "shipping is required" })
        if(!validator.isValid(shipping.street)) return res.status(400).send({ status: false, message: "shipping street is required" })
        if(!validator.isValid(shipping.city)) return res.status(400).send({ status: false, message: "shipping city is required" })
        if(!validator.isValidNumber(parseInt(shipping.pincode))) return res.status(400).send({ status: false, message: "shipping pincode should be number" })
        if(!validator.isValidPincode(shipping.pincode)) return res.status(400).send({ status: false, message: "shipping pincode is Invalid !!" })

        if(!validator.isValidBody(billing)) return res.status(400).send({ status: false, message: "billing is required" })
        if(!validator.isValid(billing.street)) return res.status(400).send({ status: false, message: "billing street is required" })
        if(!validator.isValid(billing.street)) return res.status(400).send({ status: false, message: "billing city is required" })
        if(!validator.isValidNumber(parseInt(billing.pincode))) return res.status(400).send({ status: false, message: "billing pincode should bhe number" })
        if(!validator.isValidPincode(billing.pincode)) return res.status(400).send({ status: false, message: "billing pincode is Invalid !!" })

        const data = await userModel.create(body)
        return res.status(201).send({ status: true,message: 'Success',data: data})

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

const login = async function (req, res) {


}

const getProfile = async function (req, res) {


}

module.exports.register = register
module.exports.login = login
module.exports.getProfile = getProfile