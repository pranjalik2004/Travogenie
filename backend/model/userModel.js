const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    phone: { type: Number, required: true },
    address: { type: String, required: true },
    gender:{type:String, required:true},
    image:{type:String ,default:"default :https://cdn-icons-png.flaticon.com/512/6522/6522516.png"}
}, { minimize: false });


const userModel = mongoose.models.user || mongoose.model("user", userSchema);

module.exports = userModel;
