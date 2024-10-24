const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require("fs");
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();



const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
})


var imagesArr = [];

var categoryEditId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
        // imagesArr.push(`${Date.now()}_${file.originalname}`)
    }
})

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 10, 
    message: {
        error: true,
        msg: "Too many registration attempts, please try again after 15 minutes."
    }
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];
    try {

        for (let i = 0; i < req.files.length; i++) {

            const options = {
                use_filename: true,
                unique_filename: false,
                overwrite: false,
            };


            const img = await cloudinary.uploader.upload(req.files[i].path, options,
                function (error, result) {
                    imagesArr.push(result.secure_url);
                    fs.unlinkSync(`uploads/${req.files[i].filename}`)
                }
            )
        }

        let imagesUploaded = new ImageUpload({
            images: imagesArr,
        });
        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);

    } catch (error) {
        console.log(error)
    }

})

router.post(`/upload`, upload.array("images"), async (req, res) => {
    let images;

    if (categoryEditId !== undefined) {
        const category = await Category.findById(categoryEditId);

        if (category) {
            images = product.images;
        }

        if (images.length !== 0) {
            for (image of images) {
                fs.unlinkSync(`uploads/${image}`);
            }
            categoryEditId = "";
        }
    }

    imagesArr = [];
    const files = req.files;
    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename);
    }

    res.send(imagesArr)
})

router.post(`/signup`, limiter, async (req, res) => {
    const { name, phone, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: true, msg: "User with this email already exists!" });
        }

        const existingUserByPh = await User.findOne({ phone });
        if (existingUserByPh) {
            return res.status(400).json({ error: true, msg: "User with this phone number already exists!" });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 12); // Increase bcrypt rounds to 12

        // Create new user
        const result = await User.create({
            name,
            phone,
            email,
            password: hashPassword
        });

        // Generate JWT token with expiration
        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY, { expiresIn: '1h' });

        // Return the response when the signup is successful
        return res.status(200).json({
            user: result,
            token: token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: true, msg: "Something went wrong." });
    }
});


router.post(`/signin`, async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            return res.status(404).json({ error: true, msg: "User not found!" });
        }

        const matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.status(400).json({ error: true, msg: "Invalid credentials!" });
        }

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        return res.status(200).json({
            user: existingUser,
            token: token,
            msg: "User authenticated successfully."
        });

    } catch (error) {
        return res.status(500).json({ error: true, msg: "Something went wrong. Please try again." });
    }
});


router.put(`/changePassword/:id` , async(req,res) => {
    const { name , phone , email , password , newPass , images } = req.body

    const existingUser = awaitUser.findOne({ email : email})
    if(!existingUser){
        res.status(404).json({error : true , msg :"User not found"})
    }

    const matchPassword = await bcrypt.compare(password , existingUser.password);

    if(!matchPassword){
        return res.json({ error :true,msg :"current password wrong" })
    }
    else {
        let newPassword

        if(newPass){
            newPassword = bcrypt.hashSync(newPass ,10)
        }else {
            newPassword = existingUser.passwordHash
        }
    
        const user = await User.findByIdAndUpdate(
            req.params.id ,{
                name:name,
                phone:phone,
                email:email,
                password:newPassword,
                images:images,
            },
            {new : true}
        )
    
        if(!user)
            return res.status(400).send('the user cannot be Updated!')
    
        res.send(user)  
    }


})

router.get('/', async (req, res) => {
    const userList = await User.find();

    if (!userList) {
        res.status(500).json({ success: false })
    }

    res.send(userList)
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' })
    }

    res.status(200).send(user)
})

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            return res.status(200).json({ success: true, message: 'The user is deleted!' });
        } else {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocument((count) => count);

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    })
})

router.put('/:id', async (req, res) => {

    const { name, phone, email } = req.body;

    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: name,
            phone: phone,
            email: email,
            password: newPassword,
            images: imagesArr
        },
        { new: true }
    );

    if (!user)
        return res.status(400).send('the user cannot be Updated!');

    res.send(user);
});


module.exports = router;
