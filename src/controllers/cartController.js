const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const validator = require('../validators/validations');

const createCart = async function (req, res) {
    try {
        const userId = req.params.userId;

        //<---------UserId Validation---------------->
        if (!(validator.isValidObjectId(userId)))
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });


        let data = req.body
        // <-----------reqBody Validations--------------->
        if (!(validator.isValidBody(data)))
            return res.status(404).send({ status: false, message: "plz provide the data" })

        let { productId, quantity } = data;

        // <------ProductId Validation--------->
        if(!productId)
            return res.status(400).send({ status: false, message: "Product ID is required" })

        //<---------Quantity Validation------------>
        if (quantity) {
            if (quantity <= 0)
                return res.status(400).send({ status: false, message: "quantity must be greater than 0" });
        }
        if (!quantity) {
            quantity = 1;
        }


        if (!(validator.isValidObjectId(userId)))
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });

        //   <----------Check user Doc exist in db or not-------------->
        const findUser = await userModel.findById(userId);


        if (!findUser)
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });


        // <----------Check product Doc is existing in db or not------------->
        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        if (!findProduct)
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${productId}` });


        // <----------Check userId exist in cart Collection or not---------->
        const findUserCart = await cartModel.findOne({ userId });

        //<--------------if No Cart Doc exist in db ------------------->
        if (!findUserCart) {
            var cartData = {
                userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity,
                    },
                ],
                totalPrice: (findProduct.price * quantity).toFixed(2),
                totalItems: 1,
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: 'Cart created successfully', data: createCart });
        }

        // <------------If Cart Doc exist in db then we have to update that-------------->

        if (findUserCart) {
            let price = findUserCart.totalPrice + ((quantity) * findProduct.price);

            let arr = findUserCart.items;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId.toString() === productId) {
                    arr[i].quantity += quantity
                    let updatedCart = {
                        items: arr,
                        totalPrice: price,
                        totalItems: arr.length,
                    };

                    let responseData = await cartModel.findOneAndUpdate(
                        { _id: findUserCart._id },
                        updatedCart,
                        { new: true }
                    );
                    return res.status(200).send({ status: true, message: 'Product added successfully', data: responseData });
                }
            }
            arr.push({ productId: productId, quantity: quantity });
            let updatedCart = {
                items: arr,
                totalPrice: price,
                totalItems: arr.length,
            };

            let responseData = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, updatedCart, { new: true });
            return res.status(200).send({ status: true, message: 'Product added successfully', data: responseData });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId;

        // <---------UserId Validation----------->
        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: " user id is not valid" });

        // <---------Check user Exist or not------------>
        let userDoc = await userModel.findById(userId);

        if (!userDoc)
            return res.status(404).send({ status: false, message: "No User found with this userId" })

        const body = req.body;
        let { cartId, productId, removeProduct } = body;


        // <----------ProductId Validation------------>
        if (!productId)
            return res.status(400).send({ status: false, message: "ProductId Is requird !!" })

        if (!validator.isValidObjectId(productId))
            return res.status(400).send({ status: false, message: "Invalid ProductId !!" })

        // <----------Check product Exist in db or not------------->
        let productDoc = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDoc)
            return res.status(404).send({ status: false, message: `No product Exist with this productId (${productId})` })


        // <---------CartId validation-------------->
        if (!cartId)
            return res.status(400).send({ status: false, message: "cartId Is requird !!" })

        if (!validator.isValidObjectId(cartId))
            return res.status(400).send({ status: false, message: "Invalid cartId !!" })

        // <-----------Check CartDoc is exist in db or not-------------->
        let cartDoc = await cartModel.findOne({ _id: cartId, isDeleted: false });

        if (!cartDoc)
            return res.status(404).send({ status: false, message: "Your Cart is Empty !!" })


        // <----------Remove Product Validations-------------->
        if (!(removeProduct == '1' || removeProduct == '0'))
            return res.status(400).send({ status: false, message: "removeProduct  should be 0 or either 1 !!" })

        let cartArr = cartDoc.items
        let newCartId = cartDoc._id.toString()

        // <-------Delete a productDoc-------------->
        if (removeProduct == 0) {

            for (let i = 0; i < cartArr.length; i++) {
                if (cartArr[i].productId.toString() === productId) {
                    let productPrice = cartDoc.totalPrice - cartArr[i].quantity * productDoc.price
                    let passObj = { totalPrice: productPrice, totalItems: cartDoc.totalItems - 1, $pull: { "items": { productId } } }
                    const newCart = await cartModel.findOneAndUpdate({ _id: newCartId }, passObj, { new: true })
                    return res.status(200).send({ status: true, message: 'Product update successfully', data: newCart })
                }
            }
        }

        // <------------Decrease the quantity of a product------------------>
        if (removeProduct == 1) {
            for (let i = 0; i < cartArr.length; i++) {
                if (cartArr[i].productId.toString() === productId) {

                    let productPrice = cartDoc.totalPrice - productDoc.price

                    cartDoc.totalPrice = productPrice,
                        cartArr[i].quantity = cartArr[i].quantity - 1

                    if (cartArr[i].quantity == 0) {
                        let passObj = { totalPrice: productPrice, totalItems: cartDoc.totalItems - 1, $pull: { "items": { productId } } }
                        const newCart = await cartModel.findOneAndUpdate({ _id: newCartId }, passObj, { new: true })
                        return res.status(200).send({ status: true, message: `Product update successfully`, data: newCart })
                    }

                    const newCart = await cartModel.findOneAndUpdate({ _id: newCartId }, cartDoc, { new: true })
                    return res.status(200).send({ status: true, message: 'Product update successfully', data: newCart })
                }
            }
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getCart = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: " user id is not valid 😡" });

        let userDoc = await userModel.findById(userId);

        if (!userDoc)
            return res.status(404).send({ status: false, message: "No User found with this userId 😡" })

            
        const data = await cartModel.findOne({ userId }).populate('items.productId')
        if(data.items.length===0) return res.status(400).send({ status: false, message: "Cart is Empty or already deleted 😒" })
        if (!data) return res.status(404).send({ status: false, message: "Cart not exist 😭" })
        return res.status(200).send({ status: true, message: 'success 😉', data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
    
}
const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: " user id is not valid 😡" });

        let userDoc = await userModel.findById(userId);

        if (!userDoc)
            return res.status(404).send({ status: false, message: "No User found with this userId 😡" })

        const cartData = await cartModel.findOne({ userId })
        if (!cartData) return res.status(404).send({ status: false, message: "Cart not exist 😭" })

        if(cartData.items.length===0) return res.status(400).send({ status: false, message: "Cart is already deleted 😒" })
 
        const newObj = {items:[], totalPrice:0, totalItems:0}

        const data = await cartModel.findOneAndUpdate({userId},newObj, {new:true}) 

        return res.status(204).send({ status: true, message: 'success 😉', data })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createCart, updateCart, getCart,deleteCart }
