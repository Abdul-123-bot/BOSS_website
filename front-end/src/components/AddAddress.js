import React, { useState } from "react";
import { json, useNavigate } from "react-router-dom";

const AddAddress = () =>{
    const user = JSON.parse(localStorage.getItem('user'))._id;
    const [hno,setHNo] = useState('');
    const [street,setStreet] = useState('');
    const [city,setCity] = useState('');
    const [state,setState] = useState('');
    const type = "user"
    const navigate = useNavigate('');
    const addaddress = async()=>{
        console.warn(user);
        const result = await fetch("http://localhost:5005/address",{
            method : 'POST',
            body : JSON.stringify({user,hno,street,city,state,type}),
            headers :{
                'Content-Type':'application/json'
            }
        })
        const r = await result.json();
        navigate('/ship');
    }

    return(
        <div>
        <h1>Enter Address</h1>
            <h2>H.NO:</h2>
            <br></br>
            <input type="text"  placeholder="Enter your house number" onChange={(e)=>setHNo(e.target.value)} value={hno}/>
            <br></br>
            <h2>Street</h2>
            <br></br>
            <input type="text" placeholder="Enter your street name" onChange={(e)=>setStreet(e.target.value)} value={street}/>
            <br></br>
            <h2>City</h2>
            <br></br>
            <input type="text" placeholder="Enter your city name" onChange={(e)=>setCity(e.target.value)} value={city}/>
            <br></br>
            <h2>State</h2>
            <br></br>
            <input type="text" placeholder="Enter your state name" onChange={(e)=>setState(e.target.value)} value={state}/>
            <br></br>
            <button type="button" onClick={addaddress}>Add address</button>
            </div>
    )
}

export default AddAddress;