const User = require("../models/User");
const jwt = require("jsonwebtoken");
const {UnauthenticatedError} = require("../errors");

const auth = async(req, res, next) =>
{
    const {authorization} = req.headers;
    if(!authorization || !authorization.startsWith('Bearer '))
    {
        throw new UnauthenticatedError('Authentication invalid');
    }

    const token = authorization.split(" ")[1];
    try 
    {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // const user = User.findById(payload.id).select("-password"); -password znaci remove password
        // req.user = user; preko tokena pronalaze odmah user pod id. moze se videti ova praksa.
        
        const testUser = payload.userId === '66129775f768ccff26f98db8' // true ili false, pazi na redosled
        req.user ={userId:payload.userId, testUser};
        next();

    } catch (error) {
        throw new UnauthenticatedError("Authentication invalid");
    }
}

module.exports = auth;