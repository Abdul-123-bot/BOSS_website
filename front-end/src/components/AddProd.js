import React from "react";
import { useState } from "react";

const AddProd = ()=>{

    const [name,setName] = useState('');
    const [price,setPrice] = useState('');
    const [brand,setBrand] = useState('');
    const [category,setCategory] = useState('');
    const [supplier,setSupplier] = useState('');
    const [vat,setVat] = useState('');
    const [error,SetError] = useState('');
    const [quantity,setQuantity] = useState('');
    const collectData = async()=>{

        const user_id = JSON.parse(localStorage.getItem('user'))._id;

        if(!name || !price ||  !brand || !category || !supplier){
            SetError(true);
            return false;
        }
        //console.warn(UserId);
        const result = await fetch("http://localhost:5005/add",{
            method:'POST',
            body:JSON.stringify({name,price,vat,quantity,brand,category,supplier,user_id}),
            headers:{
                'Content-Type':'application/json'
            }
        });
        let r = await result.json();
    }
return(
    <div className="login">
        <h1>Add Products</h1>
        <br></br>
        <h2>Name:</h2>
        <input type="text" placeholder="Enter the name of product" onChange={(e)=>{setName(e.target.value)}} value={name}/>
        {error && !name && <span className="Invalid-input"> Enter a valid name</span>}
        <h2>Price:</h2>
        <input type="text" placeholder="Enter the price of the product" onChange={(e)=>{setPrice(e.target.value)}} value={price}/>
        {error && !price && <span className="Invalid-input"> Enter a valid price</span>}
        <h2>VAT:</h2>
        <input type="text" placeholder="Enter the price of the product" onChange={(e)=>{setVat(e.target.value)}} value={vat}/>
        {error && !vat && <span className="Invalid-input"> Enter a valid vat</span>}
        <h2>Quantity:</h2>
        <input type="text" placeholder="Enter the price of the product" onChange={(e)=>{setQuantity(e.target.value)}} value={quantity}/>
        {error && !vat && <span className="Invalid-input"> Enter a valid quantity</span>}
        <h2>Brand:</h2>
        <input type="text" placeholder="Enter the brand of the product" onChange={(e)=>{setBrand(e.target.value)}} value={brand}/>
        {error && !brand && <span className="Invalid-input"> Enter a valid brand</span>}
        <h2>Category:</h2>
        <input type="text" placeholder="Enter the category of the product" onChange={(e)=>{setCategory(e.target.value)}} value={category}/>
        {error && !category && <span className="Invalid-input"> Enter a valid category</span>}
        <h2>Supplier:</h2>
        <input type="text" placeholder="Enter the supplier of the product" onChange={(e)=>{setSupplier(e.target.value)}} value={supplier}/>
        {error && !supplier && <span className="Invalid-input"> Enter a valid supplier</span>}
        <br></br>

        <button className="ButtonBox" onClick={collectData} type="button">Add Product</button>
    </div>
)
}

export default AddProd;     