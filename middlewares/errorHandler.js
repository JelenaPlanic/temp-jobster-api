//const {CustomAPIError} = require("../errors");
const {StatusCodes} = require("http-status-codes");
const errorHandler = (err, req, res, next) =>
{
    console.log(err);
     // if(err instanceof CustomAPIError)
    // {
    //     return res.status(err.statusCode).json({msg:err.message});
    // }
    let customError =
    {
        statusCode : err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        message : err.message || `Something went wrong, please try later...`
    }
    if(err.code && err.code === 11000)
    {
        customError.message = `Duplicate value entered for ${Object.keys(err.keyValue)} field,please choose another value`,
        customError.statusCode = 400;
    }
    if (err.name === 'ValidationError') 
    {
        customError.message = Object.values(err.errors)
          .map((item) => item.message)
          .join(',')
        customError.statusCode = 400
    } 
    if(err.name === "CastError")
    {
        customError.message = `No item found with id ${err.value}.`,
        customError.statusCode = 404;
    }
    
        return res.status(customError.statusCode).json({msg:customError.message, err});
    
}

module.exports = errorHandler;
// validation, cast, duplicate