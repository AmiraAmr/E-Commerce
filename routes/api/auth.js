const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')


const { forgotPassword, verifiedPassword } = require('../../emails/password')

const User = require('../../models/User')

// @router GET api/auth
// @desc Test route
// @access public
router.get('/', auth, async (req, res) => {
    //inserting auth (middleware function) making it protected

    try {
        const user = await User.findById(req.user.id).select('-password') //inorder not to return the password with the user data
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})


// @router POST api/auth
// @desc Authenticate user and get token (Login)
// @access public
router.post('/', [
    // Checking the required specifications of the entered data
    check('email', 'Please include a valid email !').isEmail(),
    check('password', 'Password is required !').exists()
],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body; // destructuring

        try {
            // Check if the user exists
            let user = await User.findOne({ email }) //short for email(the value just been input ): email(each email value in the database)
            if (!user) {
                res.status(400).json({ errors: [{ msg: 'Invalid credintials..' }] })
                //We didn't specify the invalid input in the email error nor the password; so that if someone wanted to check if a user existed or not.
                //Making both errors have the same msg is more secure
            }

            // Checking password
            const isMatch = await bcrypt.compare(password, user.password) //entered password then the password of the matched email in the db
            if (!isMatch) {
                res.status(400).json({ errors: [{ msg: 'Invalid credintials.. If you forgot your password go to http://localhost:5000/api/auth/resetpassword/:id' }] })
            }

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

// @router GET api/auth/resetpassword
// @desc forgot password sendgrid
// @access public
router.get('/resetpassword/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    try {
        forgotPassword(user.email, user.name, user._id)
        res.status(201).send('Check your mail..')

    } catch (e) {
        res.status(500).send(e)
    }
})

// @router POST api/auth/verifypassword/:id
// @desc verify password sendgrid
// @access public
router.post('/verifypassword/:id', [
    check('password', '6 or more characters required for the password !').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // const user = await User.findById(req.params.id)
    // console.log(user.password);


    try {
        const newPassword = req.body.password // htb2a el new password bs

        // Encrypt password the same method in sign up
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(newPassword, salt)

        const user = await User.findOneAndUpdate({ _id: req.params.id }, { password: encryptedPassword }, { new: true })

        verifiedPassword(user.email)
        res.status(201).send('Password Verified successfully')

    } catch (e) {
        res.status(500).send(e)
    }
})


module.exports = router;