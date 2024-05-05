import React,{useEffect} from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const SignUp = ()=>{
    const [name,setName] = useState("");
    const [password,setPassword] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const type = 1;

    useEffect(()=>{
        const auth = localStorage.getItem('user');
        if(auth){
            navigate('/buy');
        }
    })
    const collectData = async ()=>{
        let result = await fetch('http://localhost:5005/register',{
            method:'post',
            body:JSON.stringify({name,email,password,type}),
            headers:{
                'Content-Type':'application/json'
            },
        });
        let r = await result.json();
        if(r.type == 1){
            navigate('/buy');
        }else navigate('/');
        localStorage.setItem("user",JSON.stringify(r));
    }
    return(
        <div className="login">
            <h1>Register</h1>
            <h2>Name:</h2>
           <input className="InputBox" value={name} onChange={(e)=>setName(e.target.value)} type="text" placeholder="Enter Your Name"/>
           <h2>Email Address:</h2>
            <input className="InputBox" value={email} onChange={(e)=>setEmail(e.target.value)} type="text" placeholder="Enter Email"/>
            <h2>Password:</h2>
            <input className="InputBox" value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Enter Password"/>
            <button className="ButtonBox" onClick={collectData} type="button">Sign Up</button>
        </div>
    )
}

export default SignUp;