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

// Middleware to parse JSON, URL-encoded data, and serve static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Interviewer Schema and Model
const interviewerSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    number: String,
    rate: Number,
    skills: String,
    availability: String
});
const Interviewer = mongoose.model('Interviewer', interviewerSchema);

// Job Schema and Models for Company1, Company2, and Company3
const jobSchema = new mongoose.Schema({
    jobName: String,
    yearsOfExperience: String,
    jobLocation: String,
    skillsRequired: String
});

const Company1Job = mongoose.model('Company1Job', jobSchema, 'Company1jobs');
const Company2Job = mongoose.model('Company2Job', jobSchema, 'Company2jobs');
const Company3Job = mongoose.model('Company3Job', jobSchema, 'Company3jobs');

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});

app.get('/company1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'company1.html'));
});

app.get('/company2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'company2.html'));
});

app.get('/company3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'company3.html'));
});

// API to fetch jobs from Company1jobs collection
app.get('/Company1jobs', async (req, res) => {
    try {
        const jobs = await Company1Job.find();
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).send('Error fetching jobs from Company1.');
    }
});

// API to fetch jobs from Company2jobs collection
app.get('/Company2jobs', async (req, res) => {
    try {
        const jobs = await Company2Job.find();
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).send('Error fetching jobs from Company2.');
    }
});

// API to fetch jobs from Company3jobs collection
app.get('/Company3jobs', async (req, res) => {
    try {
        const jobs = await Company3Job.find();
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).send('Error fetching jobs from Company3.');
    }
});

// API route to get all interviewers from MongoDB
app.get('/interviewers', async (req, res) => {
    try {
        const interviewers = await Interviewer.find();
        res.status(200).json(interviewers);
    } catch (err) {
        res.status(500).send('Error fetching interviewers.');
    }
});

// API route to add a new interviewer using async/await
app.post('/add-interviewer', async (req, res) => {
    try {
        const newInterviewer = new Interviewer(req.body);
        const savedInterviewer = await newInterviewer.save();
        res.status(200).json(savedInterviewer);
    } catch (err) {
        console.error('Error saving interviewer:', err);
        res.status(500).send('Error saving interviewer.');
    }
});

// Route to handle interviewer login
app.post('/login-interviewer', async (req, res) => {
    const { email, password } = req.body;
    try {
        const interviewer = await Interviewer.findOne({ email, password });
        if (interviewer) {
            res.status(200).json({ success: true, interviewer });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Error during login.');
    }
});

// API to fetch matched interviewers for a specific job based on job ID and required skills
app.get('/match-interviewers/:jobId/:company', async (req, res) => {
    try {
        const { jobId, company } = req.params;
        
        const jobModelMap = {
            company1: Company1Job,
            company2: Company2Job,
            company3: Company3Job
        };
        
        const JobModel = jobModelMap[company.toLowerCase()];
        
        if (!JobModel) return res.status(400).send('Invalid company specified.');
        
        const job = await JobModel.findById(jobId);
        if (!job) return res.status(404).send('Job not found.');

        const jobSkills = job.skillsRequired.split(',').map(skill => skill.trim().toLowerCase());
        const interviewers = await Interviewer.find({
            skills: { $regex: new RegExp(jobSkills.join('|'), 'i') }
        });

        res.status(200).json(interviewers);
    } catch (err) {
        console.error('Error fetching matched interviewers:', err);
        res.status(500).send('Error fetching interviewers.');
    }
});
// Configure the nodemailer transporter with credentials
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false,
    auth: {
        user: 'icansenderemail@gmail.com',
        pass: 'glrtguplgxwwrhdn'
    }
});

// Route to send an email with an iCal event
app.post('/send-invite', (req, res) => {
    const { to, eventTitle, eventDescription, startTime, endTime } = req.body;

    const calendar = ical({ domain: 'example.com', name: 'Interview Event' });
    const event = calendar.createEvent({
        start: new Date(startTime),
        end: new Date(endTime),
        summary: eventTitle || 'Interview Event',
        description: eventDescription || 'Interview invite.',
        location: 'Online'
    });

    const icsData = calendar.toString();

    let mailOptions = {
        from: '"icalsender email" <icansenderemail@gmail.com>',
        to: to, // Email address of the interviewer
        subject: 'Interview Invite',
        text: 'You have an interview scheduled.',
        html: '<b>Your interview details are attached.</b>',
        attachments: [{
            filename: 'event.ics',
            content: icsData,
            contentType: 'text/calendar'
        }]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Failed to send invite:', error);
            return res.status(500).send('Failed to send invite');
        }
        console.log('Invite sent:', info.messageId);
        res.send('Invite sent successfully');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
