import React from "react";
import { Navigate,Outlet } from "react-router-dom";

const PrivateComponent = () =>{
    let auth = localStorage.getItem('user');
    console.log(auth);
    return auth?<Outlet/>:<Navigate to="/login" />
}

export default PrivateComponent