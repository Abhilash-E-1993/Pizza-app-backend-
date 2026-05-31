const Apperror = require("./appError");

class internalServererror extends Apperror{
    constructor(){

       
        super("Internal server Error",500);
        
    }
}
module.exports=internalServererror;