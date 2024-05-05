import React, { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateProd = ()=>{

    const [name,setName] = useState('');
    const [price,setPrice] = useState('');
    const [brand,setBrand] = useState('');
    const [category,setCategory] = useState('');
    const [description,setDescription] = useState('');
    const [error,SetError] = useState('');
    const params = useParams();
    const navigate = useNavigate();

    useEffect(()=>{
        setProdDetails();

    },[])

    const setProdDetails = async ()=>{
        let result = await fetch(`http://localhost:5005/${params.id}`);
        result = await result.json();
        setName(result.name);
        setPrice(result.price);
        setBrand(result.brand);
        setCategory(result.category);
        setDescription(result.description);
    }

    const updateData = async ()=>{
        let result = await fetch(`http://localhost:5005/${params.id}`,{
            method:'PUT',
            body: JSON.stringify({name,price,brand,category,description}),
            headers:{
                'Content-Type' : "application/json"
            }
        });
        result = await result.json();
        navigate("/");
    }
return(
    <div className="login">
        <h1>Update Products</h1>
        <br></br>
        <h2>Name:</h2>
        <input type="text" placeholder="Update the name of product" onChange={(e)=>{setName(e.target.value)}} value={name}/>
        {error && !name && <span className="Invalid-input"> Enter a valid name</span>}
        <h2>Price:</h2>
        <input type="text" placeholder="Update the price of the product" onChange={(e)=>{setPrice(e.target.value)}} value={price}/>
        {error && !price && <span className="Invalid-input"> Enter a valid price</span>}
        <h2>Brand:</h2>
        <input type="text" placeholder="Update the brand of the product" onChange={(e)=>{setBrand(e.target.value)}} value={brand}/>
        {error && !brand && <span className="Invalid-input"> Enter a valid brand</span>}
        <h2>Category:</h2>
        <input type="text" placeholder="Update the category of the product" onChange={(e)=>{setCategory(e.target.value)}} value={category}/>
        {error && !category && <span className="Invalid-input"> Enter a valid category</span>}
        <br></br>
        <button className="ButtonBox" onClick={updateData} type="button">Update Product</button>
    </div>
)
}

export default UpdateProd;