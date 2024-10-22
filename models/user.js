
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    
        name:{
            type:String,
            required : true
        },
        phone:{
            type:String,
            required : true,
        },
        email:{
            type:String,
            required : true,
        },
        images : [
            {
                type :String,
                required:true
            }
        ],
        password : {
            type:String,
            required:true
        },
        admin : {
            type : Boolean,
            default : false
        }
})

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON' , {
    virtuale: true,
})


exports.User = mongoose.model('User' , userSchema);
exports.userSchema = userSchema;