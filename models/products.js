const mongoose = require("mongoose");

const productSchema = mongoose.Schema({

    name : {
        type : String, 
        required : true,
    },
    description : {
        type : String, 
        required : true,
    },
    sex : {
        type : [], 
        required : true,
    },
    class : {
        type : [], 
    },
    isFeatured : {
        type : Boolean, 
        default : false,
    },
    isPopulair : {
        type : Boolean, 
        default : false,
    },
    New : {
        type : Boolean, 
        default : false,
    },
    rating : {
        type : Number, 
        default : 0,
    },
    price : {
        type : Number, 
        default : ''
    },
    oldPrice : {
        type : Number, 
        default : ''
    },
    brand : {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Brand', 
        required : true,
    },
    catName : {
        type : String,
        default : ''
    },
    brandName : {
        type : String,
        default : ''
    }, 
    category: {
        type : mongoose.Schema.Types.ObjectId, 
        ref : 'Category',
        required : true
    },
    images:[{
        type:String,
        required : true
    }],
    dateCreated : {
        type : Date, 
        default : Date.now,
    },
})


productSchema.virtual('id').get(function () {
    return this._id.toHexString();
})

productSchema.set('toJSON' , {
    virtual : true
})

exports.Product = mongoose.model('Product' , productSchema);