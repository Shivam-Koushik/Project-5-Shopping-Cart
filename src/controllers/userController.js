const userModel = require("../models/userModel");
const validator = require("../validators/validations");
const { uploadFile } = require("../aws/uploadImage");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 8;

const register = async function (req, res) {
  try {
    const body = req.body;
    const profileImage = req.files;

    const { fname, lname, email, phone, address } = body;
    let password = body.password;
    const { shipping, billing } = address;

    // <--------reqBody validation----------------->
    if (!validator.isValidBody(body))
      return res
        .status(400)
        .send({ status: false, message: "Provide details incide body" });

    // <---------Fname validation---------------->
    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "fname is required" });
    if (!/^[A-Za-z]{2,15}$/.test(fname.trim()))
      return res
        .status(400)
        .send({ status: false, message: "fname not valid" });

    // <--------lname validation---------------->
    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "lname is required" });
    if (!/^[A-Za-z]{2,15}$/.test(lname.trim()))
      return res
        .status(400)
        .send({ status: false, message: "lname not valid" });

    // <--------email validation---------------->
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    if (!validator.isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid email" });

    // <--------Check Email is Exist in db or not-------------->
    const uniqueEmail = await userModel.findOne({ email });
    if (uniqueEmail)
      return res
        .status(409)
        .send({ status: false, message: "email is already exist" });

    // <--------profile image validation & upload on the aws server------------->
    if (profileImage.length == 0)
      return res
        .status(400)
        .send({ status: false, message: "ProfileImage is required" });
    if (profileImage && profileImage.length > 0) {
      if (
        profileImage[0].mimetype == "image/jpg" ||
        profileImage[0].mimetype == "image/png" ||
        profileImage[0].mimetype == "image/jpeg"
      ) {
        const uploadImage = await uploadFile(profileImage[0]);
        body["profileImage"] = uploadImage;
      } else
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile image should be in jpg, jpeg or png format !!",
          });
    }

    // <----------Phone validation-------------->
    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "phone is required" });
    if (!validator.isValidMobile(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone is not in the valid formate" });

    // <-----------Check phone number is exist in db or not-------------->
    const uniquePhone = await userModel.findOne({ phone });
    if (uniquePhone)
      return res
        .status(409)
        .send({ status: false, message: "phone is already exist" });

    // <---------Password validation & encrpt that---------->
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    if (!validator.isValidPassword(password))
      return res
        .status(400)
        .send({
          status: false,
          message: "password is not in the valid formate",
        });
    let encryptPassword = await bcrypt.hash(password, saltRounds);

    body["password"] = encryptPassword;

    // <-------address body validation----------->
    if (!validator.isValidBody(address))
      return res
        .status(400)
        .send({ status: false, message: "address is required" });

    // <-----------shipping body validation------------->
    if (!validator.isValidBody(shipping))
      return res
        .status(400)
        .send({ status: false, message: "shipping is required" });

    // <----------shipping street validation----------->
    if (!validator.isValid(shipping.street))
      return res
        .status(400)
        .send({ status: false, message: "shipping street is required" });

    // <-----------Shipping city validation----------->
    if (!validator.isValid(shipping.city))
      return res
        .status(400)
        .send({ status: false, message: "shipping city is required" });

    // <-----------Shipping pincode validation----------->
    if (!validator.isValidNumber(parseInt(shipping.pincode)))
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode should be number" });
    if (!validator.isValidPincode(shipping.pincode))
      return res
        .status(400)
        .send({ status: false, message: "shipping pincode is Invalid !!" });

    // <-----------billing body validation------------->
    if (!validator.isValidBody(billing))
      return res
        .status(400)
        .send({ status: false, message: "billing is required" });

    // <----------billing street validation----------->
    if (!validator.isValid(billing.street))
      return res
        .status(400)
        .send({ status: false, message: "billing street is required" });

    // <-----------billing city validation----------->
    if (!validator.isValid(billing.city))
      return res
        .status(400)
        .send({ status: false, message: "billing city is required" });

    // <-----------billing pincode validation----------->
    if (!validator.isValidNumber(parseInt(billing.pincode)))
      return res
        .status(400)
        .send({ status: false, message: "billing pincode should bhe number" });
    if (!validator.isValidPincode(billing.pincode))
      return res
        .status(400)
        .send({ status: false, message: "billing pincode is Invalid !!" });

    // <----------Create a document of user---------->
    const data = await await userModel.create(body);
    return res
      .status(201)
      .send({ status: true, message: "Success", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const login = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!validator.isValidBody(req.body))
      return res
        .status(400)
        .send({ status: false, message: "req body is invalid !!" });

    // <--------email validation---------------->
    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    if (!validator.isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Enter valid email" });

    const data = await userModel.findOne({ email });
    if (!data)
      return res
        .status(401)
        .send({ status: false, message: "email id is incorrect !" });
    // <--------password validation---------------->
    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    const decryptPassword = await bcrypt.compare(password, data.password);
    if (!decryptPassword)
      return res
        .status(401)
        .send({ status: false, message: "password is incorrect" });

    // <-------generate JWT Token and valid for 100 Minutes--------------->
    let payload = {
      userId: data._id,
      exp: Math.floor(Date.now() / 1000) + 24*60 * 60,
      iat: Math.floor(Date.now() / 1000),
    };
    let token = jwt.sign(payload, "groupNumber25");
    //   res.setHeader("x-api-key", token);
    res.status(200).send({
      status: true,
      message: "user logged in successfully",
      data: {
        token,
        userId: data._id,
        exp: payload.exp,
        iat: payload.iat,
      },
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const getProfile = async function (req, res) {
  try {
    const param = req.params.userId;

    const data = await userModel.findById(param);
    if (!data)
      return res
        .status(400)
        .send({ status: false, message: "Profile not found" });
    return res
      .status(200)
      .send({ status: true, message: "Success", data: data });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

const updateProfile = async function (req, res) {
  try {
    const param = req.params.userId;
    const body = req.body;
    const profileImage = req.files;

    const { fname, lname, email, phone, address } = body;
    let password = body.password;
    const update = {};

    // <--------reqBody validation----------------->
    // if (!validator.isValidBody(body)) return res.status(400).send({ status: false, message: "Provide details incide body" })

    // <---------Fname validation---------------->
    if (fname) {
      if (!/^[A-Za-z]{2,15}$/.test(fname.trim()))
        return res
          .status(400)
          .send({ status: false, message: "fname not valid" });
      update["fname"] = fname;
    }

    // <--------lname validation---------------->
    if (lname) {
      if (!/^[A-Za-z]{2,15}$/.test(lname.trim()))
        return res
          .status(400)
          .send({ status: false, message: "lname not valid" });
      update["lname"] = lname;
    }

    // <--------email validation---------------->
    if (email) {
      if (!validator.isValidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "Enter valid email" });
      // <--------Check Email is Exist in db or not-------------->
      const uniqueEmail = await userModel.findOne({ email });
      if (uniqueEmail)
        return res
          .status(409)
          .send({ status: false, message: "email is already exist" });
      update["email"] = email;
    }

    // <--------profile image validation & upload on the aws server------------->
    if (profileImage && profileImage.length > 0) {
      if (
        profileImage[0].mimetype == "image/jpg" ||
        profileImage[0].mimetype == "image/png" ||
        profileImage[0].mimetype == "image/jpeg"
      ) {
        const uploadImage = await uploadFile(profileImage[0]);
        update["profileImage"] = uploadImage;
      } else
        return res
          .status(400)
          .send({
            status: false,
            message: "Profile image should be in jpg, jpeg or png format !!",
          });
    }

    // <----------Phone validation-------------->
    if (phone) {
      if (!validator.isValidMobile(phone))
        return res
          .status(400)
          .send({
            status: false,
            message: "phone is not in the valid formate",
          });
      // <-----------Check phone number is exist in db or not-------------->
      const uniquePhone = await userModel.findOne({ phone });
      if (uniquePhone)
        return res
          .status(409)
          .send({ status: false, message: "phone is already exist" });
      update["phone"] = phone;
    }

    // <---------Password validation & encrpt that---------->
    if (password) {
      if (!validator.isValidPassword(password))
        return res
          .status(400)
          .send({
            status: false,
            message: "password is not in the valid formate",
          });
      let encryptPassword = await bcrypt.hash(password, saltRounds);

      update["password"] = encryptPassword;
    }

    // <-------address body validation----------->
    if (address) {
      const { shipping, billing } = address;

      // <-----------shipping body validation------------->
      if (shipping) {
        let { street, city, pincode } = shipping;

        // <----------shipping street validation----------->
        if (street) {
          if (!validator.isValid(address.shipping.street))
            return res
              .status(400)
              .send({ status: false, message: "shipping street is required" });
          update["address.shipping.street"] = street;
        }

        // <-----------Shipping city validation----------->
        if (city) {
          if (!validator.isValid(address.shipping.city))
            return res
              .status(400)
              .send({ status: false, message: "shipping city is required" });
          update["address.shipping.city"] = city;
        }

        // <-----------Shipping pincode validation----------->
        if (pincode) {
          if (!validator.isValidNumber(parseInt(address.shipping.pincode)))
            return res
              .status(400)
              .send({
                status: false,
                message: "shipping pincode should be number",
              });
          if (!validator.isValidPincode(address.shipping.pincode))
            return res
              .status(400)
              .send({
                status: false,
                message: "shipping pincode is Invalid !!",
              });
          update["address.shipping.pincode"] = pincode;
        }
      }

      // <-----------billing body validation------------->

      if (billing) {
        let { street, city, pincode } = billing;

        // <----------billing street validation----------->
        if (street) {
          if (!validator.isValid(address.billing.street))
            return res
              .status(400)
              .send({ status: false, message: "billing street is required" });
          update["address.billing.street"] = street;
        }
        // <-----------billing city validation----------->
        if (city) {
          if (!validator.isValid(address.billing.city))
            return res
              .status(400)
              .send({ status: false, message: "billing city is required" });
          update["address.billing.city"] = city;
        }
        // <-----------billing pincode validation----------->
        if (pincode) {
          if (!validator.isValidNumber(parseInt(address.billing.pincode)))
            return res
              .status(400)
              .send({
                status: false,
                message: "billing pincode should bhe number",
              });
          if (!validator.isValidPincode(address.billing.pincode))
            return res
              .status(400)
              .send({
                status: false,
                message: "billing pincode is Invalid !!",
              });
          update["address.billing.pincode"] = pincode;
        }
      }
    }

    const updatedData = await userModel.findOneAndUpdate(
      { _id: param },
      update,
      { new: true }
    );
    return res
      .status(200)
      .send({ status: true, message: "Success", data: updatedData });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
