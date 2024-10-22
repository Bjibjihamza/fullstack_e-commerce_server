const mongoose = require('mongoose');
const brandSchema = mongoose.Schema({
    
        name:{
            type:String,
            required : true
        },
        images:[
            {
                type:String,
                required : true
            }  
        ],

})


brandSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

brandSchema.set('toJSON' , {
    virtuale: true,
})


exports.Brand = mongoose.model('Brand' , brandSchema);
exports.brandSchema = brandSchema;