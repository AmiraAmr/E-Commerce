const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator')

const Product = require('../../models/Product') //Getting the ProductSchema
const Deleted_Product = require('../../models/Deleted_Product') //Getting the Deleted_ProductSchema
const Category = require('../../models/Category') //Getting the ProductSchema
const Deleted_Category = require('../../models/Deleted_Category') //Getting the ProductSchema

// @router POST api/categories
// @desc Add a category
// @access public
router.post('/', [
    // Checking the required specifications of the entered data
    check('name', 'Name is required !').not().isEmpty()
], auth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body
    const user = await User.findById(req.user.id) // returns its id only

    try {
        //Entering values
        const category = new Category({ name, user });

        await category.save() //saving to db
        res.status(200).send('Category is added')
    } catch (e) {
        res.status(500).send(e)
    }
})

// @router GET api/categories/all
// @desc Get all categories
// @access public
router.get('/all', async (req, res) => {
    try {
        const categories = await Category.find().populate('category') //get the name from the Schema
        res.json(categories);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

// @router POST api/categories/:id
// @desc Update a categories
// @access private
router.post('/:id', auth, async (req, res) => {

    const category = await Category.findById(req.params.id)
    const user = await User.findById(req.user.id) // returns its id only and other times returns the obj سبحان الله

    if (JSON.stringify(user.id) !== JSON.stringify(category.user)) {
        return res.status(400).send('This action can be done by the product creator only')
    }
    const { name } = req.body

    try {
        category.name = name;
        console.log(category.name);


        res.status(200).send(category)
    } catch (e) {
        res.status(500).send(e)
    }
})


// @router DELETE api/categories/:id
// @desc delete categories by id
// @access Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)

        if (JSON.stringify(category.user) !== JSON.stringify(req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' })
        }
        if (!category) {
            return res.status(404).json({ msg: 'Category not found !' })
        }
        const { name, user } = category

        const deleted_category = new Deleted_Category({ name, user });



        //getting the products in the category to be deleted
        var products = new Array;
        products = await Product.find({ category_id: category })
        const products_count = await Product.find({ category_id: category }).count()

        //deleteing the returned products
        products.map(async (product) => {
            const { name, description, price, picture, category_id, user } = product

            const deleted_products = new Deleted_Product({ name, description, price, picture, category_id, user });

            await deleted_products.save() //saving to db to another collection

            await product.remove() //removing from db
        })

        // deleting the category
        await deleted_category.save() //saving to db to another collection

        await category.remove() //removing from db
        res.json('Category is removed..')

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

// @desc Get all deleted categories
// @access public
router.get('/all/deleted_categories', async (req, res) => {
    try {
        const deleted_categories = await Deleted_Category.find().populate('product', ['name', 'id']) //get the name and id from the UserSchema
        res.json(deleted_categories);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})
// @router POST api/products/deleted_categories/:id
// @desc retrieve delted product by id
// @access Private
router.post('/deleted_categories/:id', auth, async (req, res) => {
    try {

        const deleted_category = await Deleted_Category.findById(req.params.id)

        if (JSON.stringify(deleted_category.user) !== JSON.stringify(req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' })
        }
        if (!deleted_category) {
            return res.status(404).json({ msg: 'Product not found !' })
        }
        const { name, user } = deleted_category

        const category = new Category({ name, user });

        await category.save() //saving to db to another collection

        await deleted_category.remove() //removing from db
        res.json('Category is retrieved..')

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})



module.exports = router;