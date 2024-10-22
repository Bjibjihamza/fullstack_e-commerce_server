const { Order } = require('../models/order');
const express = require('express');
const router = express.Router();

var orderEditId;





router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 3;

        const { userId } = req.query;

        let filter = {};
        if (userId) {
            filter.userId = userId;
        }

        const totalPosts = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found" });
        }

        const orderList = await Order.find(filter)
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        if (!orderList) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json({
            "orderList": orderList,
            "totalPages": totalPages,
            "page": page
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve orders", success: false });
    }
});



router.post('/create', async (req, res) => {

    try {

        let order = new Order({
            fullname: req.body.fullname,
            phone1: req.body.phone1,
            phone2 : req.body.phone2,
            city: req.body.city,
            adress1: req.body.adress1,
            adress2: req.body.adress2,
            products : req.body.products,
            userId : req.body.userId

        });


        order = await order.save();

        res.status(201).json(order);

    } catch (error) {
        res.status(500).json({ error: error.message, success: false });
    }

});


router.get('/:id', async (req, res) => {
    try {
        orderEditId =  req.params.id;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }
        return res.status(200).json(order);

    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        return res.status(500).json({ message: 'Erreur du serveur, veuillez réessayer plus tard' });
    }
});



router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                fullname: req.body.fullname,
                phone1: req.body.phone1,
                phone2 : req.body.phone2,
                city: req.body.city,
                adress1: req.body.adress1,
                adress2: req.body.adress2,
                products : req.body.products,
                userId : req.body.userId,
                status :req.body.status
            },
            { new: true }
        );


        if (!order) {
            return res.status(404).json({
                message: "Product cannot be updated",
                status: false
            });
        }

        res.status(200).json({
            message: "Product updated",
            status: true,
            order 
        });
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while updating the product",
            error: error.message,
            status: false
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {

        const order = await Order.findById(req.params.id)

        if (!order) {
            return res.status(404).json({ message: 'Category not found!', success: false });
        }
        
    

        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
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



module.exports = router;