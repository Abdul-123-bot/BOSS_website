import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Popup from 'reactjs-popup';

const BuyProd = () => {
    const [products, setProducts] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [fetchedFeedback, setFetchedFeedback] = useState([]);
    const [popupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getProds();
    }, []);

    const getProds = async () => {
        const response = await fetch("http://localhost:5005/");
        const result = await response.json();
        if (result) {
            setProducts(result);
        }
    }

    const addToCart = async (item) => {
        let storedProducts = JSON.parse(localStorage.getItem("products")) || [];
        storedProducts.push(item);
        localStorage.setItem("products", JSON.stringify(storedProducts));
        setCartItems(storedProducts);
        getProds();
    }

    const addFeedback = async () => {
        const userId = JSON.parse(localStorage.getItem('user')).user_id;
        const product = selectedProduct.name;
        const productId = selectedProduct.product_id;
        console.warn(userId , product)
        const response = await fetch("http://localhost:5005/feedback", {
            method: 'POST',
            body: JSON.stringify({ userId, product, feedback, productId }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        setFeedback(""); // Clear user input feedback after submission
        setSelectedProduct(null);
    }

    const getfeedbacks = async (item) => {
        try {
            console.log(item.product_id);
            const response = await fetch(`http://localhost:5005/product/${item.product_id}/feedback`);
            if (response.ok) {
                const feedbackData = await response.json();
                setFetchedFeedback(feedbackData); // Store fetched feedback
                setPopupOpen(true); // Open the popup after fetching feedback
            } else {
                console.error('Failed to fetch feedback');
            }
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    }

    const buyItems = async () => {
        const storedProducts = localStorage.getItem("products");
        const response = await fetch("http://localhost:5005/buy", {
            method: 'POST',
            body: storedProducts,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response) {
            navigate("/checkout");
        }
    }

    return (
        <div className="ProdList">
            <h1>Buy Products</h1>
            <ul>
                <li>S.No</li>
                <li>Name</li>
                <li>Price</li>
                <li>Brand</li>
                <li>Category</li>
                <li>Description</li>
                <li>Operation</li>
            </ul>
            {products.length > 0 &&
                products.map((item, index) => (
                    <ul key={index}>
                        <li>{index + 1}</li>
                        <li>{item.name}</li>
                        <li>{item.price}</li>
                        <li>{item.brand}</li>
                        <li>{item.category}</li>
                        <li>{item.description}</li>
                        <li>
                            <button onClick={() => addToCart(item)}>Add to Cart</button>
                            <br></br>
                            <button onClick={() => setSelectedProduct(item)}>Give Feedback</button>
                            <br></br>
                            <button onClick={() => getfeedbacks(item)}>View Feedback</button>
                        </li>
                    </ul>
                ))
            }
            <br />
            <Popup open={popupOpen} closeOnDocumentClick onClose={() => setPopupOpen(false)}>
                <div>
                    <h2>Feedback for Product</h2>
                    <ul>
                        {fetchedFeedback.map((item, index) => (
                            <li key={index}>{item.feedback}</li>
                        ))}
                    </ul>
                </div>
            </Popup>
            <Popup open={selectedProduct !== null} onClose={() => setSelectedProduct(null)}>
                <div>
                    <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter your feedback" />
                    <button onClick={addFeedback}>Submit Feedback</button>
                </div>
            </Popup>
            <Popup trigger={<button>View Cart</button>}>
                {cartItems.length > 0 ? cartItems.map((items, index) => (
                    <p key={index}>{items.name}</p>
                )) : <h1>No items found</h1>}
            </Popup>
            <button onClick={buyItems}>Buy Items</button>
        </div>
    );
};

export default BuyProd;
