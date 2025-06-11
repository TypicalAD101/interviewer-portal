// const express = require('express');
// const nodemailer = require('nodemailer');
// const ical = require('ical-generator').default;
// const path = require('path');
// const mongoose = require('mongoose');
// const app = express();

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/interview_tool')
//     .then(() => console.log('MongoDB connected locally...'))
//     .catch(err => console.log('MongoDB connection error:', err));


// app.get('/Company2jobs', async (req, res) => {
//     try {
//         const interviewers = await Interviewer.find();
//         res.status(200).json(interviewers);
//     } catch (err) {
//         res.status(500).send('Error fetching interviewers.');
//     }
// });


const express = require('express');
const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/interview_tool')
    .then(() => console.log('MongoDB connected locally...'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define the schema and model for Company2jobs collection
const company2JobSchema = new mongoose.Schema({
    jobName: String,
    yearsOfExperience: String,
    jobLocation: String,
    skillsRequired: String
});

const Company2Job = mongoose.model('Company2Job', company2JobSchema, 'Company2jobs'); // Ensure to use 'Company2jobs' as the collection name

// API to fetch all entries from Company2jobs collection
app.get('/Company2jobs', async (req, res) => {
    try {
        const jobs = await Company2Job.find();
        console.log(jobs);  // Display all the entries on the terminal
        res.status(200).json(jobs);  // Send the jobs back as a JSON response
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).send('Error fetching jobs.');
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
