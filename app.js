require("dotenv").config();
require("express-async-errors");

const path = require("path");

// security packages
const helmet = require("helmet");



const express = require("express");
const connectDB = require("./db/connectDB");
const app = express();

app.use(express.static(path.resolve(__dirname, "./client/build")));
app.use(express.json());
app.use(helmet());


// error handler:
const notFoundMiddleware = require("./middlewares/notFound");
const errorHandlerMiddleware = require("./middlewares/errorHandler");


//authenticated middleware
const authMiddleware = require("./middlewares/authentication");

// routers:
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/job");


app.set('trust proxy', 1); // API LIMITER dokum
// routes:
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs",authMiddleware, jobsRouter);

app.get("*", (req, res) =>
{
    res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const PORT =process.env.PORT || 5000;

async function start()
{
    try 
    {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT,console.log(`Server is listening on port ${PORT}`));
    } catch (error) {
        console.log(error);
    }
}

start();

//helmet je alat
// koji omogućava jednostavno postavljanje bezbednosnih zaglavlja u HTTP odgovorima vaše web aplikacije.

//cors -> koji domeni imaju dozvolu da pristupaju resursima na vašem serveru, a koji ne.

//limiter -> ograničavanje broja zahteva koji dolaze od jednog IP adrese u određenom vremenskom periodu

//Remove-Item -Path .\.git -Recurse -Force