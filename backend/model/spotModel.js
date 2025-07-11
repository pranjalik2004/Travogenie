
const mongoose= require("mongoose")

const spotSchema =new mongoose.Schema({
    name:{type:String ,required:true},
    location:{type:String, required:true},
    description:{type:String, requried:true},
    category:{type:String},
    image:{type:String, requried:true}

})
const spotModel=mongoose.models.spot || mongoose.model('spot' ,spotSchema)

module.exports=spotModel