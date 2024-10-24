const { MyList } = require('../models/myList');
const express = require('express');
const router = express.Router();




router.get('/', async (req, res) => {
    try {

            const myList = await MyList.find(req.query)

            if (!myList) {
                return res.status(500).json({ success: false });
            }

            return res.status(200).json(myList)
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve categories", success: false });
    }
});


router.post('/add', async (req, res) => {

    const item = await MyList.find({ productId: req.body.productId });

    if (item.length === 0) {
        let list = new MyList({
            productTitle: req.body.productTitle,
            image: req.body.image,
            rating: req.body.rating,
            price: req.body.price,
            productId: req.body.productId,
            userId: req.body.userId,
        });

        if (!list) {
            res.status(500).json({
                error: err,
                success: false
            })
        }

        list = await list.save();

        res.status(201).json(list);
    } else {
        res.json({ status: false, msg: "somting wrong" });
    }

});

router.delete('/:id', async (req, res) => {

    if (req.query.productId) {
        query.productId = req.query.productId;
    }

    if (req.query.userId) {
        query.userId = req.query.userId;
    }

    const item = await MyList.findById(req.params.id)

    if (!item) {
        return res.status(404).json({ message: 'not found!', success: false });
    }



    const deletedItem = await MyList.findByIdAndDelete(req.params.id);

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

router.get('/:id', async (req, res) => {
    const item = await MyList.findById(req.params.id);
    if (!item) {
        res.status(500).json({ message: 'The MyList item with the given ID was not found' })
    }
    return res.status(200).send(item)
})


module.exports = router;
