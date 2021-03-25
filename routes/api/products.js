const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator')

const Product = require('../../models/Product') //Getting the ProductSchema
const User = require('../../models/User') //Getting the UserSchema
const Deleted_Product = require('../../models/Deleted_Product') //Getting the Deleted_ProductSchema
const Category = require('../../models/Category') //Getting the ProductSchema

// @router POST api/products
// @desc Add a product
// @access public
router.post('/', [
    // Checking the required specifications of the entered data
    check('name', 'Name is required !').not().isEmpty(),
    check('description', 'Description is required !').not().isEmpty(),
    check('price', 'Price is required !').not().isEmpty(),
    check('category', 'Category is required !').not().isEmpty()
], auth, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, picture, category } = req.body
    const user = await User.findById(req.user.id) // returns its id only

    try {
        // Checking the category
        const category_db = await Category.findOne({ name: category }) //short for name: name

        if (!category_db) { // if it is not created before
            const category_db = new Category({ name: category, user });
            await category_db.save()
        }

        const category_id = category_db.id

        //Entering values
        const product = new Product({
            name,
            description,
            price,
            picture,
            category_id,
            user
        });

        await product.save() //saving to db
        res.status(200).send('Product is added')
    } catch (e) {
        res.status(500).send(e)
    }
})

// @router GET api/products/all
// @desc Get all products
// @access public
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find().populate('product', ['name', 'picture', 'description', 'price', 'category_id', 'id']) //get the name, avatar, and phone number from the UserSchema
        res.json(products);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

// @router POST api/products/:id
// @desc Update a product
// @access private
router.post('/:id', auth, async (req, res) => {

    const product = await Product.findById(req.params.id)
    const user = await User.findById(req.user.id) // returns its id only and other times returns the obj سبحان الله

    if (JSON.stringify(user.id) !== JSON.stringify(product.user)) {
        return res.status(400).send('This action can be done by the product creator only')
    }
    const { name, description, price, picture, category } = req.body

    // Checking the category
    const category_db = await Category.findOne({ name: category }) //short for name: name
    console.log(category_db)
    if (!category_db) { // if it is not created before
        const category_db = new Category({ name: category, user });
        await category_db.save()
    }

    category_id = category_db.id

    const productFields = {}
    if (name) productFields.name = name;
    if (description) productFields.description = description;
    if (price) productFields.price = price;
    if (picture) productFields.picture = picture;
    if (category) productFields.category_id = category_id;


    try {
        // product = await Product.findOneAndUpdate({ _id: req.params.id }, { $set: productFields }, { new: true }) //NOTWORKING !!!
        product.name = name;
        product.description = description;
        product.price = price;
        product.picture = picture;
        product.category_id = category_id;

        res.status(200).send(product) // btege sa7 bs msh btt save !!!!!
    } catch (e) {
        res.status(500).send(e)
    }
})


// @router DELETE api/products/:id
// @desc delete product by id
// @access Private
router.delete('/:id', auth, async (req, res) => { // private --> we have token so we add middleware making it private
    try {

        const product = await Product.findById(req.params.id)

        if (JSON.stringify(product.user) !== JSON.stringify(req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' })
        }
        if (!product) {
            return res.status(404).json({ msg: 'Product not found !' })
        }
        const { name, description, price, picture, category_id, user } = product

        const deleted_product = new Deleted_Product({ name, description, price, picture, category_id, user });

        await deleted_product.save() //saving to db to another collection

        await product.remove() //removing from db
        res.json('Product is removed..')

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

// @desc Get all deleted products
// @access public
router.get('/all/deleted_products', async (req, res) => {
    try {
        const deleted_products = await Deleted_Product.find().populate('product', ['name', 'picture', 'description', 'price', 'category', 'id']) //get the name, avatar, and phone number from the UserSchema
        res.json(deleted_products);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})
// @router POST api/products/deleted_products/:id
// @desc retrieve delted product by id
// @access Private
router.post('/deleted_products/:id', auth, async (req, res) => {
    try {

        const deleted_product = await Deleted_Product.findById(req.params.id)

        if (JSON.stringify(deleted_product.user) !== JSON.stringify(req.user.id)) {
            return res.status(401).json({ msg: 'User not authorized' })
        }
        if (!deleted_product) {
            return res.status(404).json({ msg: 'Product not found !' })
        }
        const { name, description, price, picture, category, user } = deleted_product

        const product = new Product({ name, description, price, picture, category, user });

        await product.save() //saving to db to another collection

        await deleted_product.remove() //removing from db
        res.json('Product is retrieved..')

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

module.exports = router;