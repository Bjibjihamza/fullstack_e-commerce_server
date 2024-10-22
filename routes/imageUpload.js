const  express = require('express');
const router = express.Router();
const { ImageUpload } = require('../models/imageUpload');
const multer = require('multer');



router.get('/' , async(req, res) => {
    try{
        const imageUploadList = await ImageUpload.find();

        if (!imageUploadList) {
            return res.status(500).json({ success: false });
        }
        

        return res.status(200).json(imageUploadList);

    } catch(error) {
        res.status(500).json({success : false})
        
    }
})



router.post('/create', async (req, res) => {
    try {

        let category = new Category({
            name: req.body.name,
            images: imagesArr,
            color: req.body.color,
        });

        category = await category.save();

        imagesArr = [];

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }
});





// Configurez multer pour gérer les fichiers d'image
const storage = multer.memoryStorage();  // Stocke les fichiers en mémoire, vous pouvez utiliser diskStorage pour enregistrer les fichiers
const upload = multer({ storage: storage });

router.post('/createIm', upload.array('images', 10), async (req, res) => {
    try {

        let imagesArr = req.body;
        let imagesUploaded = new ImageUpload({
            images : imagesArr,
        });
        imagesUploaded = await imagesUploaded.save();
        return res.status(200).json(imagesArr);



    } catch (error) {
        console.error('Error in /createIm:', error);
        res.status(500).json({ success: false, message: 'Failed to process request', error: error.message });
    }
});




router.delete('/delete', async (req, res) => {
    try {
        const imgUrl = req.query.imgUrl;
        if (!imgUrl) {
            return res.status(400).json({ success: false, message: 'Image URL is required' });
        }

        const deletedImage = await ImageUpload.findOneAndDelete({ images: imgUrl });

        if (!deletedImage) {
            return res.json({ success: false, message: 'Image not found' });
        }

        return res.status(200).json({ success: true, deletedImage });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to delete the image' });
    }
});



router.delete('/deleteAllImages', async (req, res) => {
    try {
        const images = await ImageUpload.find();

        if (images.length === 0) {
            return res.status(404).json({ success: false, message: 'No images to delete' });
        }

        let deletedImages = [];

        // Boucler sur toutes les images et les supprimer
        for (let image of images) {
            const deletedImage = await ImageUpload.findByIdAndDelete(image._id);
            deletedImages.push(deletedImage);
        }

        return res.status(200).json({ success: true, deletedImages });

    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to delete images' });
    }
});

module.exports = router;