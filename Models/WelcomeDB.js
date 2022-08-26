const { Schema, model } = require('mongoose');

module.exports = model("WelcomeDB", new Schema({
    GuildID: String,
    WelcomeInfo: Array,
}));