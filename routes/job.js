const express = require("express");
const {getAllJobs, getJob, createJob, updateJob, deleteJob, showStats} = require("../controllers/jobs");
const testUser = require("../middlewares/testUser");
const router = express.Router();

router.get("/", getAllJobs);

router.post("/",testUser, createJob);

router.get("/stats", showStats);

router.get("/:id",testUser, getJob);


router.patch("/:id",testUser, updateJob);
router.delete("/:id", testUser,deleteJob);


module.exports = router;