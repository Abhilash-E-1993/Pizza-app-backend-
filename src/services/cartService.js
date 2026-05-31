const {findCart} = require("../repository/cartRepository");
const { getProduct } = require("../repository/productRepository");

async function getcart(cartDetails){
    try{
        const response=await findCart(cartDetails);
       
        if(!response){
            throw{reason:"Not getting the Cart",statuscode:500};
        }
        return response;
    }catch(err){
        console.log(err);
        throw{reason:"error while fetching the cart",statuscode:500};
    }

}

async function addTocartOrRemove(userId,productId,shouldadd){
    let quantityval=(shouldadd=="add")?1:-1;
   
    const cart=await getcart(userId);
    const product=await getProduct(productId);
    if(!product){
        throw{reason:"product is not found",statuscode:404};
    }
    if(!product.inStock && product.quantity<=0){
        throw{reason:"product is not in stock",statuscode:400};
    }
    //check if product already in the cart;
    let foundProduct=false;

     cart.items.forEach((item)=>{
        if(item.product._id==productId){
            foundProduct=true;
            if(product.quantity>=item.quantity+1 || quantityval<0) {
                
                item.quantity+=quantityval
                
                if(item.quantity<=0){
                    cart.items=cart.items.filter(item=>item.product._id != productId);
                   
                    return ;
                    
                }
            }
          
            else{
                throw{reason:"requested item not available",statuscode:404}
            }
            
            
        }
        
    });
    if(!foundProduct){
        if(shouldadd=="add"){
            cart.items.push({
            product:product,
            quantity:1
        });
        
    }
        }
    await cart.save();
    return cart;

}

async function ClearCart(userId){
    try{
        const response=await findCart(userId);
        if(!response){
            throw{reason:"unable to find cart",statuscode:404}
    }
    response.items=[];
    await response.save();
    return response;
    }catch(err){
        console.log(err);
        throw{reason:"unable to clear cart",statuscode:400}
    }
}
module.exports={
    getcart,
    addTocartOrRemove,
    ClearCart,
}