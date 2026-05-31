const mongoose=require('mongoose');

const OrderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        requiured:true
    },
    items:[
            {
                product:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:'product',
                    required:true
                },
                quantity:{
                    type:Number,
                    required:true,
                    default:1,
                }
            }
        ],
    TotalPrice:{
        type:Number,
        required:true,
    },

    status:{
        type:String,
        enum:["ORDERED","CANCELLED","DELIVERD","PROCESSING","OUT_OF_DELIVERY"],
        default:"ORDERED"
    },
    address:{
        type:String,
        minLength:[10,"address should be atleast of 10 characters"],
    },
    paymentMethod:{
        type:String,
        enum:["CASH_ON_DELIVERY","ONLINE"],
        default:"CASH_ON_DELIVERY",
    }

},{
    timestamps:true,
});

const Order=mongoose.model("Order",OrderSchema);
module.exports=Order;