const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    FirstName:{
        type:String,
        required:[true, "first name is complosary"],
        minlength:[5,"min len of 5 characters is required"],
        lowercase:true

    },
    LastName:{
        type:String,
        lowercase:true

    },
    mobileNumber:{
        type:String,
        required:[true, "mobile number is complosary"],
        unique:true,
        minlength:[10,"min len of 10 characters is required"],
        maxlength:[10,"max len of 10 characters is required"],
    },
    email:{
        type:String,
        required:[true, "email is complosary"],
        unique:true,
    },
    password:{
        type:String,
        required:[true, "password is complosary"],
        minlength:[8,"min len of 8 characters is required"],
    },
},{
    timestamps:true,
    
})

module.exports = mongoose.model("User", UserSchema);