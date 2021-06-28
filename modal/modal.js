const mongoose = require('mongoose');
const userschema = mongoose.Schema({
    uid: {
        type: Number,
    },
    name: {
        type: String,
    },
    email: {
        type: String
    },
    organisation: {
        type: String

    },
    dob: {
        type: String,
    },
    password: {
        type: String,
    },
    otp: {
        type: String,
    }

});
module.exports = mongoose.model('user', userschema);