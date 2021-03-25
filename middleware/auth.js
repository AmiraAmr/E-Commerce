const jwt = require('jsonwebtoken')
const config = require('config')


//Middleware function is a function that can access req res cycle
module.exports = function (req, res, next) {

    //Get token from header
    const token = req.header('x-auth-token'); //key that we want to send token in (header in postman, don't know where it is in browsers)
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user;

        next(); //like we do in any middleware
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' })
    }
}