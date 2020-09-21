const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const cetagorySchema = new Schema({
    title: {
        required: true,
        type:String
    },
    imageUrl: {
        type: String,
        required:true
    }
})
module.exports=mongoose.model('Cetagory',cetagorySchema)