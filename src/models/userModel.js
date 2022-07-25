const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {type:String, require:true},
    lname: {type:String, required:true},
    email: {type:String, required:true, valid:true, unique:true},
    profileImage: {type:String, required:true}, // s3 link
    phone: {type:String, required:true, unique:true, valid:true}, 
    password: {type:String, required:true, valid:true}, // encrypted password
    address: {
      shipping: {
        street: {type:String, required:true},
        city: {type:String, required:true},
        pincode: {type:Number, required:true}
      },
      billing: {
        street: {type:String, required:true},
        city: {type:String, required:true},
        pincode: {type:Number, required:true}
      }
    },

}, {timestamps:true})

module.exports = mongoose.model("User",userSchema)

