const mongoose = require('mongoose');
const validator = require('validator');  // Ensure you have 'validator' installed via npm
// const Interviewer = require('../models/interviewer');

const interviewerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide the interviewer\'s name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    number: {
        type: String,
        required: [true, 'Please provide a contact number'],
        validate: {
            validator: function(v) {
                return /\d{3}-\d{3}-\d{4}/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    rate: {
        type: Number,
        required: [true, 'Please provide a rate per hour'],
        min: [0, 'Rate must be a positive number']
    },
    dates_available: {
        type: [Date],
        required: [true, 'Please provide available dates']
    },
    time_available: {
        type: String,
        required: [true, 'Please provide available times'],
        validate: {
            validator: function(v) {
                return /\d{2}:\d{2}/.test(v);  // Validating HH:MM format
            },
            message: props => `${props.value} is not a valid time format!`
        }
    },
    skills: {
        type: [String],
        default: []
    },
    availability: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    status: {
        type: String,
        enum: ['free', 'busy', 'on leave'],
        default: 'free'
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be a positive number'],
        max: [5, 'Rating can not be more than 5']
    }
});

const Interviewer = mongoose.model('Interviewer', interviewerSchema);
module.exports = Interviewer;
