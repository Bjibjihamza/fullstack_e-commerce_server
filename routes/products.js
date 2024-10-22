const { Category } = require('../models/category.js');
const {Brand} = require('../models/brands.js')
const { Product } = require('../models/products.js');
const { ImageUpload } = require('../models/imageUpload');

const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET,
    secure: true
})



var imagesArr = [];
var Video = '';
var productEditId;


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
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

    if (productEditId !== undefined) {
        const product = await Product.findById(productEditId);

        if (product) {
            images = product.images;
        }

        if(images.length !== 0){
            for(image of images){
                fs.unlinkSync(`uploads/${image}`);
            }
            productEditId = "";
        }}  

    imagesArr = [];
    const files = req.files;
    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename);
    }

    res.send(imagesArr)
})


router.post('/create', async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);

 
        if (!category) {
            return res.status(404).send("Invalid category");
        }

        const brand = await Brand.findById(req.body.brand);

        if (!brand) {
            return res.status(404).send("Invalid category");
        }


        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            sex: req.body.sex,
            class : req.body.class,
            isFeatured: req.body.isFeatured,
            isPopulair: req.body.isPopulair,
            New: req.body.New,
            rating: req.body.rating,
            price: req.body.price,
            oldPrice : req.body.oldPrice, 
            brand: req.body.brand,
            catName: req.body.catName,
            brandName :  req.body.brandName, 
            category: req.body.category,
            images: imagesArr,
        });


        product = await product.save();

        res.status(201).json(product);

    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }

});


router.get('/', async (req, res) => {

    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10; 
        let query = {};

        if (req.query.catName) {
            query.catName = req.query.catName;
        }

        if (req.query.brandName) {
            query.brandName = req.query.brandName;
        }

        if (req.query.sex) {
            query.sex = { $in: [req.query.sex] }; 
        }


        if (req.query.class) {
            const classes = Array.isArray(req.query.class) 
                ? req.query.class 
                : [req.query.class]; 
        
            query.class = { $in: classes };  
        }
        


        const totalPosts = await Product.countDocuments(query);
        const productList = await Product.find(query)
            .populate('category')
            .populate('brand')
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        return res.status(200).json({
            products: productList,
            totalPages: Math.ceil(totalPosts / perPage),
            page: page
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});


router.get("/latest", async (req, res) => {
    try {
      const latestProducts = await Product.find().populate('category')
      .populate('brand')
        .sort({ createdAt: -1 }) 
        .limit(10);           
  
      if (!latestProducts.length) {
        return res.status(404).json({ message: "No products found" });
      }
  
      res.json(latestProducts);
    } catch (error) {
      console.error("Error fetching latest products:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
 

router.get('/populair', async (req, res) => {
    const productList = await Product.find({isPopulair:true}).populate('category')
    .populate('brand')

    if (!productList) {
        return res.status(500).json({ success: false });
    }

    return res.status(200).json(productList);
})



router.get('/featured', async (req, res) => {
    const productList = await Product.find({isFeatured:true})

    if (!productList) {
        return res.status(500).json({ success: false });
    }

    return res.status(200).json(productList);

})




router.get('/:id', async (req, res) => {
    try {
        productEditId = req.params.id;
        const product = await Product.findById(req.params.id).populate('category')
        .populate('brand');
        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        return res.status(200).json(product);

    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        return res.status(500).json({ message: 'Erreur du serveur, veuillez réessayer plus tard' });
    }
});


router.delete('/:id', async (req, res) => {
    try {

        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({ message: 'Category not found!', success: false });
        }
        
        const images = product.images || [];

        if (images.length !== 0) {
            for (let image of images) {
                const imagePath = path.join(__dirname, '..', 'uploads', image);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.warn(`Image file not found: ${imagePath}`);
                }
            }
        }

        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Category not found!', success: false });
        }

        res.status(200).json({
            message: "The product is deleted",
            status: true
        });
        
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while deleting the product",
            error: error.message,
            status: false
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                description: req.body.description,
                sex: req.body.sex,
                class : req.body.class,
                isFeatured: req.body.isFeatured,
                isPopulair: req.body.isPopulair,
                New: req.body.New,
                rating: req.body.rating,
                price: req.body.price,
                oldPrice : req.body.oldPrice, 
                brand: req.body.brand,
                catName: req.body.catName,
                brandName: req.body.brandName,
                category: req.body.category,
                images: req.body.images,
            },
            { new: true }
        );


        if (!product) {
            return res.status(404).json({
                message: "Product cannot be updated",
                status: false
            });
        }

        res.status(200).json({
            message: "Product updated",
            status: true,
            product // Renvoie le produit mis à jour
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while updating the product",
            error: error.message,
            status: false
        });
    }
});


module.exports = router;

