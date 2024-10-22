
const mongoose = require('mongoose');
const categorySchema = mongoose.Schema({
    
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

categorySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

categorySchema.set('toJSON' , {
    virtuale: true,
})


exports.Category = mongoose.model('Category' , categorySchema);
exports.categorySchema = categorySchema;