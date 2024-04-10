const express = require("express");
const {register, login, updateUser} = require("../controllers/auth");
const authenticationUser = require("../middlewares/authentication");
const testUser = require("../middlewares/testUser");
const rateLimiter = require("express-rate-limit");
const router = express.Router();

const apiLimiter = rateLimiter({ // set APILimiter for 2 request
    windowMs: 15 *60 *1000, // 15 min
    max:10, // max 10 requesta
    message:
    {
        msg: 'Too many request from this IP. Please try again after 15 minutes.'
    }

})


router.post("/register", apiLimiter, register);
router.post("/login", apiLimiter, login);

router.patch("/updateUser",authenticationUser, testUser, updateUser); // protected


module.exports = router;