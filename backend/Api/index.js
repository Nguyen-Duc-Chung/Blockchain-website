const express = require("express");  
// const mysql = require("mysql");  
const mysql = require("mysql2"); 
const cors = require("cors");  //  CORS for enabling Cross-Origin Resource Sharing
const multer = require("multer");  //  Multer for handling file uploads
const path = require("path");  

// Initialize the Express app
const app = express();

// MySQL connection setup
const db = mysql.createConnection({
    host: "localhost",    // Config this only
    user: "root",         // Config this only
    password: "root123",  // Config this only
    database: "group5_db"
});

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
app.use(cors());

// Test API Route: Simple route to check if the backend is connected and responding
app.get("/", (req,res)=> res.json("Hello this is the backend"));

//------------ File Upload Configuration ------------//
app.use("/uploads", express.static("uploads"));  // Serve static files (uploaded images) from the 'uploads' directory

// Multer setup for file upload handling
const storage = multer.diskStorage({ 
    // Define where to store uploaded files
    destination: (req, file, cb) => {
        cb(null, "uploads/");  // Store files in the 'uploads' folder
    },
    // Define the filename for the uploaded file
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Use current timestamp to avoid filename collisions
    }
});

// Create an instance of multer with the specified storage settings
const upload = multer({ storage });


// API Route: Fetch all cars from MySQL (for Market page)
app.get("/cars", (req, res) => { 
    const q = "SELECT * FROM car_table"; 
    db.query(q, (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: err });  // Internal Server Error
        }
        if (data.length === 0) {
            return res.status(404).json({ status: "404 Not Found", message: "No cars found" });  // 404 Not Found if no cars are found
        }
        return res.status(200).json({ status: "200 OK", data });  // 200 OK with car data
    });
});

// API Route: Fetch a single car by its token_id (for CarDetails page,Profile Page)
app.get("/cars/:token_id", (req, res) => {
    const { token_id } = req.params;  // Get the token_id from the URL parameters
    db.query("SELECT * FROM car_table WHERE token_id = ?", [token_id], (err, data) => {
        if (err) {
            return res.status(500).json({ status: "500 Internal Server Error", message: err });  // Internal Server Error
        }
        if (data.length === 0) {
            return res.status(404).json({ status: "404 Not Found", message: "Car not found" });  // 404 Not Found if no car is found
        }
        return res.status(200).json({ status: "200 OK", data: data[0] });  // Change success to status: "200 OK"
    });
});



// API Route: Store car details in MySQL when a new car is listed for sale (for Create page)
app.post("/cars", upload.single("image_path"), async (req, res) => {
    try {
        // Debugging logs (check if the backend receives data)
        console.log("Received request to add a car:", req.body);
        console.log("Uploaded file details:", req.file);

        // Extract form fields from the request body
        const { token_id, owner, seller, title, price, category, car_condition, created_date, description } = req.body;

        // Validate required fields
        if (!token_id || !owner || !seller || !title || 
            !price || !category || !car_condition || !created_date || !description ) {
            return res.status(400).json({ success: false, message: "❌ Missing required fields" });
        }

        // Process Image Upload
        const image_path = req.file ? `/uploads/${req.file.filename}` : null;  // If an image was uploaded, set its path

        // Debugging logs (Check values)
        console.log("Final values to insert:", { token_id, owner, seller, title, price, category, car_condition, created_date, image_path, description });

        // SQL query to insert the car data into the database
        const q = `INSERT INTO car_table 
                  (token_id, owner, seller, title, price, category, car_condition, created_date, image_path, description, currently_listed) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [token_id, owner, seller, title, price, category, car_condition, created_date, image_path, description, true];

        // Execute the SQL query
        db.query(q, values, (err, data) => {
            if (err) {
                console.error("❌ MySQL Error:", err); // Log error details
                return res.status(500).json({ success: false, message: "Internal Server Error", error: err });
            }

            // SQL query to insert user data into the users table, linking it to the car via token_id
            const userQuery = `INSERT INTO users (token_id, users_name) VALUES (?, ?)`;

            const userValues = [token_id, seller];  // seller's name and address

            db.query(userQuery, userValues, (err, userData) => {
                if (err) {
                    console.error("❌ MySQL Error inserting into users table:", err);
                    return res.status(500).json({ success: false, message: "Error inserting user data", error: err });
                }
                return res.json({ success: true, message: "✅ Car and user added successfully!" });
            });


            // return res.json({ success: true, message: "✅ Car added successfully!" });
        });

    } catch (error) {
        console.error("❌ Server Error:", error); // Log unexpected errors
        res.status(500).json({ success: false, message: "Unexpected Server Error", error: error.message });
    }
});

// API Route: Handle car purchase and transaction recording (for CarDetails page)
app.post("/buy-car", (req, res) => {   // Handle car purchase transactions
    const { token_id, new_owner, price_paid } = req.body;
    if (!token_id || !new_owner || !price_paid) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    // Update car ownership and mark it as not currently listed
    db.query("SELECT * FROM car_table WHERE token_id = ?", [token_id], (err, data) => {
        db.query(
            "UPDATE car_table SET owner = ?, seller = ?, currently_listed = ? WHERE token_id = ?",
            [new_owner, new_owner, false, token_id],
            (updateErr) => {
                if (updateErr) return res.status(500).json({ success: false, message: updateErr });

                // Insert transaction record into the transactions table
                const transactionQuery = `INSERT INTO transactions (token_id, buyer, seller, price, transaction_type)
                                          VALUES (?, ?, ?, ?, ?)`;
                db.query(transactionQuery, [token_id, new_owner, data[0].owner, price_paid, "Transfer"], (transErr) => {
                    if (transErr) return res.status(500).json({ success: false, message: transErr });

                    return res.json({ success: true, message: "Car purchased successfully!" });
                });
            }
        );
    });
});


// API Route: Fetch cars owned or sold by a specific wallet address (for Profile page)
app.get("/my-cars/:walletAddress", (req, res) => {
    const { walletAddress } = req.params;
    console.log("Fetching cars for wallet address:", walletAddress);
    
    db.query("SELECT * FROM car_table WHERE owner = ? OR seller = ?", [walletAddress, walletAddress], (err, data) => {
        if (err) return res.status(500).json({ success: false, message: err });

        // Ensure token_id is sent as a number
        const formattedData = data.map(car => ({
            ...car,
            token_id: Number(car.token_id)  // Convert token_id to a proper number
        }));

        console.log("Cars found:", formattedData);
        return res.json(formattedData); // Return the formatted data as JSON
    });
});

// API Route: Fetch transaction history by wallet address (for TransHistory.jsx)
app.get("/transactions", (req, res) => {   // Fetch transaction history
    const { wallet_address } = req.query;
    const query = `SELECT * FROM transactions WHERE buyer = ? OR seller = ?`;
    db.query(query, [wallet_address, wallet_address], (err, data) => {
        if (err) {
            return res.status(500).json({ status: "500 Internal Server Error", message: err });  // Internal Server Error
        }
        if (data.length === 0) {
            return res.status(404).json({ status: "404 Not Found", message: "No transactions found" });  // 404 Not Found if no transactions are found
        }
        return res.status(200).json({ status: "200 OK", data });  // 200 OK with transaction data
    });
});


// Starting the server and listening on port 8800
app.listen(8800, ()=>{
    console.log("Connected to backend!"); // Log a message indicating the server is running
});
