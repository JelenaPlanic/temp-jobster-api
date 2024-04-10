//CRUD

const { StatusCodes } = require("http-status-codes");
const {NotFoundError, BadRequestError} = require("../errors");
const Job = require("../models/Job");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllJobs = async(req, res) =>
{
    const {search, status, jobType, sort} = req.query;
    // filtering: count
    const queryObject =
    {
        createdBy:req.user.userId
    }

    if(search){
        queryObject.position = {$regex:search, $options:'i'};
    }

    if(status && status !== 'all')
    {
        queryObject.status = status;
    }
    if(jobType && jobType !== 'all')
    {
        queryObject.jobType = jobType;
    }

    let result =  Job.find(queryObject);
    // sortiranje: redosled liste
    if(sort === 'latest')
    {
        result = result.sort('-createdAt')
    }
    if(sort === 'oldest')
    {
        result = result.sort('createdAt');
    }
    if(sort === 'a-z')
    {
        result = result.sort('position');
    }
    if(sort === 'z-a')
    {
        result = result.sort('-position');
    }
    //pagination:

    const page = Number(req.query.page) || 1;
    const limit  = Number(req.query.limit) || 10;
    const skip = (page -1) * limit;

    result = result.skip(skip).limit(limit);
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs/limit); // 25 /10 3


    
    const jobs = await result;
    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages});
}

const getJob = async(req, res) =>
{
    const {user:{userId}, params:{id:jobId}} = req; //req.user.userId,  req.params.id
    const job = await Job.findOne({_id:jobId, createdBy:userId});

    if(!job)
    {
        throw new NotFoundError(`No job with id ${jobId}`);
    }
    res.status(StatusCodes.OK).json({job});
}

const updateJob = async(req, res) =>
{
     console.log(req.user);

     const {
        body:{company, position},
        params:{id:jobId},
        user:{userId}
     } = req;

     if(company === ' ' || position === ' ')
     {
        throw new BadRequestError("Company or positions fileds can not be empty");
     }

     const job = await Job.findByIdAndUpdate({_id:jobId, createdBy:userId}, req.body,
        {
            new:true, runValidators:true
        });

        if(!job)
        {
            throw new NotFoundError(`Job with id ${jobId} does not exist`);
        }

        res.status(StatusCodes.OK).json({job});
}

const deleteJob = async(req, res) =>
{
    const {
        user:{userId},
        params:{id:jobId}
    } = req;

    const job = await Job.findByIdAndDelete({_id:jobId, createdBy:userId});
    if(!job)
    {
        throw NotFoundError(`No job with id ${jobId}`);
    }

    res.status(StatusCodes.OK).send();

}

const createJob = async(req, res) =>
{
    req.body.createdBy = req.user.userId; // token
    const newJob = await Job.create(req.body); // company, position, createdBy
    res.status(StatusCodes.CREATED).json({newJob});
}

const showStats = async(req, res) =>
{
    let stats = await Job.aggregate( // vraca array of objects
        [
            //first stage
            {
                $match:{createdBy: new mongoose.Types.ObjectId(req.user.userId)}
            },
            {
                $group:{_id:'$status', count: {$sum:1}}
            }
        ]
    )
    console.log(stats); 
    /* [
        { _id: 'interview', count: 30 },
        { _id: 'declined', count: 22 },
        { _id: 'pending', count: 19 }
       ]
       frontend is looking for a different structure
    */
     
       stats = stats.reduce((acc, item)=>
    {
        const {_id:title, count} = item;
        acc[title] = count;
        return acc;
    }, {}); // vrednost koja se vraca
    console.log(stats); // ukoliko nema vraca se [] pa  {}

    const defaultStats = // kontrola i na backendu za nula poslova
    {
        pending : stats.pending || 0,
        interview: stats.interview || 0,
        declined: stats.declined || 0
    }

    console.log(defaultStats);
    // sortiranje descending, i da se prikazu poslednji 6 meseci
    let monthlyApplications = await Job.aggregate([
        {$match: {createdBy:new mongoose.Types.ObjectId(req.user.userId)}},
        {$group:
        {
            _id:{year:{$year:'$createdAt'}, month:{$month: '$createdAt'}},
            count:{$sum:1}
        }},
        {
            $sort:{'_id.year': -1, '_id.month':-1}
        },
        {
            $limit:6
        }
    ])
    console.log(monthlyApplications);
    // refactoring:
    // last month as a first month now (reverse)
    // different format (date)
    monthlyApplications = monthlyApplications.map((item)=> // return a object
{
    const {_id:{year, month},count} = item;
    const date = moment().month(month-1).year(year).format('MMM Y'); // drugacije tretira month -1
    // return iz ove callBack-a
    return {date, count};
}).reverse();
    console.log(monthlyApplications);
    

    res.status(StatusCodes.OK).json({defaultStats, monthlyApplications});
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats
}