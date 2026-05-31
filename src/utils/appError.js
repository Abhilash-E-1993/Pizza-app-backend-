class Apperror extends Error{
    constructor(message,statuscode){
        super(message);
        this.statuscode=statuscode;
        Apperror.captureStackTrace(this,this.constructor);

    }
}
module.exports=Apperror;
