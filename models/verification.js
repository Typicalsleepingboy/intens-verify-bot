const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const verificationSchema = new mongoose.Schema({
    discordId: {
        type: String,
        required: true,
    },
    discordUsername: {
        type: String,
        required: true,
    },
    instagram: {
        type: String,
        required: true,
    },
    twitter: {
        type: String,
        required: true,
    },
    tiktok: {
        type: String,
        required: true,
    },
    uuid: {
        type: String,
        required: true,
        default: uuidv4,  // This ensures that the uuid is generated automatically if not provided
    },
    screenshotInstagram: {
        type: String,
        required: true,
    },
    screenshotTwitter: {
        type: String,
        required: true,
    },
    screenshotTiktok: {
        type: String,
        required: true,
    },
    screenshotYoutube: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Verification', verificationSchema);
