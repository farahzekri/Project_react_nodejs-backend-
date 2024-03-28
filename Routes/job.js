const express = require('express');
const router = express.Router();
const controllerJob = require('../Controllers/controller.job')


router.post('/AddJob/:username', controllerJob.AddJob);

router.get('/GetAllJobs', controllerJob.getAllJobs);
router.get('/searchJobs', controllerJob.searchJobs);
router.get('/getJobById/:jobId', controllerJob.getJobById);
router.get('/getapp/:jobId', controllerJob.getappbyjobid);
module.exports = router;