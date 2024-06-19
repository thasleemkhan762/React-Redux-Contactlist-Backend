const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({
    image: {
        type: String,
        required: [true, "please add the contact profilePicture"],
    },
    firstName: {
        type: String,
        required: [true, "please add the contact firstName"],
    },
    lastName: {
        type: String,
        required: [true, "please add the contact lastName"],
    },
    email: {
        type: String,
        required: [true, "please add the contact email address"],
    },
    phone: {
        type: String,
        required: [true, "please add the contact phone number"],
    },
},
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contact", contactSchema);