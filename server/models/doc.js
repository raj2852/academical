const mongoose = require('mongoose');

const docSchema = new mongoose.Schema({
    filename: {type: String, required:true},
    creator: {type: String, required: true},
    creatorid: {type:String, required: true},
    dateofupload: {type: String, required:true},
    category: {type:String, required: true},
    content:[{
    chaptername: {type: String},
    chaptertext: {type: String},
    }],
    assignedto: [
        {
            name:{type: String},
            id:{type: String}
        }
    ]
})

const Doc = mongoose.model("doc", docSchema);

module.exports = {Doc};