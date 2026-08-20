const cloudinary=require('../config/cloudinaryConfig');
const fs=require('fs/promises');
const { createProduct, getProduct, deleteProduct, getAllProducts } = require('../repository/productRepository');
const BadRequestError = require('../utils/badRequestError');

async function productservice(product_details,file){
    if(!file){
        throw new BadRequestError(['image file is not given']);

    }

    let image;
    try{
        image=await cloudinary.uploader.upload(file.path,{
            folder:'pizza-app/products',
            // auto format + quality + capped size => much smaller images => faster site
            transformation:[
                {width:800,height:800,crop:'limit'},
                {quality:'auto',fetch_format:'auto'}
            ]
        });
    }catch(uploadErr){
        console.log(uploadErr);
        throw{reason:"image upload failed. please try again",statuscode:500};
    }finally{
        // always remove the temp file (old code leaked it when cloudinary failed)
        await fs.unlink(file.path).catch(()=>{});
    }

    const data={
        productName:product_details.productName,
        // secure_url is https — old code used http which causes mixed-content issues on https frontends
        image:image.secure_url || image.url,
        price:product_details.price,
        description:product_details.description,
        inStock:product_details.inStock,
        category:product_details.category
    };
    try{
        const response=await createProduct(data);
        if(!response){
            throw{reason:"product is not created",statuscode:500};
        }
        return response;
    }catch(err){
        if(err && err.code===11000){
            throw{reason:"product name is already in use",statuscode:400};
        }
        if(err && err.name==='ValidationError'){
            throw{reason:err.message,statuscode:400};
        }
        console.log(err);
        throw{reason:"error while creating",statuscode:500};
    }


}
async function getProductById(id){
    let response;
    try{
        response=await getProduct(id);
    }catch(err){
        if(err && err.name==='CastError'){
            throw{reason:"invalid product id",statuscode:400};
        }
        console.log(err);
        throw{reason:"unable to fetch product",statuscode:500};
    }
    if(!response){
        throw{reason:"product not found",statuscode:404};
    }
    return response;
}

async function getProductsdata(){
    // an empty product list is valid (frontend shows an empty menu, not an error toast)
    const response=await getAllProducts();
    return response || [];
}
async function deleteProductById(id){
    let response;
    try{
        response=await deleteProduct(id);
    }catch(err){
        if(err && err.name==='CastError'){
            throw{reason:"invalid product id",statuscode:400};
        }
        console.log(err);
        throw{reason:"unable to delete product",statuscode:500};
    }
    if(!response){
        throw{reason:"product not found",statuscode:404};
    }
    return response;
}

module.exports={
productservice,
getProductById,
deleteProductById,
getProductsdata
}