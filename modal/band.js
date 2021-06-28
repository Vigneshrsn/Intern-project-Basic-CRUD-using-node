const mongoose = require('mongoose');
const bandschema = mongoose.Schema({
    uid: {
        type: Number,
    },
    bid: {
        type: Number,
    },
    name: {
        type: String
    },
    description: {
        type: String,


    },
    origin: {
        type: String,
    },
    rating: {
        type: Number,
    }
})
module.exports = mongoose.model('band', bandschema);