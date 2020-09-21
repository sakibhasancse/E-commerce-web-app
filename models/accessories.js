const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const accessoriesSchema = new Schema({
    title: {
        required: true,
        type:String
    },
    slug: {
      type:String
  }
})
module.exports=mongoose.model('Accessories',accessoriesSchema)