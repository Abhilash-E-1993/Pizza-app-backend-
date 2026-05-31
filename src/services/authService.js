const jwt = require("jsonwebtoken");
const { findUser } = require("../repository/userRepository");
const bcrypt=require('bcrypt');
const { SECRET_KEY, JWT_EXPIRY } = require("../config/serverconfig");

async function loginUser(userDetails){
    const email=userDetails.email;
    const password=userDetails.password;

    const user=await findUser({email});
    if(!user){
        throw{message:"user with the given email not found" ,statuscode: 404};
        
    }

    const isPasswordvalid=await bcrypt.compare(password,user.password);
    if(!isPasswordvalid){
        throw{message:"given password is not valid.please try again",statuscode:401};
    }
    const Role=user.role? user.role: "USER";

    const token=jwt.sign({email:user.email,id:user._id,role:Role},SECRET_KEY,{expiresIn:JWT_EXPIRY});
    return {token,Role,userData:{email:user.email,firstName:user.firstName}};

}
module.exports=loginUser;