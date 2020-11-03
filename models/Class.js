const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    started_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Class", classSchema);
