const validator = require("../validators/validations");
const productModel = require("../models/productModel");
const { uploadFile } = require("../aws/uploadImage");

const product = async function (req, res) {
    try {
        const body = req.body;
        const {  description, currencyId, currencyFormat, isFreeShipping, style, installments } = body;
        let {title, price, availableSizes} = body;
        let productImage = req.files;

        let passData = {};
        
        if (!validator.isValidBody(body))
        return res.status(400).send({ status: false, message: "Provide details incide body " });
        
        if (!title)
        return res
        .status(400)
        .send({ status: false, message: "title is required" });

        title = title.replace(/\s+/, ' ').trim();
        
        if (!/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/.test(title))
            return res.status(400).send({ status: false, message: "provide valid title" });
            
        const dbCall = await productModel.findOne({ title });
        if (dbCall)
            return res.status(409).send({ status: false, message: "title should unique" });

        if (!description)
            return res.status(400).send({ status: false, message: "description is required" });
        if (!/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,38}$/.test(title))
            return res.status(400).send({ status: false, message: "provide valid description" });

        if (!price)
            return res.status(400).send({ status: false, message: "price is required" });
        // if (!/^[1-9]{1,}[\.]{0,1}[0-9]{0,2}$/.test(price))
        //     return res.status(400).send({ status: false, message: "price is not in the valid formate" });

        if (price || price == "") {
            if (!/^[1-9]\d{0,8}(?:\.\d{1,2})?$/.test(price))
                return res.status(400).send({
                    status: false,
                    message: "price is not in the valid formate",
                });
            // let dec = Number(price).toFixed(2);
            // price = dec;
        }


        if (!currencyId)
            return res.status(400).send({ status: false, message: "currencyId is required" });
        if (currencyId != "INR")
            return res.status(400).send({ status: false, message: "provide valid currencyId" });

        if (!currencyFormat)
            return res.status(400).send({ status: false, message: "currencyId is required" });
        if (currencyFormat != "₹")
            return res.status(400).send({ status: false, message: "provide valid currencyFormat" });

        if (isFreeShipping || isFreeShipping == "") {
            if (!(isFreeShipping === "true" || isFreeShipping === "false")) {
                return res.status(400).send({
                    status: false,
                    massage: "isFreeShipping should be a boolean value",
                });
            }
        }

        if (productImage.length == 0)
            return res.status(400).send({ status: false, message: "productImage is required" });
        if (productImage && productImage.length > 0) {
            if (
                productImage[0].mimetype == "image/jpg" ||
                productImage[0].mimetype == "image/png" ||
                productImage[0].mimetype == "image/jpeg"
            ) {
                const uploadImage = await uploadFile(productImage[0]);
                productImage = uploadImage;
            } else
                return res.status(400).send({
                    status: false,
                    message: "Profile image should be in jpg, jpeg or png format !!",
                });
        }

        if (style || style == "") {
            if (!validator.isValid(style))
                return res.status(400).send({ status: false, message: "provide style in valid format" });
        }

        if (availableSizes || availableSizes == "") {
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let isValidSize = availableSizes
                .split(",")
                .map((ele) => ele.toUpperCase().trim());
          
            for (let i = 0; i < isValidSize.length; i++) {
                if (!sizes.includes(isValidSize[i]))
                    return res.status(400).send({ status: false, message: "Please Enter the Valid Size !!" });
            }
            availableSizes = isValidSize;
        }

        if (installments || installments == "") {
            let reg = /^[1-9][0-9]{0,2}$/;
            if (!reg.test(installments))
                return res.status(400).send({ status: false, message: "Enter a valid Number 😡" });
        }

        let deletedAt = null;

        passData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            installments,
            productImage,
            deletedAt,
            availableSizes,
        };

        const data = await productModel.create(passData);
        return res.status(201).send({ status: true, message: "Success", data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};


const getAllProducts = async function (req, res) {
    try {
        const param = req.query
        const { size, priceGreaterThan, priceLessThan, priceSort } = param
        let { name } = param;
        let newObj = { isDeleted: false }

        if (size || size == "") {
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let isValidSize = size
                .split(",")
                .map((ele) => ele.toUpperCase().trim());
           
            for (let i = 0; i < isValidSize.length; i++) {
                if (!sizes.includes(isValidSize[i]))
                    return res.status(400).send({ status: false, message: "Please Enter the Valid Size !!" });
            }
            newObj['availableSizes'] = { $in: isValidSize };
        }

        if (name) {
            if (!(/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/).test(name)) return res.status(400).send({ status: false, message: "provide valid name" })


            newObj['title'] = { $regex: name, $options: 'i' }

        }

        if (priceGreaterThan) {
            newObj['price'] = { $gt: priceGreaterThan }
        }
        if (priceLessThan) {
            newObj['price'] = { $lt: priceLessThan }
        }
        if (priceLessThan && priceGreaterThan) {
            newObj['price'] = { $gt: priceGreaterThan, $lt: priceLessThan }
        }

        let sort = {};
        if (priceSort) {
            if (!(priceSort == '1' || priceSort == '-1')) return res.status(400).send({ status: false, message: "Enter only '1' or -'1' 😡" })
            if (priceSort == 1) {
                sort['price'] = 1
            }
            if (priceSort == -1) {
                sort['price'] = -1
            }
        }


        const data = await productModel.find(newObj).sort(sort)


        if (data.length == 0) return res.status(404).send({ status: false, message: "No Product found or already deleted with this filterisation !!" })

        return res.status(200).send({ status: true, message: 'Success', data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        const body = req.body;
        let productImage = req.files;
        const {
            description,
            price,
            currencyId,
            currencyFormat,
            isFreeShipping,
            style,
            installments,
        } = body;
        let {availableSizes, title} = body;
        let updatedData = {};
        
        if (!validator.isValidObjectId(productId))
        return res.status(400).send({ status: false, message: "Enter a Valid ProductId  !!" });
        
        if (!validator.isValidBody(body))
        return res.status(400).send({ status: false, message: "Enter some details !!" });
        
        if (title || title == "") {
            title = title.replace(/\s+/g, ' ').trim();
            if (!/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/.test(title))
                return res.status(400).send({ status: false, message: "provide valid title" });
            let isExistTitle = await productModel.findOne({ title });
            if (isExistTitle)
            return res.status(409).send({ status: false, message: "Title Should be Unique !!" });
            updatedData['title'] = title;

        }

        if (description || description == "") {
            if (!/^[A-Za-z]{2,}[\w\d\s\.\W\D]{1,22}$/.test(description))
                return res.status(400).send({ status: false, message: "provide valid description !!" });
            updatedData['description'] = description;
        }

        // ^[1-9]+\.?[0-9]*$
        // /^[1-9]{1,}[\.]{0,1}[0-9]{0,2}$/
        if (price || price == "") {
            if (!/^[1-9]\d{0,8}(?:\.\d{1,2})?$/.test(price))
                return res.status(400).send({
                    status: false,
                    message: "price is not in the valid formate",
                });
                let dec = Number(price).toFixed(2);
            updatedData['price'] = dec;
        }

        if (currencyId || currencyId == "") {
            if (currencyId != "INR")
                return res.status(400).send({ status: false, message: "provide valid currencyId" });
            updatedData['currencyId'] = currencyId;
        }

        if (currencyFormat || currencyFormat == "") {
            if (currencyFormat != "₹")
                return res.status(400).send({ status: false, message: "provide valid currencyFormat" });
            updatedData['currencyFormat'] = currencyFormat;
        }

        if (isFreeShipping || isFreeShipping == "") {
            if (!(isFreeShipping === "true" || isFreeShipping === "false"))
                return res.status(400).send({
                    status: false,
                    massage: "isFreeShipping should be a boolean value",
                });
            updatedData['isFreeShipping'] = isFreeShipping;
        }

        if (productImage && productImage.length > 0) {
            if (
                productImage[0].mimetype == "image/jpg" ||
                productImage[0].mimetype == "image/png" ||
                productImage[0].mimetype == "image/jpeg"
            ) {
                const uploadImage = await uploadFile(productImage[0]);
                productImage = uploadImage;
                updatedData['productImage'] = productImage;
            } else
                return res.status(400).send({
                    status: false,
                    message: "Profile image should be in jpg, jpeg or png format !!",
                });
        }

        if (availableSizes || availableSizes == "") {
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let isValidSize = availableSizes
                .split(",")
                .map((ele) => ele.toUpperCase().trim());
         
            for (let i = 0; i < isValidSize.length; i++) {
                if (!sizes.includes(isValidSize[i]))
                    return res.status(400).send({ status: false, message: "Please Enter the Valid Size !!" });
            }
            availableSizes = isValidSize;
            updatedData['availableSizes'] = availableSizes;
        }

        if (style || style == "") {
            if (!validator.isValid(style))
                return res.status(400).send({ status: false, message: "provide style in valid format" });
            updatedData = { style };
        }

        if (installments || installments == "") {
            if (!/^[1-9][0-9]{0,2}$/.test(installments))
                return res.status(400).send({ status: false, message: "Enter a valid Number 😡" });
            updatedData['installments'] = installments;
        }


        let data = await productModel.findOneAndUpdate(
            { _id: productId },
            updatedData,
            { new: true }
        );

        return res.status(200).send({ status: true, message: "Updated successfully !!", data });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ ststus: false, message: "Productid is not valid" })

        let data = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!data) return res.status(404).send({ status: false, message: "Bhai jab product hai hi ni to q search kr ra hai 😡 !!" })
        return res.status(200).send({ status: true, message: "Success", data })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

const deleteProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "Productid is not valid" })

        let data = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!data) return res.status(404).send({ status: false, message: "No such product found or already deleted" })

        await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: new Date() })
        return res.status(200).send({ status: true, message: "Successfully deleted the product" })


    } catch (error) {
        return res.send({ status: false, message: error.message })
    }
}

module.exports = { product, getAllProducts, updateProduct, getProductById, deleteProductById };
