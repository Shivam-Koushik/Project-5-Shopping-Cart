const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const validator = require('../validators/validations');

const createOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const body = req.body;
        let { cartId, cancellable } = body;

        // body Validation
        if (!validator.isValidBody(body)) return res.status(404).send({ status: false, message: "No data found !! 🙄" })

        // params Id Validation
        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: `This UserId ${userId} is Invalid ! 🙄` })

        const userDoc = await userModel.findById(userId);
        if (!userDoc)
            return res.status(400).send({ status: false, message: `No User Found With this UserId ${userId} 🤣` })

        // cartId Validations
        if (!cartId) return res.status(404).send({ status: false, message: "CartId Is Required !!" })

        if (!validator.isValidObjectId(cartId))
            return res.status(400).send({ status: false, message: `This cartId ${cartId} is Invalid ! 🙄` })

        // cartmodel check

        const cartDoc = await cartModel.findOne({ _id: cartId, userId }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 }).lean();

        if (!cartDoc)
            return res.status(404).send({ status: false, message: `No Cart Found with this CartId ${cartId} 🛁` })

        if (cartDoc.items.length === 0)
            return res.status(404).send({ status: false, message: "No Product Found in this Cart 🛁 " })


        const orderDoc = await orderModel.findOne({ userId }).select({ _id: 0, __v: 0 })

        if (orderDoc)
            return res.status(409).send({ status: false, message: "Order already exists !! 😎", data: orderDoc })

        let arr = cartDoc.items;

        let allQuantity = 0;
        for (let i = 0; i < arr.length; i++) {
            allQuantity += arr[i].quantity
        }

        // cartDoc = JSON.parse(JSON.stringify(cartDoc))

        // cancellable validations
        cancellable ? cartDoc['cancellable'] = cancellable : cartDoc['cancellable'] = cancellable;


        cartDoc['totalQuantity'] = allQuantity;
        cartDoc['deletedAt'] = null;

        //  console.log(cartDoc)

        await cartModel.findOneAndUpdate({ _id: cartId }, { items: [], totalItems: 0, totalPrice: 0 })

        const data = await orderModel.create(cartDoc);

        return res.status(201).send({ status: true, message: "Order Created successfully  !! 😎", data })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        const userId = req.params.userId;
        const body = req.body;
        const { orderId, status } = body;

        if (!validator.isValidObjectId(userId))
            return res.status(400).send({ status: false, message: "UserId is invalid !! 🙄" })

        // body Validation
        if (!validator.isValidBody(body))
            return res.status(400).send({ status: false, message: "Body is not valid 🙄" });

        // orderId validation
        if (!orderId)
            return res.status(400).send({ status: false, message: "orderId is Required !! 🙄" });

        if (!validator.isValidObjectId(orderId))
            return res.status(400).send({ status: false, message: "orderId is invalid !! 🙄" })

        const orderDoc = await orderModel.findOne({ _id: orderId, userId }).lean();


        if (!orderDoc) return res.status(404).send({ status: false, message: `No Order Found of This User ${userId} 🙄` });

        if (!status) return res.status(400).send({ status: false, message: "status is required 🙄" });

        if (!(status == 'pending' || status == 'completed' || status == 'canceled'))

            return res.status(400).send({ status: false, message: `Status (${status}) should be pending , completed or canceled 🙄` });

        if(orderDoc.status === "completed" || orderDoc.status === "canceled")
            return res.status(400).send({ status: false, message: "Order is already in processed or canceled!! 🙄" });


        if ((status === 'canceled') && (orderDoc.cancellable === false)) {
            return res.status(400).send({ status: false, message: "Order is not cancellable 🙄" });
        }
        orderDoc['status'] = status;
        
        const newData = await orderModel.findOneAndUpdate({_id:orderId},orderDoc, {new:true})
        
        return res.status(200).send({ status: true, message: "Order Updated successfully  !! 😎", data:newData })

    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createOrder, updateOrder }