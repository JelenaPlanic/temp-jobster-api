const User = require("../models/User");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError, UnauthenticatedError} = require("../errors");
const bcrypt = require("bcryptjs");
const jsonWebToken = require("jsonwebtoken");

const register = async(req, res) =>
{
    // const {name, password, email} = req.body;
    // if(!name || !password || !email)
    // {
    //     throw new BadRequestError(`Please provide name, or email, or password`);
    // }
    // const {name, email, password} = req.body;
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    // const tempUser = {name, email, password:hashedPassword};

    const newUser = await User.create({...req.body});
    const token = newUser.createJWT();
    //const token = jsonWebToken.sign({userId:newUser._id, name:newUser.name}, "JWT SECRET", {expiresIn:'30d'});
    res.status(StatusCodes.CREATED).json({user:
    {
      name: newUser.name,
      lastName:newUser.lastName,
      location: newUser.location,
      email:newUser.email,
      token

    }});
}

const login = async(req, res) =>
{
   //email, password
   console.log(req.body);
   const {email, password} = req.body;
   if(!email || !password)
   {
        throw new BadRequestError("Please provide email and password.");
   }

   const user = await User.findOne({email});
   if(!user)
   {
     throw new UnauthenticatedError("Invalid credentials");
   }
   // compare password

   const isMatch = await user.comparePassword(password); // then ili async/await u try/catch bloku
   if(!isMatch)
   {
    throw new UnauthenticatedError("Invalid credentials");
   }

   const token = user.createJWT();

   res.status(StatusCodes.OK).json({user:
    {
      name: user.name,
      lastName:user.lastName,
      location: user.location,
      email:user.email,
      token

    }});
}

const updateUser = async(req, res) =>
{
  console.log(req.user);

  const {name, lastName, email, location} = req.body;
  if(!name || !lastName || !email || !location)
  {
    throw new BadRequestError(`Please provide all values`);
  }
  const user = await User.findOne({_id:req.user.userId});
  
  user.name = name;
  user.lastName = lastName;
  user.email = email;
  user.location = location;

  await user.save();

  const token = user.createJWT(); // potrebno je jer u tokenu prosledjumo name i id (name moze biti promenjeno)
  res.status(StatusCodes.OK).json(
    {
      user:
      {
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        location:user.location,
        token
      }
    }
  )
}

module.exports = {register, login, updateUser};