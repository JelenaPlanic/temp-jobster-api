const CustomAPIError = require("./CustomErrorAPI");
const BadRequestError = require("./BadRequestError");
const UnauthenticatedError = require("./UnauthenticatedError");
const NotFoundError = require("./NotFoundError");



module.exports = {
    CustomAPIError, 
    BadRequestError, 
    UnauthenticatedError,
    NotFoundError
}