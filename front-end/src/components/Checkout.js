import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CheckOut = () => {
    const items = JSON.parse(localStorage.getItem("products"));
    const [map, setMap] = useState(new Map());
    const [sum,setSum] = useState();
    const navigate = useNavigate();
    useEffect(() => {
        showCart();
    }, []);

    const showCart = () => {
        const cartMap = new Map();
        var s = 0;
        for (let i = 0; i < items.length; i++) {
            const itemKey = JSON.stringify(items[i]); // stringify JSON object for comparison
            s+=items[i].price;
            console.log(sum)
            if (cartMap.has(itemKey)) {
                cartMap.set(itemKey, cartMap.get(itemKey) + 1);
            } else {
                cartMap.set(itemKey, 1);
            }
        }
        setSum(s);
        setMap(cartMap);
    };
    
    const payforitems = async()=>{
            let result = await fetch('http://localhost:5005/checkout',{
                method:'POST',
                body: JSON.stringify(items),
                headers:{
                'Content-Type':'application/json'
                }
            });
            result = await result.json();
            console.warn('hello');

        navigate('/addaddress');
    }
    return (
        <div className="checkout">
            <ul>
                <li>Product</li>
                <li>Quantity</li>
                <li>Price</li>
            </ul>
            {
            map.size > 0 ? (
                Array.from(map.entries()).map(([key, value]) => (
                    <ul key={key}>
                        <li>{JSON.parse(key).name}</li>
                        <li>{value}</li>
                        <li>{JSON.parse(key).price}</li>
                    </ul>
                ))
            ) : (
                <h1>Nothing in Cart</h1>
            )
}
            <ul>
                <li>Total</li>
                <li>{sum}</li>
            </ul>

            <button onClick={payforitems}>Proceed to Pay</button>
        </div>
    );
};

export default CheckOut;
