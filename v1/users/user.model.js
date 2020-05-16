const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    username: { type: String, required: true },
    hash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    clientId: { type: String, required: true },
    scope: { type: String, required: true },
    fcmkeys: {type: String, default: ""},
    no_hp: {type: String, default: ""},
    email: {type: String, default: ""},
    createdDate: { type: Date, default: Date.now }
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', schema);