const { Types: { ObjectId } } = require('mongoose');
const Application = require('../Models/Application');
const User = require('../Models/user');
const Job = require('../Models/job');
const Intership = require('../Models/internship');

const saveApplication = async (req, res) => {
    try {
        const { fullName, email, phoneNumber,applicantUsername, motivationLetter, resume,companyName,companyLogo,jobTitle, userId, jobId } = req.body;

        const job = await Job.findById(jobId).populate('jobApplications');
        const userHasApplied = job.jobApplications.some(application => application.applicantUsername === applicantUsername);
        if (userHasApplied) {
            return res.status(400).json({ error: 'User has already applied for this job' });
        }

        const user = await User.findById(userId);

        const newApplication = new Application({
            fullName,
            email,
            phoneNumber,
            applicantUsername,
            submitDate : new Date(),
            motivationLetter,
            resume,
            companyName,
            companyLogo,
            jobTitle,
            jobId : job._id
        });
        await newApplication.save();

        user.applications.push(newApplication);
        job.jobApplications.push(newApplication);


        await Promise.all([user.save(),job.save()]);
        res.status(201).json({ message: 'Application saved successfully' });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const saveInternshipApplication = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, applicantUsername, motivationLetter, resume, companyName, companyLogo, jobTitle, userId, internshipId } = req.body;

        const internship = await Intership.findById(internshipId).populate('internshipApplications');
        const userHasApplied = internship.internshipApplications.some(application => application.applicantUsername === applicantUsername);
        if (userHasApplied) {
            return res.status(400).json({ error: 'User has already applied for this internship' });
        }

        const user = await User.findById(userId);

        const newApplication = new Application({
            fullName,
            email,
            phoneNumber,
            applicantUsername,
            submitDate : new Date(),
            motivationLetter,
            resume,
            companyName,
            companyLogo,
            jobTitle,
            internshipId: internship._id
        });
        await newApplication.save();

        user.applications.push(newApplication);
        internship.internshipApplications.push(newApplication);

        await Promise.all([user.save(), internship.save()]);
        res.status(201).json({ message: 'Application for internship saved successfully' });
    } catch (error) {
        console.error('Error saving internship application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { fullName, email, phoneNumber, motivationLetter, resume, userId, jobId } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.fullName = fullName;
        application.email = email;
        application.phoneNumber = phoneNumber;
        application.motivationLetter = motivationLetter;
        application.resume = resume;

        await application.save();

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found')
            return res.status(404).json({ error: 'User not found' });
        }
        const userApplicationIndex = user.applications.findIndex(app => app._id.toString() === applicationId);
        if (userApplicationIndex !== -1) {
            user.applications[userApplicationIndex] = application;
            await user.save();
        }

        // Update the application in the job offer's applications list
        const job = await Job.findById(jobId);
        if (!job) {
            console.log('Job not found')
            return res.status(404).json({ error: 'Job offer not found' });
        }
        const jobApplicationIndex = job.jobApplications.findIndex(app => app._id.toString() === applicationId);
        if (jobApplicationIndex !== -1) {
            job.jobApplications[jobApplicationIndex] = application;
            await job.save();
        }

        res.status(200).json({ message: 'Application updated successfully' });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updateInternshipApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { fullName, email, phoneNumber, motivationLetter, resume, userId, internshipId } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        application.fullName = fullName;
        application.email = email;
        application.phoneNumber = phoneNumber;
        application.motivationLetter = motivationLetter;
        application.resume = resume;

        await application.save();

        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }
        const userApplicationIndex = user.applications.findIndex(app => app._id.toString() === applicationId);
        if (userApplicationIndex !== -1) {
            user.applications[userApplicationIndex] = application;
            await user.save();
        }

        // Update the application in the internship's applications list
        const internship = await Intership.findById(internshipId);
        if (!internship) {
            console.log('Internship not found');
            return res.status(404).json({ error: 'Internship not found' });
        }
        const internshipApplicationIndex = internship.internshipApplications.findIndex(app => app._id.toString() === applicationId);
        if (internshipApplicationIndex !== -1) {
            internship.internshipApplications[internshipApplicationIndex] = application;
            await internship.save();
        }

        res.status(200).json({ message: 'Application for internship updated successfully' });
    } catch (error) {
        console.error('Error updating internship application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getApplicationsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const applications = await Application.find({ applicantUsername: username }).sort({submitDate :-1});
        res.status(200).json({ applications });
    } catch (error) {
        console.error('Error fetching applications by username:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        console.log('Application ID:', applicationId);

        const application = await Application.findById(applicationId);
        console.log('Application:', application);

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        const user = await User.findOne({ username: application.applicantUsername });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }


        const userIndex = user.applications.findIndex(application => application && application._id.toString() === applicationId);
        console.log('user', userIndex)
        if (userIndex !== -1) {
            user.applications.splice(userIndex, 1);
            await user.save();
        }


        if (application.jobId) {
            const job = await Job.findById(application.jobId);
            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const jobIndex = job.jobApplications.findIndex(application => application && application._id.toString() === applicationId);
            console.log('job', jobIndex)
            if (jobIndex !== -1) {
                job.jobApplications.splice(jobIndex, 1);
                await job.save();
            }
        } else if (application.internshipId) {
            const internship = await Intership.findById(application.internshipId);
            if (!internship) {
                return res.status(404).json({ error: 'Internship not found' });
            }

            const internshipIndex = internship.internshipApplications.findIndex(application => application && application._id.toString() === applicationId);
            console.log('intership', internshipIndex)
            if (internshipIndex !== -1) {
                internship.internshipApplications.splice(internshipIndex, 1);
                await internship.save();
            }
        }


        await Application.findByIdAndDelete(applicationId);

        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    saveApplication,
    updateApplication,
    saveInternshipApplication,
    updateInternshipApplication,
    getApplicationsByUsername,
    deleteApplication
};
