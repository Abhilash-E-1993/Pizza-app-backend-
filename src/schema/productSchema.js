const mongoose=require('mongoose');

const Productschema=new mongoose.Schema({
    productName:{
        type:String,
        required:[true,"product name is required"],
        trim:true,
        minlength:[5,'product name must be atleast 5 characters'],
        unique:[true,"it is already in use"]

    },
    description:{
        type:String,
        minlength:[5,"description must be atleast 5 characters"],
    },
    image:{
        type:String,
    },
    category:{
        type:String,
        required:[true,"category is required"],
        enum:{
            values:["Veg","Non-Veg","drinks","sides"],
            default:"Veg",

        }
    },
    quantity:{
        type:Number,
        required:[true,"quantity is required"],
        default:10,
    },
    price:{
        type:Number,
        required:[true,"price is required"],
        min:[0,"price should be greater than or equal to 0"]
    },
    inStock:{
        type:Boolean,
        required:[true,"instock status must be show"],
        default:true,
    }

},{timestamps:true});

const product=mongoose.model('product',Productschema);
module.exports=product;