const {BadRequestError} = require("../errors");

const testUser = (req, res, next) =>
{
    console.log("TEST USER");
    // is value true
    if(req.user.testUser) // mora nakon middleware za autenf (user)
    {
        throw new BadRequestError('Test User, read only'); // NO: createJob, deleteJob, updateJob, updateUser
    }

    next(); // idi na naredni controller
}

module.exports = testUser;