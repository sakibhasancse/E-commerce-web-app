const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const aboutSchema = new Schema({
    description: {
    
        type:String
    },
    title: {
        required: true,
        type:String
    },
    imageUrl: {
        type: String,
        required:true
    }
})
module.exports=mongoose.model('About',aboutSchema)