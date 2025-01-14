const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: /^\S+@\S+\.\S+$/,
        unique: false
    },
    phoneNumber: {
        type: String,
        required: false
    },
    motivationLetter: {
        type: String,
        required: true
    },
    resume: {
        type: String,
    },
    submitDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    applicantUsername: {
        type: String,
    },
    companyName: {
        type: String,
    },
    companyLogo: {
        type: String,
    },
    jobTitle: {
        type: String,
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    internshipId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    interviewDate: { type: Date },
    interviewDates:[Date],
    
});

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
