const mongoose = require('mongoose');
const orderSchema = mongoose.Schema({
    
        fullname:{
            type:String,
            required : true
        },
        phone1 : {
            type:Number,
            required : true
        },
        phone2 : {
            type:Number,
            required : false
        },
        city : {
            type:String,
            required : true
        },
        adress1 : {
            type:String,
            required : true
        },
        adress2 : {
            type:String,
            required : false
        },
        products : [
            {
                productId: {
                    type :String
                },
                productTitle : {
                    type : String
                },
                quantity : {
                    type : Number
                },
                price : {
                    type :Number
                },
                image:{
                    type : String
                },
                total : {
                    type:Number
                }
            }
        ]
        ,
        userId: {
            type: String,
            required: true
        },
        status:{
            type:String,
            default : "pending"
        },
        date : {
            type :  Date,
            default :Date.now
        }
})


orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON' , {
    virtuale: true,
})


exports.Order = mongoose.model('Order' , orderSchema);
exports.orderSchema = orderSchema;