const express = require('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator')

const User = require('../../models/User') //Getting the UserSchema

// @router POST api/users
// @desc User sign up
// @access public
router.post('/', [
    // Checking the required specifications of the entered data
    check('name', 'Name is required !').not().isEmpty(),
    check('email', 'Please include a valid email !').isEmail(),
    check('phoneNumber', 'Please leave your phone number to be accessed !').not().isEmpty(),
    check('password', '6 or more characters required for the password !').isLength({ min: 6 })
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, phoneNumber } = req.body; // destructuring

        try {
            // Check if the user exists
            let user = await User.findOne({ email }) //short for email(the value just been input ): email(each email value in the database)
            if (user) {
                res.status(400).json({ errors: [{ msg: 'User alreay exists..' }] })
            }

            // Get users gravatar
            const avatar = gravatar.url(email, {
                s: '200', //size
                r: 'pg', //raiding? pg->هي حاجة ليها علاقة بالمعايير الأخلاقية
                d: 'mm' //default mm-> user icon default, we can use 404 which is not good
            })

            //creating the new entered user passing its data to the schema.. but not yet saved to the db
            user = new User({
                name,
                email,
                avatar,
                password,
                phoneNumber
            })

            // Encrypt password
            const salt = await bcrypt.genSalt(10); //to be hashed returning a promise (i think such as picking a method or sth) , 10 is recommended in the documentation
            // NOTE***** anything returns promise we should put await when using async await
            user.password = await bcrypt.hash(password, salt)

            await user.save() //saving to db

            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id //it's ok not to use ._id with mongodb it's familiar with it
                }
            }

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token }) //else
                }
            )

        } catch (err) {
            console.log(err.message);
            res.status(500).send('Server Error ..!')
        }
    }
)

// @router GET api/users/all
// @desc Get all users
// @access public
router.get('/all', async (req, res) => {
    try {
        const users = await User.find().populate('user', ['name', 'avatar', 'phoneNumber']) //get the name, avatar, and phone number from the UserSchema
        res.json(users);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})

// @router DELETE api/users/:id
// @desc delete user
// @access Private
router.delete('/:id', auth, async (req, res) => { // private --> we have token so we add middleware making it private
    try {

        const user = await User.findById(req.params.id)
        if (!user) {
            return res.status(404).json({ msg: 'User not found !' })
        }
        if (user.id !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' })
        }

        await user.remove()
        res.json('User is removed..')

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error !')
    }
})


module.exports = router;