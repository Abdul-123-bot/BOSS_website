import React, { useEffect, useState } from "react";

const Shipping = () => {
    const user = JSON.parse(localStorage.getItem('user')).address_id;
   // const product = JSON.parse(localStorage.getItem('products'));
    const [deliver, setDeliver] = useState('');
    const [ship, setShip] = useState([]);
    const [shipper, setShipper] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const address_shipper = await fetch("http://localhost:5005/shipping", {
                    method: "POST",
                    body: JSON.stringify({ user }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const data = await address_shipper.json();
                const deliveryTime = new Date(Date.now() + (Number(data) + 720) * 60 * 1000);
                setDeliver(deliveryTime.toLocaleString()); // Convert to string representation
                localStorage.removeItem('products');
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="shipper">
        <h1>Thank you for ordering, Your order is being processed and will be shipped to your doorstep at {deliver}</h1>
        </div>
    );
}

export default Shipping;
