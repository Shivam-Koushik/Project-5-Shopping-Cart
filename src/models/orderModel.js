const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const orderSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: 'user',
        required: true
    },
    items: [{
        _id : false,
        productId: {
            type: ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            // min : 1,
            default: 1
        }
    }],
    totalQuantity: {
        type: Number,
        required: true
    },
    cancellable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'completed', 'canceled']
    },
    deletedAt: { type: Date },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true })


module.exports = mongoose.model('order', orderSchema)
