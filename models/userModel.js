const mongoose = require('mongoose');
const userSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    savedTasks: {
        type: Array,
        default: [],
    },
    completeTasks: {
        type: Array,
        default: [],
    },
}, {
    timestamps: true
})

const userModel = mongoose.model('user', userSchema)

module.exports = userModel;