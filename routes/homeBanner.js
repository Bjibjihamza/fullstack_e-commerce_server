const { HomeBanner, homeBannerSchema } = require('../models/homeBanner');
const { ImageUpload } = require('../models/imageUpload');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require("fs");
const path = require('path');


const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
})


var imagesArr = [];

var slideEditId;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
        // imagesArr.push(`${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage: storage });


router.get('/', async (req, res) => {
    try {

        const bannerImagesList = await HomeBanner.find()

        if (!bannerImagesList) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json(bannerImagesList)

    } catch (error) {
        res.status(500).json({ success: false });
    }
});

router.get("/:id" , async(req , res) => {
    slideEditId = req.params.id;

    const slide = await HomeBanner.findById(req.params.id)

    if(!slide) {
        res.status(500).json({message : 'The slide with the given Id was not found'})
    }
    return res.status(200).send(slide)
})

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

router.post('/create', async (req, res) => {
    
    let newEntry = new HomeBanner({
        images: imagesArr,
    });
    console.log

    if (!newEntry) {
        res.status(500).json({
            error: error,
            success: false
        })
    }

    newEntry = await newEntry.save();

    imagesArr = [];

    res.status(201).json(newEntry);

});

router.delete('/:id', async (req, res) => {
    try {
        const item = await HomeBanner.findById(req.params.id)

        if (!item) {
            return res.status(404).json({ message: 'item not found!', success: false });
        }

        const images = item.images || [];

        if (images.length !== 0) {
            for (let image of images) {
                const imagePath = path.join(__dirname, '..', 'uploads', image);

                // Check if the image file exists before attempting to delete
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.warn(`Image file not found: ${imagePath}`);
                }
            }
        }


        const deletedItem = await HomeBanner.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ message: 'Category not found!', success: false });
        }
        res.status(200).json({ success: true, message: 'Category Deleted!' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', success: false });
        console.log('you cant')
    }
});

router.put('/:id', async (req, res) => {
    try {
        console.log(req.body)
        const slideItem = await HomeBanner.findByIdAndUpdate(
            req.params.id,
            {
                images: req.body.images,
            },
            { new: true }
        );

        if (!slideItem) {
            return res.status(404).json({ message: 'Category cannot be updated', success: false });
        }
        res.send(slideItem);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', success: false });
    }
});






module.exports = router;
