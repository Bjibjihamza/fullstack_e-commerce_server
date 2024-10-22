
const mongoose = require('mongoose');

const imageUploadShema = mongoose.Schema({
    images : [
        {
            type : String, 
            required : true
        }
    ],
    link : {
        type:String
    }
})


imageUploadShema.virtual('id').get(function () {
    return this._id.toHexString();
});

imageUploadShema.set('toJSON' , {
    virtuale: true,
})



exports.ImageUpload = mongoose.model('ImageUpload' , imageUploadShema);
exports.imageUploadShema = imageUploadShema;