const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: false
    },
    problemId: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    output: String,
    executionTime: String,
    aiFeedback: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
