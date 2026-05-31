const mongoose=require('mongoose');
const serverConfig=require('./serverconfig');

async function connectDB(){
    try{
       
        await mongoose.connect(serverConfig.DB_URL);
        console.log("database connected");
    }catch(err){
        console.log("not connected");
        console.log(err);
    }
}

module.exports=connectDB;
//KZJtpqzF9CucYOKx