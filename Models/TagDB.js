const { Schema, model } = require('mongoose');

module.exports = model("TagDatabase", new Schema({
    TagName: String,
    TagContent: String,
    TagUses: Number,
    TagCreator: String,
}))