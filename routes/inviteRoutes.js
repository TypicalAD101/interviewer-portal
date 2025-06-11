const express = require('express');
const router = express.Router();
// const Interviewer = require('./models/interviewer');
const Interviewer = require('../models/interviewer');


// Route to enroll a new interviewer
router.post('/interviewer/enroll', async (req, res) => {
    try {
        const { name, number, rate, dates_available, time_available } = req.body;

        const newInterviewer = new Interviewer({
            name,
            number,
            rate,
            dates_available,
            time_available,
            status: 'free',  // Default status as 'free' upon enrollment
        });

        await newInterviewer.save();
        res.status(201).json({ message: 'Interviewer enrolled successfully', data: newInterviewer });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling interviewer', error });
    }
});

// Route to fetch all interviewers
router.get('/interviewers', async (req, res) => {
    try {
        const interviewers = await Interviewer.find({});
        res.status(200).json(interviewers);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving interviewers', error });
    }
});

// Route to update an interviewer's status
router.patch('/interviewer/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedInterviewer = await Interviewer.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedInterviewer) {
            return res.status(404).json({ message: 'Interviewer not found' });
        }
        res.status(200).json({ message: 'Interviewer status updated successfully', data: updatedInterviewer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating interviewer status', error });
    }
});

module.exports = router;
