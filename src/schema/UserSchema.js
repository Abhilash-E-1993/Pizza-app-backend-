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
        unique:true
    },
})

module.exports = mongoose.model("User", UserSchema);