const { param } = require("../Router/userRouter");
const Apperror = require("./appError");

class BadRequestError extends Apperror{
    constructor(invalidParams){

        let message='';
        invalidParams.forEach(param=> message += `${param}\n `);
        super(`this request has the followng invalid parameters ${invalidParams}\n`,400);
        
    }
}
module.exports=BadRequestError;