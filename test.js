const cartModel = require('../models/cartModel');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel')
const validator = require('../validators/validations')

const createCart = async function (req, res) {
    try {
        const userIdParams = req.params.userId;

        //<---------UserId Validation---------------->
        if (!(validator.isValidObjectId(userIdParams))) 
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });
        

        let data = req.body
        // <-----------reqBody Validations--------------->
        if (!(validator.isValidBody(data))) 
            return res.status(404).send({ status: false, msg: "plz provide the data" })
        
        let { items, userId } = data;
        console.log(data)

        if(!userId) return res.status(400).send({status:false, message:"UserId is required !!"})

        if (!(validator.isValidObjectId(userId))) 
            return res.status(400).send({ status: false, message: "Please provide valid User Id" });

        if(userId !== userIdParams) return res.status(400).send({status:false, message:"userId is not matching with param"})

        // <------------productId Validations-------------->
        if (!(items[0].productId)) 
            return res.status(400).send({ status: false, message: "productId is Required !!" });

        
        if (!(validator.isValidObjectId(items[0].productId))) 
            return res.status(400).send({ status: false, message: "Please provide valid Product Id" });

        // <----------product quantity validation------------>
        if(!(items[0].quantity) || (items[0].quantity <=0))
            return res.status(400).send({ status: false, message: "Quantity is Required or its Greater Then or equal to 1 !!" });
        
        //   <----------Check user Doc exist in db or not-------------->
        const findUser = await userModel.findById({ _id: userId });


        if (!findUser)
            return res.status(400).send({ status: false, message: `User doesn't exist by ${userId}` });


        // <----------Check product Doc is existing in db or not------------->
        const findProduct = await productModel.findOne({ _id: (items[0].productId), isDeleted: false });

        if (!findProduct)
            return res.status(400).send({ status: false, message: `Product doesn't exist by ${(items[0].productId)}` });


        // <----------Check userId exist in cart Collection or not---------->
        const findUserCart = await cartModel.findOne({ userId: userId });

        //<--------------if No Cart Doc exist in db ------------------->
        if (!findUserCart) {
            var cartData = {
                userId: userId,
                items: [
                    {
                        productId: items[0].productId,
                        quantity: items[0].quantity,
                    },
                ],
                totalPrice: Number(findProduct.price * (items[0].quantity)).toFixed(2),
                totalItems: 1,
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: `Cart created successfully`, data: createCart });
        }

        // <------------If Cart Doc exist in db then we have to update that-------------->

            if (findUserCart) {

                let price = findUserCart.totalPrice + (items[0].quantity) * findProduct.price;
                let arr = findUserCart.items;
                  for (let i=0; i<arr.length; i++) {
                    if (arr[i].productId.toString() === items[0].productId) {
                        arr[i].quantity +=data.items[0].quantity
                        console.log(arr[i].productId.toString())
                        console.log(typeof items[0].productId)
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
                        // console.log(responseData);
                        return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
                    }
                }
                arr.push({ productId: data.items[0].productId, quantity: data.items[0].quantity });
                let updatedCart = {
                  items: arr,
                  totalPrice: price,
                  totalItems: arr.length,
              };
            
              let responseData = await cartModel.findOneAndUpdate({ _id: findUserCart._id }, updatedCart, { new: true });
              return res.status(200).send({ status: true, message: `Product added successfully`, data: responseData });
            }
        }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}



const updateCart = async function(req, res){
    try{
        const userId = req.params.userId;

        if(!(userId || validator.isValidObjectId(userId))) 
            return res.status(400).send({status:false, message:"Invalid UserId Or is not present in param !!"})

        const body = req.body;
        let {productId, removeProduct} = body;

        let userDoc = await userModel.findById(userId);

        if(!userDoc)
            return res.status(404).send({status:false, message:"No User found with this userId"})

        if(!productId)
            return res.status(400).send({status:false, message:"ProductId Is requird !!"})

        if(!validator.isValidObjectId(productId))
            return res.status(400).send({status:false, message:"Invalid ProductId !!"})

        let productDoc = await productModel.findOne({_id : productId, isDeleted: false})
        if(!productDoc)
            return res.status().send({status:false, message:`No product Exist with this productId (${productId})`})

        let cartDoc = await cartModel.findOne({items : {$elemMatch : {productId}}})

        console.log(cartDoc)
        console.log(productId)

        if(!cartDoc)
            return res.status(404).send({status:false, message:"Your Cart is Empty !!"})

        // removeProduct Validation

        if(!(removeProduct == '1' || removeProduct == '0'))
            return res.status(400).send({status:false, message: "removeProduct  should be 0 or either 1 !!"})

        let findQuantity = cartDoc.items.found(ele => (ele === productId))

        if(removeProduct == 0){
            let totalAmount = cartDoc.totalPrice - (productDoc.price * findQuantity.quantity);
        }
    }
    catch(err){
        return res.status(500).send({status:false, message:err.message})
    }
}

module.exports = {createCart, updateCart}