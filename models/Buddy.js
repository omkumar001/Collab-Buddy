const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const buddySchema= new Schema({
      username:
    {
        type : String,
        required: true,
        unique:true
    },
    email:
    {
        type : String,
        required: true,
        unique:true
    },
    password:
    {
        type:String,
        required:true,
        
    },
    sessionID:
    {
        type:String
    }
});
module.exports=mongoose.model("Buddy",buddySchema);