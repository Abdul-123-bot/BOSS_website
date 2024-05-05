import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Nav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [auth, setAuth] = useState(false);
    const [type, setType] = useState('');

    useEffect(() => {
        const fetchUserData = async (userId) => {
            try {
                const response = await fetch(`http://localhost:5005/navbar/${userId}`);
                const userData = await response.json();
                //console.warn(userData)
                setType(userData.type);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };  
        const func = async ()=>{
        const storedUser = localStorage.getItem('user');
  
        //console.warn('hello')
        if (storedUser) {
            //console.warn('hello')
            setAuth(true);
            //console.warn(auth)
            const user = await JSON.parse(storedUser);
            console.warn(user.user_id)
            fetchUserData(user.user_id);
        } else {
            setAuth(false);
            setType('');
        }
    }
        func()
    }, [location]);

    const logout = () => {
        localStorage.removeItem('user');
        setAuth(false);
        navigate('/login');
    };
    return (
        <div className='MenuBar'>
            <img alt='logo' className='logo' src="https://cdn1.vectorstock.com/i/1000x1000/11/45/store-logo-for-business-company-simple-vector-27211145.jpg" />
            {auth ? (
                <ul className='navbar-ul'>
                    {type ? (
                        <>
                            <li><Link to="/buy"><h2>Buy Products</h2></Link></li>
                            <li><Link to="/profile"><h2>Profile</h2></Link></li>
                            <li><Link to="/signup" onClick={logout}><h2>Logout</h2></Link></li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/"><h2>Products</h2></Link></li>
                            <li><Link to="/add"><h2>Add Products</h2></Link></li>
                            <li><Link to="/profile"><h2>Profile</h2></Link></li>
                            <li><Link to="/analysis"><h2>Sales Report</h2></Link></li>
                            <li><Link to="/signup" onClick={logout}><h2>Logout</h2></Link></li>
                        </>
                    )}
                </ul>
            ) : (
                <ul className='navbar-ul navbar-right'>
                    <li><Link to="/signup"><h2>SignUp</h2></Link></li>
                    <li><Link to="/login"><h2> Login</h2></Link></li>
                </ul>
            )}
        </div>
    );
};

export default Nav;
