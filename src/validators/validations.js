const mongoose = require('mongoose')
const isValidObjectId = function (x) {
    return mongoose.Types.ObjectId.isValid(x);
}

const isValidNumber = function(x){
    if (typeof x === 'undefined' || x === null) return false
    if(typeof x  === "number") return true;
}

const isValid = function (x) {
    if (typeof x === 'undefined' || x === null) return false
    if (typeof x != "string" ) return false
    if (typeof x === 'string' && x.trim().length === 0) return false
    return true
}

const isValidBody = function (y) {
    return Object.keys(y).length > 0
}

const isValidPincode = function(value) {
    if((/^[1-9][0-9]{5}$/).test(value)) return true
}

const isValidEmail = function (y) {

    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (emailRegex.test(y)) return true
}

const isValidMobile = function (y) {
    let mobileRegex = /^[6-9]{1}[0-9]{9}$/
    if (mobileRegex.test(y)) return true
}

const isValidPassword = function (y) {
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,15}$/
    if (passwordRegex.test(y)) return true
}

module.exports.isValidObjectId = isValidObjectId
module.exports.isValidNumber = isValidNumber
module.exports.isValidBody = isValidBody
module.exports.isValid = isValid
module.exports.isValidEmail = isValidEmail
module.exports.isValidMobile = isValidMobile
module.exports.isValidPassword = isValidPassword
module.exports.isValidPincode = isValidPincode