const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema( {
    taskText: {
        type: String,
        required: true,
    },
    taskPriority: {
        type: String,
        required: true,
    },
    taskDate: {
        type: String,
        required: true,
    },
    taskTime: {
        type: String,
        required: false,
    },
    taskNotes: {
        type: String,
        required: false,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

const taskModel = mongoose.model('task', taskSchema)

module.exports = taskModel;