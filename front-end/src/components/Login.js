import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
const Login = () =>{
    const [email,setEmail] = React.useState('');
    const [password,setPassword] = React.useState('');
    const navigate = useNavigate();
    useEffect(()=>{
        const user = localStorage.getItem('user');
        if(user){
            navigate('/')
        }
    },[])
    const handleLogin = async()=>{
        console.warn(email,password);
        let result = await fetch('http://localhost:5005/login',{
            method:'POST',
            body: JSON.stringify({email,password}),
            headers:{
                'Content-Type':'application/json'
            }
        });
        result = await result.json();
        console.warn(result)
        if(result.name){
        localStorage.setItem("user",JSON.stringify(result));
        if(result.type) navigate("/buy");
        else navigate("/")
        }else{
            alert("please enter correct details")
        }
    }
    return (
        <div className="login">
            <h1>Login Page</h1>

            <h2>Email address:</h2>
            <br></br>
            <input type="text"  placeholder="Enter your email" onChange={(e)=>setEmail(e.target.value)} value={email}/>
            <br></br>
            <h2>Password:</h2>
            <br></br>
            <input type="password" placeholder="Enter your password" onChange={(e)=>setPassword(e.target.value)} value={password}/>
            <br></br>
            <a href="/signup">Don't have an account? Sign Up</a>
            <br></br>
            <button type="button" onClick={handleLogin}>Sign In</button>
        </div>
    )
}

export default Login;