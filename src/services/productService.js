const cloudinary=require('../config/cloudinaryConfig');
const fs=require('fs/promises');
const { createProduct, getProduct, deleteProduct, getAllProducts } = require('../repository/productRepository');
const BadRequestError = require('../utils/badRequestError');

async function productservice(product_details,file){
    if(!file){
        throw new BadRequestError(['image file is not given']);
        
    }
   
    const image=await cloudinary.uploader.upload(file.path);
    const data={
        productName:product_details.productName,
        image:image.url,
        price:product_details.price,
        description:product_details.description,
        inStock:product_details.inStock,
        category:product_details.category
    };
    await fs.unlink(file.path);
    try{
        const response=await createProduct(data);
        if(!response){
            throw{reason:"product is not created",statuscode:500};
        }
        return response;
    }catch(err){
        console.log(err);
        throw{reason:"error while creating",statuscode:500};
    }
    

}
async function getProductById(id){
    try{
        const response=await getProduct(id);
        if(!response){
            throw{reason:"unable to get product",statuscode:404};
        }
        return response;
    }catch(err){
        console.log(err);
        throw{reason:"unable to find it",statuscode:404};
    }
}

async function getProductsdata(){
    try{
        const response=await getAllProducts();
        if(!response){
            throw{reason:"unable to get product",statuscode:404};
        }
        return response;
    }catch(err){
        console.log(err);
        throw{reason:"unable to find it",statuscode:404};
    }
}
async function deleteProductById(id){
    try{
        const response=await deleteProduct(id);
        console.log(response);
        if(!response){
            throw{reason:"unable to delete product",statuscode:400};
        }
        return response;
    }catch(err){
        console.log(err);
        throw{reason:"unable to delete it",statuscode:400};
    }
}

module.exports={
productservice,
getProductById,
deleteProductById,
getProductsdata
}