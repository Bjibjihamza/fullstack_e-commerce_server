const { Cart } = require('../models/cart');
const express = require('express');
const router = express.Router();




router.get('/', async (req, res) => {
    try {

        const cartList = await Cart.find(req.query)

        if (!cartList) {
            return res.status(500).json({ success: false });
        }

        return res.status(200).json(cartList)

    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve categories", success: false });
    }
});


router.post('/add', async (req, res) => {

    const cartItem = await Cart.find({ productId: req.body.productId , userId :req.body.userId });

    if (cartItem.length === 0) {
        let cartList = new Cart({
            productTitle: req.body.productTitle,
            image: req.body.image,
            rating: req.body.rating,
            price: req.body.price,
            quantity: req.body.quantity,
            subTotal: req.body.subTotal,
            productId: req.body.productId,
            userId: req.body.userId,
        });

        if (!cartList) {
            res.status(500).json({
                error: err,
                success: false
            })
        }

        cartList = await cartList.save();

        res.status(201).json(cartList);
    } else {
        res.json({ status: false, msg: "Product already added in the cart" });
    }

});

router.delete('/:id', async (req, res) => {

    const cartItem = await Cart.findById(req.params.id)

    if (!cartItem) {
        return res.status(404).json({ message: 'Category not found!', success: false });
    }

    const deletedItem = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        return res.status(404).json({
            message: 'Category not found!',
            success: false
        });
    }

    res.status(200).json({
        success: true,
        message: 'Category Deleted!'
    });

});

router.get('/:id' , async (req, res) => {
    const cartItem = await Cart.findById(req.params.id);
    if(!cartItem) {
        res.status(500).json({ message :'The cart item with the given ID was not found' })
    }
    return res.status(200).send(cartItem)
})

router.put('/:id', async (req, res) => {

    const cartList = await Cart.findByIdAndUpdate(
        req.params.id,
        {
            productTitle: req.body.productTitle,
            image: req.body.image,
            rating: req.body.rating,
            price: req.body.price,
            quantity: req.body.quantity,
            subTotal: req.body.subTotal,
            productId: req.body.productId,
            userId: req.body.userId,
        },
        { new: true }
    );

    if (!cartList) {
        return res.status(404).json({
            message: 'Category cannot be updated',
            success: false
        });
    }
    res.send(cartList);

});




module.exports = router;
