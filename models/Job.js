const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    company:
    {
        type:String,
        required:[true, "Please provide company name"],
        maxLength:50
    },
    position:
    {
        type:String,
        required:[true, "Please provide position"],
        maxLength:100
    },
    status:
    {
        type:String,
        enum:{
            values:['pending','declined','interview'],
        },
        default:"pending"
    },
    createdBy:
    {
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:[true,"Please provide user"]
    },
    jobType:
    {
        type:String,
        enum:['full-time','part-time','remote','internship'],
        default:'full-time'
    },
    jobLocation:
    {
        type:String,
        required:true,
        default:'my city'
    }
}, {timestamps:true}); // createdAt, updatedAt

module.exports = mongoose.model("Jobs",JobSchema);

//Svaki dokument u kolekciji Job referencira se na točno jedan dokument u kolekciji User preko polja createdBy,
// ali jedan dokument u kolekciji User može biti povezan s više dokumenata u kolekciji Job.