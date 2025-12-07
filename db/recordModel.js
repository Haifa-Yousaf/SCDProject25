const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // numeric ID
    name: { type: String, required: true },             // name only
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);

