import React, { useEffect, useState } from "react";
import {Link} from 'react-router-dom';
const ListProd = ()=>{
    const [products,setProducts] = useState([]);
    useEffect(()=>{
        getProducts();
    },[]);
    const getProducts = async ()=>{
        let result = await fetch("http://localhost:5005/");
        result = await result.json();
        if(result){
        setProducts(result);
        }
    }
    const deleteProduct = async (id)=>{
        let result = await fetch(`http://localhost:5005/${id}`,{
            method: 'DELETE',
        });
        result = await result.json();
        console.warn(result);
        if(result.acknowledged){
            getProducts();
        }
    }

    const searchHandle = async (event) =>{
        let key = event.target.value;
        if(key){
        let result = await fetch(`http://localhost:5005/search/${key}`);
        result = await result.json();
        if(result){
            setProducts(result);
        }else{
            return;
        }
    }else{
        getProducts();
    }
    }
    //console.warn(products)
    return(
        <div className="ProdList">
            <h1>Product List</h1>
            <input type="text" placeholder="Search a product" onChange={searchHandle}/>
            <br></br>
            <ul>
                <li>S.No</li>
                <li>Name</li>
                <li>Price</li>
                <li>Brand</li>
                <li>Category</li>
                <li>Operation</li>
            </ul>
            {products.length>0?
                products.map((item,index)=>
                <ul>
                <li>{index+1}</li><li>{item.name}</li><li>{item.price}</li><li>{item.brand}</li><li>{item.category}</li><li><button onClick={()=>deleteProduct(item.product_id)}>Delete</button> <Link to={"/update/"+item.product_id}>Update</Link></li>
                </ul>
                ):<></>
                }
        </div>  
    )
}

export default ListProd;