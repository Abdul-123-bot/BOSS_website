const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
const queryString = require('querystring');
const axios = require('axios');

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "project_fdb"
  });

  db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log("Connected to MySQL");
  });

  app.use(express.json());
  app.use(cors());

  app.post("/register", async (req, res) => {
    const { name, type, email, password } = req.body;
    const address_id = 1
    // Construct the SQL query
    const sql = "INSERT INTO users (name, type, email, password, address_id) VALUES (?, ?, ?, ?, ?)";

    // Execute the query
    db.query(sql, [name, type, email, password, address_id], (err, result) => {
        if (err) {
            // Handle error
            console.error("Error registering user:", err);
            return res.status(500).send("Error registering user");
        }

        // Fetch the inserted user from the database
        const getUserSql = "SELECT * FROM users WHERE user_id = ?";
        db.query(getUserSql, result.insertId, (err, userResult) => {
            if (err) {
                console.error("Error fetching user:", err);
                return res.status(500).send("Error registering user");
            }

            // Omit the password field from the response
            const user = userResult[0];
            delete user.password;

            // Send the registered user object as response
            res.send(user);
        });
    });
});

app.get("/navbar/:id", async (req, res) => {
    const userId = req.params.id;

    // Construct the SQL query to fetch the user by user_id
    const sql = "SELECT * FROM users WHERE user_id = ?";

    // Execute the query
    
    db.query(sql, userId, (err, result) => {
        if (err) {
            // Handle error
            console.error("Error fetching user:", err);
            return res.status(500).send("Error fetching user");
        }

        // Check if the user was found
        if (result.length === 0) {
            // User not found
            return res.status(404).send("User not found");
        }

        // Omit the password field from the response
        const user = result[0];
        delete user.password;
        console.log(user)
        // Send the user object as response
        res.send(user);
    });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Construct the SQL query to fetch the user by email and password
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    // Execute the query
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            // Handle error
            console.error("Error logging in:", err);
            return res.status(500).send("Error logging in");
        }

        // Check if the user was found
        if (result.length === 0) {
            // User not found or invalid credentials
            return res.status(401).send({ result: 'No User Found' });
        }

        // Omit the password field from the response
        const user = result[0];
        delete user.password;

        // Send the user object as response
        res.send(user);
    });
});

app.post("/feedback", async (req, res) => {
    const { product, feedback,  userId, productId } = req.body;

    // Construct the SQL query to insert feedback into the feedback table
    const sql = "INSERT INTO feedback (product_name, description, user_id, product_id) VALUES (?, ?, ?, ?)";

    // Execute the query
    db.query(sql, [product, feedback,  userId, productId], (err, result) => {
        if (err) {
            // Handle error
            console.error("Error saving feedback:", err);
            return res.status(500).send("Error saving feedback");
        }

        // Get the inserted feedback id
        const feedbackId = result.insertId;

        // Construct the SQL query to fetch the inserted feedback
        const getFeedbackSql = "SELECT * FROM feedback WHERE feedback_id = ?";

        // Execute the query to fetch the inserted feedback
        db.query(getFeedbackSql, feedbackId, (err, feedbackResult) => {
            if (err) {
                console.error("Error fetching feedback:", err);
                return res.status(500).send("Error fetching feedback");
            }

            // Send the inserted feedback as response
            res.send(feedbackResult[0]);
        });
    });
});

app.get('/product/:productId/feedback', async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log(productId)
        // Construct the SQL query to fetch feedback for the specified product ID
        const sql = "SELECT * FROM feedback WHERE product_id = ?";

        // Execute the query
        db.query(sql, Number(productId), (err, result) => {
            if (err) {
                // Handle error
                console.error('Error fetching feedback:', err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Send the feedback as response
            res.send(result);
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/add", async (req, res) => {
    try {
        const { name, price, brand, quantity, vat, category, supplier } = req.body;
        const discount_id = 1
        // Check if the product already exists
        const existingProduct = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM products WHERE name = ?";
            db.query(sql, [name], (err, result) => {
                if (err) {
                    console.error("Error checking existing product:", err);
                    return reject(err);
                }
                resolve(result[0]);
            });
        });

        // If product exists, return message
        if (existingProduct) {
            const stock = await new Promise((resolve , reject) =>{
                const sql = "update stock set quantity = quantity +1 where product_name = ?"
                db.query(sql , [name] , (err,result) =>{
                    if(err) {
                        console.error("Error checking existing product:", err);
                        return reject(err);
                    }
                    resolve(result[0]);
                });
            });

            return res.status(400).json({ message: "Product already exists" });
        }
        // Find a warehouse with available capacity
        const warehouse = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM warehouse WHERE capacity > 0 LIMIT 1";
            db.query(sql, (err, result) => {
                if (err) {
                    console.error("Error finding warehouse:", err);
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
        const stock = await new Promise((resolve , reject) =>{
            const sql = "INSERT INTO stock (product_name, quantity, updated_at, created_at, warehouse_id) VALUES (?, ?, ?, ?, ?)";
            const quant = 1;
            const date = new Date();
            db.query(sql , [name, quant, date, date, warehouse.warehouse_id], (err,result) =>{
                if(err) {
                    console.error("Error inserting product:", err);
                    return reject(err);
                }
                resolve(result[0]);
            });
        });
        

        // If no warehouse with available capacity found, return message
        if (!warehouse) {
            return res.status(400).json({ message: "No more space available in warehouses" });
        }

        // Check if supplier exists, if not, insert new supplier
        let supplierId;
        const existingSupplier = await new Promise((resolve, reject) => {
            const sql = "SELECT * FROM supplier WHERE name = ?";
            db.query(sql, [supplier], (err, result) => {
                if (err) {
                    console.error("Error checking existing supplier:", err);
                    return reject(err);
                }
                resolve(result[0]);
            });
        });

        if (!existingSupplier) {
            const insertSupplierSql = "INSERT INTO supplier (name) VALUES (?)";
            const insertedSupplier = await new Promise((resolve, reject) => {
                db.query(insertSupplierSql, [supplier], (err, result) => {
                    if (err) {
                        console.error("Error inserting new supplier:", err);
                        return reject(err);
                    }
                    resolve({ id: result.insertId });
                });
            });
            supplierId = insertedSupplier.id;
        } else {
            supplierId = existingSupplier.supplier_id;
        }


        console.log(stock)
        const insertProductSql = "INSERT INTO products (name, price, brand, quantity, vat, category, supplier_id , discount_id , stock_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [name, price, brand, quantity, vat, category, supplierId,discount_id,stock];

        await new Promise((resolve, reject) => {
            db.query(insertProductSql, values, (err, result) => {
                if (err) {
                    console.error("Error inserting product:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        // Update warehouse capacity
        const updateWarehouseSql = "UPDATE warehouse SET capacity = capacity - 1 WHERE warehouse_id = ?";
        await new Promise((resolve, reject) => {
            db.query(updateWarehouseSql, [warehouse.warehouse_id], (err, result) => {
                if (err) {
                    console.error("Error updating warehouse capacity:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/supplier", async (req, res) => {
    try {
        const sql = `
            SELECT
                s.*, sp.arrived_at, sp.status, sp.product, sp.ordered_at
            FROM
                supplier s
            LEFT JOIN
                supply sp ON s.supplier_id = sp.supplier_id
        `;
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error fetching suppliers:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send({ reply: "No supplier found" });
            }
        });
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.get("/analysis", async (req, res) => {
    try {
        const sql = `
            select products from transaction;
        `;
        db.query(sql, (err, result) => {
            if (err) {
                console.error("Error fetching analysis:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log(result[0])
            const hashMap = new Map();
            for(let i = 0 ; i < result.length ; i++){
                for(let j = 0 ; j < result[i].products.slice(1,-1).split(",").length ; j++){
                    if(hashMap.has(result[i].products.slice(1,-1).split(",")[j])){
                        hashMap.set(result[i].products.slice(1,-1).split(",")[j] ,hashMap.get(result[i].products.slice(1,-1).split(",")[j])+1);
                    }else{
                        hashMap.set(result[i].products.slice(1,-1).split(",")[j] , 1)
                    }
                }
                console.log(hashMap)
            }
            array = Array.from(hashMap, ([name, value]) => ({ name, value }));
            res.send(array);
        });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/", async (req, res) => {
    try {
        const productsSql = "SELECT * FROM products";
        const discountsSql = "SELECT * FROM discount";

        const products = await new Promise((resolve, reject) => {
            db.query(productsSql, (err, productsResult) => {
                if (err) {
                    console.error("Error fetching products:", err);
                    return reject(err);
                }
                resolve(productsResult);
            });
        });

        const discounts = await new Promise((resolve, reject) => {
            db.query(discountsSql, (err, discountsResult) => {
                if (err) {
                    console.error("Error fetching discounts:", err);
                    return reject(err);
                }
                resolve(discountsResult);
            });
        });

        products.forEach((product) => {
            const discount = discounts.find((d) => d.product_name === product.name);
            if (discount) {
                product.price -= (product.price * discount.percentage) / 100;
            }
        });

        res.send(products);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/buy", async (req, res) => {
    try {
        const productsSql = "SELECT * FROM products";
        const discountsSql = "SELECT * FROM discount";

        const products = await new Promise((resolve, reject) => {
            db.query(productsSql, (err, productsResult) => {
                if (err) {
                    console.error("Error fetching products:", err);
                    return reject(err);
                }
                resolve(productsResult);
            });
        });

        const discounts = await new Promise((resolve, reject) => {
            db.query(discountsSql, (err, discountsResult) => {
                if (err) {
                    console.error("Error fetching discounts:", err);
                    return reject(err);
                }
                resolve(discountsResult);
            });
        });


        products.forEach((product) => {
            const discount = discounts.find((d) => d.product_name === product.name);
            if (discount) {
                product.price -= (product.price * discount.percentage) / 100;
            }
        });

        res.send(products);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/profile", async (req, res) => {
    try {
        const userName = req.body.name;


        const orderSql = "SELECT * FROM orders WHERE name = ?";
        const order = await new Promise((resolve, reject) => {
            db.query(orderSql, [userName], (err, orderResult) => {
                if (err) {
                    console.error("Error fetching order:", err);
                    return reject(err);
                }
                resolve(orderResult[0]); 
            });
        });

        if (!order) {
            return res.send("No products ordered");
        }


        const productOrderSql = "SELECT * FROM product_order WHERE order_id = ?";
        const productOrders = await new Promise((resolve, reject) => {
            db.query(productOrderSql, [order.order_id], (err, productOrderResult) => {
                if (err) {
                    console.error("Error fetching product orders:", err);
                    return reject(err);
                }
                resolve(productOrderResult);
            });
        });

        res.send(productOrders);
    } catch (error) {
        console.error("Error fetching profile data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        // Find the product by ID
        const productSql = "SELECT * FROM products WHERE product_id = ?";
        const product = await new Promise((resolve, reject) => {
            db.query(productSql, [productId], (err, productResult) => {
                if (err) {
                    console.error("Error fetching product:", err);
                    return reject(err);
                }
                resolve(productResult[0]);
            });
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Find the corresponding stock data
        const stockSql = "SELECT * FROM stock WHERE product_name = ?";
        const stock = await new Promise((resolve, reject) => {
            db.query(stockSql, [product.name], (err, stockResult) => {
                if (err) {
                    console.error("Error fetching stock data:", err);
                    return reject(err);
                }
                resolve(stockResult[0]);
            });
        });

        // Delete the product from the products table
        const deleteProductSql = "DELETE FROM products WHERE product_id = ?";
        await new Promise((resolve, reject) => {
            db.query(deleteProductSql, [productId], (err, result) => {
                if (err) {
                    console.error("Error deleting product:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        // Update stock and warehouse data
        if (stock) {
            if (stock.quantity > 1) {
                const updateStockSql = "UPDATE stock SET quantity = quantity - 1 WHERE product_name = ?";
                await new Promise((resolve, reject) => {
                    db.query(updateStockSql, [product.name], (err, result) => {
                        if (err) {
                            console.error("Error updating stock:", err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            } else {
                const deleteStockSql = "DELETE FROM stock WHERE product_name = ?";
                await new Promise((resolve, reject) => {
                    db.query(deleteStockSql, [product.name], (err, result) => {
                        if (err) {
                            console.error("Error deleting stock:", err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });
            }
        }
        const updatewarehousekSql = "UPDATE warehouse SET capacity = capacity + 1 where capacity < 10 limit 1";
                await new Promise((resolve, reject) => {
                    db.query(updatewarehousekSql, (err, result) => {
                        if (err) {
                            console.error("Error updating warehouse:", err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
 
app.post("/checkout", async (req, res) => {
    try {
        const result = req.body;

        let sum = 0;
        let userId;
        const productIds = [];
        const productNames = [];

        await Promise.all(result.map(async (item) => {
            sum += item.price;
            productIds.push(item.product_id);

            // Delete product from the products table
            const deleteProductSql = "DELETE FROM products WHERE product_id = ?";
            await new Promise((resolve, reject) => {
                db.query(deleteProductSql, [item._id], (err, result) => {
                    if (err) {
                        console.error("Error deleting product:", err);
                        return reject(err);
                    }
                    resolve(result);
                });
            });

            // Find stock data for the product
            const stockSql = "SELECT * FROM stock WHERE product_name = ?";
            const stock = await new Promise((resolve, reject) => {
                db.query(stockSql, [item.name], (err, result) => {
                    if (err) {
                        console.error("Error fetching stock data:", err);
                        return reject(err);
                    }
                    resolve(result[0]);
                });
            });

            // Update stock and warehouse data
            if (stock) {
                if (stock.quantity > 1) {
                    const updateStockSql = "UPDATE stock SET quantity = quantity - 1 WHERE product_name = ?";
                    await new Promise((resolve, reject) => {
                        db.query(updateStockSql, [item.name], (err, result) => {
                            if (err) {
                                console.error("Error updating stock:", err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                } else if (stock.quantity === 1) {
                    const deleteStockSql = "DELETE FROM stock WHERE product_name = ?";
                    await new Promise((resolve, reject) => {
                        db.query(deleteStockSql, [item.name], (err, result) => {
                            if (err) {
                                console.error("Error deleting stock:", err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                }
            }

            productNames.push(item.name);
            userId = item.user_id;
        }));

        // Insert order into the orders table
        const insertOrderSql = "INSERT INTO orders (user_id, total) VALUES (?, ?)";
        const orderValues = [userId, sum];
        const insertedOrder = await new Promise((resolve, reject) => {
            db.query(insertOrderSql, orderValues, (err, result) => {
                if (err) {
                    console.error("Error inserting order:", err);
                    return reject(err);
                }
                resolve(result.insertId);
            });
        });

        // Insert transaction into the transactions table
        const insertTransactionSql = "INSERT INTO transaction (order_id, products, type, total) VALUES (?, ?, ?, ?)";
        const transactionValues = [insertedOrder, JSON.stringify(productNames), "debit", sum];
        await new Promise((resolve, reject) => {
            db.query(insertTransactionSql, transactionValues, (err, result) => {
                if (err) {
                    console.error("Error inserting transaction:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.json({ message: "Order placed successfully" });
    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.post("/address", async (req, res) => {
    try {
        const result = req.body;
        console.log(result);

        // Insert address data into the addresses table
        const insertAddressSql = "INSERT INTO address (state, street, hno, city) VALUES (?, ?, ?, ?)";
        const addressValues = [result.state, result.street, result.hno, result.city];

        await new Promise((resolve, reject) => {
            db.query(insertAddressSql, addressValues, (err, result) => {
                if (err) {
                    console.error("Error inserting address:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.json({ message: "Address added successfully" });
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/address", async (req, res) => {
    try {
        // Fetch all addresses from the address table
        const selectAddressesSql = "SELECT * FROM address";

        db.query(selectAddressesSql, (err, rows) => {
            if (err) {
                console.error("Error fetching addresses:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }

            res.json(rows);
        });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/shipping", async (req, res) => {
    try {
        const user = req.body.user;
        console.log(user)
        // Fetch user address from the database
        const selectUserAddressSql = "SELECT * FROM address WHERE address_id=2";
        const userAddress = await new Promise((resolve, reject) => {
            db.query(selectUserAddressSql, [user], (err, rows) => {
                if (err) {
                    console.error("Error fetching user address:", err);
                    return reject(err);
                }
                if (rows.length === 0) {
                    return reject("User address not found");
                }
                // Since it's a single row query, select the first row (index 0)
                const address = rows[0];
                resolve(address);
            });
        });

        console.log(typeof userAddress.hno)

        if (!userAddress) {
            return res.status(404).send("User address not found");
        }

        const addressString = `${userAddress.hno}, ${userAddress.street}, ${userAddress.city}, ${userAddress.state}` ;
        console.log(addressString);
        // Fetch shipper addresses from the database
        const selectShipperAddressesSql = "SELECT * FROM address WHERE address_id = 3";
        const shipperAddressRows = await new Promise((resolve, reject) => {
            db.query(selectShipperAddressesSql, (err, rows) => {
                if (err) {
                    console.error("Error fetching shipper addresses:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });

        console.log(shipperAddressRows+"22")

        const shipperAddresses = shipperAddressRows.map(addr => `${addr.hno} ${addr.street} ${addr.city} ${addr.state}`);

        // Make API requests to calculate distances and determine shipping time
        const shippingTimes = await Promise.all(shipperAddresses.map(async (shipperAddress) => {
            const query = {
                origins: addressString,
                destinations: shipperAddress,
                units: "imperial",
                key: "AIzaSyAxe9jXspiST84NrQoo8_P0ZHQiB9tUYqE" // Replace with your Google Maps API key
            };
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${queryString.stringify(query)}`;
            const response = await axios.get(url);
            const data = response.data;
            // Extract shipping time from the response
            const duration = data.rows[0].elements[0].duration.text;
            console.log(duration)
            return duration;
            
        }));

        // Find the minimum shipping time
        //console.log(shippingTimes[0][0].toString())
        //console.log(shippingTimes.toString())

        res.send(shippingTimes[0][0].toString());
    } catch (error) {
        console.error("Error calculating shipping:", error);
        res.status(500).send("Internal Server Error");
    }
});


app.get("/shipper", async (req, res) => {
    try {
        // Fetch shipper data from the database
        const query = "SELECT * FROM shipper";
        db.query(query, (err, rows) => {
            if (err) {
                console.error("Error fetching shipper data:", err);
                res.status(500).json({ error: "Internal Server Error" });
                return;
            }

            // Check if shipper data is found
            if (rows.length > 0) {
                res.json(rows);
            } else {
                res.status(404).json({ message: "Shipper data not found" });
            }
        });
    } catch (error) {
        console.error("Error fetching shipper data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        // Fetch product from the database
        const selectProductSql = "SELECT * FROM products WHERE product_id = ?";
        const [product] = await new Promise((resolve, reject) => {
            db.query(selectProductSql, [productId], (err, rows) => {
                if (err) {
                    console.error("Error fetching product:", err);
                    return reject(err);
                }
                resolve(rows);
            });
        });

        if (!product) {
            return res.status(404).json({ result: "No record found" });
        }

        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
app.put("/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedFields = req.body;

        // Update product in the database
        const updateProductSql = "UPDATE products SET ? WHERE product_id = ?";
        await new Promise((resolve, reject) => {
            db.query(updateProductSql, [updatedFields, productId], (err, result) => {
                if (err) {
                    console.error("Error updating product:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/search/:key", async (req, res) => {
    try {
        const keyword = req.params.key;

        // Search for products based on the keyword in MySQL
        const searchQuery = `
            SELECT * 
            FROM products 
            WHERE name LIKE ? 
            OR brand LIKE ? 
            OR category LIKE ? 
        `;
        const values = [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

        db.query(searchQuery, values, (err, result) => {
            if (err) {
                console.error("Error searching for products:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            res.json(result);
        });
    } catch (error) {
        console.error("Error searching for products:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



  app.listen(5005);  