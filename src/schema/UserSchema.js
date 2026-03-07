const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    FirstName:{
        type:String,
        required:[true, "first name is compulsory"],
        minlength:[5,"min length of 5 characters required"],
        lowercase:true
    },
    LastName:{
        type:String,
        lowercase:true
    },
    mobileNumber:{
        type:String,
        required:[true, "mobile number is compulsory"],
        unique:true,
        minlength:[10,"must be 10 digits"],
        maxlength:[10,"must be 10 digits"]
    },
    email:{
        type:String,
        required:[true, "email is compulsory"],
        unique:true
    },
    password:{
        type:String,
        required:[true, "password is compulsory"],
        minlength:[8,"minimum 8 characters required"]
    }
},{
    timestamps:true
})

const User = mongoose.model("User", UserSchema);

module.exports = User;