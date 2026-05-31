const Apperror = require("./appError");

class NotFoundError extends Apperror{
    constructor(resource){

       
        super(`not able to find for the resource:${resource}`,404);
        
    }
}
module.exports=NotFoundError;
