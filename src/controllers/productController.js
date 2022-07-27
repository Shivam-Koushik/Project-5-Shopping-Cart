const validator = require('../validators/validations')
const productModel = require('../models/productModel')
const {uploadFile} = require('../aws/uploadImage')

const product = async function (req, res) {
    try {

        const body = req.body
        const { title, description, price, currencyId, currencyFormat, style, installments } = body
        let productImage = req.files

        let {isFreeShipping, availableSizes} = body;

        if (!validator.isValidBody(body)) return res.status(400).send({ status: false, message: "Provide details incide body" })

        if (!title) return res.status(400).send({ status: false, message: "title is required" })
        if (!(/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/).test(title)) return res.status(400).send({ status: false, message: "provide valid title" })
        const dbCall = await productModel.findOne({ title })
        if (dbCall) return res.status(409).send({ status: false, message: "title should unique" })

        if (!description) return res.status(400).send({ status: false, message: "description is required" })
        if (!(/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/).test(title)) return res.status(400).send({ status: false, message: "provide valid description" })

        if (!price) return res.status(400).send({ status: false, message: "price is required" })
        if (!(/^[1-9]{1,}[\.]{0,1}[0-9]{0,2}$/).test(price)) return res.status(400).send({ status: false, message: "price is not in the valid formate" })

        if (!currencyId) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyId != "INR") return res.status(400).send({ status: false, message: "provide valid currencyId" })

        if (!currencyFormat) return res.status(400).send({ status: false, message: "currencyId is required" })
        if (currencyFormat != "₹") return res.status(400).send({ status: false, message: "provide valid currencyFormat" })

        // if (!isFreeShipping) return res.status(400).send({ status: false, message: "isFreeShipping is required" })
    
        if (isFreeShipping || isFreeShipping=='') {

            if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {return res.status(400).send({status: false,massage: 'isFreeShipping should be a boolean value'})
        }}
      

        if (productImage.length == 0) return res.status(400).send({ status: false, message: "productImage is required" });
        if (productImage && productImage.length > 0) {
            if ( productImage[0].mimetype == "image/jpg" ||
                productImage[0].mimetype == "image/png" ||
                productImage[0].mimetype == "image/jpeg"
            ) {
                const uploadImage = await uploadFile(productImage[0]);
                body[`productImage`]= uploadImage;
            } else
                return res.status(400).send({status: false, message: "Profile image should be in jpg, jpeg or png format !!",});
        }
      
        if(style) {
            if(!validator.isValid(style)) return res.status(400).send({ status: false, message: "provide style in valid format" });
        }
     
      
        if(availableSizes.length==0) return res.status(400).send({ status: false, message: "please select atleast one "})  
        if(availableSizes.length > 0){
            console.log(availableSizes)
            let arr = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let result = [];
            let makeArr = availableSizes.split(',');
            makeArr.map(ele => {
                if((!result.includes(ele) && arr.includes(ele))) result.push(ele)
                else return res.send("hdjfhdjsh")
            })
            console.log(result)
            availableSizes = result.join(",");
            console.log(availableSizes)
        }

        if(installments){
            if(!validator.isValidNumber(installments)) return res.status(400).send({status:false, message: "Enter a valid Number 😡"})
        }


        const data = await productModel.create(body)
        return res.status(201).send({ status: true, message: 'Success', data: data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports.product = product