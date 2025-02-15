require("dotenv").config();
const connectDB = require("./db/connectDB");
const mockData = require("./MOCK_DATA.json");
const Job = require("./models/Job");

const start = async()=>
{
    try 
    {
       await connectDB(process.env.MONGO_URI);
       await Job.create(mockData);
       console.log('Success'); 
       process.exit(0);
    } catch (error) {
        console.log(error);
        process.env(1);
    }
}

start();