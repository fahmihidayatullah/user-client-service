const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    clientuid: { type: String, unique: true, required: true },
    clientname: { type: String, required: true },
    clientsecret: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Client', schema);