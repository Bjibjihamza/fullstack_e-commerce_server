const { Brand } = require('../models/brands');
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

var brandEditId;

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
        const page = parseInt(req.query.page) || 1;
        const perPage = 5;
        const totalPosts = await Brand.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage)

        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found" })
        }

        const brandList = await Brand.find()
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!brandList) {
            return res.status(500).json({ success: false });
        }


        return res.status(200).json({
            "brandList": brandList,
            "totalPages": totalPages,
            "page": page
        })


    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve categories", success: false });
    }
});


router.post('/create', async (req, res) => {
    try {

        let brand = new Brand({
            name: req.body.name,
            images: imagesArr,
        });


        brand = await brand.save();

        imagesArr = [];

        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
});


router.get('/:id', async (req, res) => {
    try {
        brandEditId = req.params.id
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: 'The category with the given Id was not found' });
        }
        return res.status(200).send(brand);
    } catch (error) {
        return res.status(500).json({ message: 'An error occurred', success: false });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);

        if (!brand) {
            return res.status(404).json({ message: 'Brand not found!', success: false });
        }

        const images = brand.images || [];

        if (images.length !== 0) {
            for (let image of images) {
                const imagePath = path.join(__dirname, '..', 'uploads', image);

                try {
                    // Check if the image file exists before attempting to delete
                    if (fs.existsSync(imagePath)) {
                        await fs.unlink(imagePath);  // Asynchronous file deletion
                    } else {
                        console.warn(`Image file not found: ${imagePath}`);
                    }
                } catch (fileError) {
                    console.error(`Error deleting image: ${imagePath}`, fileError);
                }
            }
        }

        const deletedBrand = await Brand.findByIdAndDelete(req.params.id);
        if (!deletedBrand) {
            return res.status(404).json({ message: 'Brand not found!', success: false });
        }
        res.status(200).json({ success: true, message: 'Brand Deleted!' });
    } catch (error) {
        console.error("Error deleting brand:", error);  // Log the full error for debugging
        res.status(500).json({ message: 'An error occurred', success: false });
    }
});


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
            images : imagesArr,
        });
        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);

    } catch(error) {
        console.log(error)
    }

})


router.post(`/upload`, upload.array("images"), async (req, res) => {
    let images;

    if (brandEditId !== undefined) {
        const brand = await Brand.findById(brandEditId);

        if (brand) {
            images = brand.images;
        }

        if(images.length !== 0){
            for(image of images){
                fs.unlinkSync(`uploads/${image}`);
            }
            brandEditId = "";
        }}  

    imagesArr = [];
    const files = req.files;
    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename);
    }

    res.send(imagesArr)
})


router.put('/:id', async (req, res) => {
    try {
        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                images: req.body.images,
            },
            { new: true }
        );

        if (!brand) {
            return res.status(404).json({ message: 'Category cannot be updated', success: false });
        }
        res.send(brand);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', success: false });
    }
});

module.exports = router;
