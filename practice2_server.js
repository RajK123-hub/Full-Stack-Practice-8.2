
// server.js
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Dummy user (in real apps, this would come from a database)
const user = {
  id: 1,
  username: "admin",
  password: "password123"
};

// Secret key for JWT (keep it in .env in real projects)
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey";

// Login route (generates JWT on successful login)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple authentication check
  if (username === user.username && password === user.password) {
    // Create a JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h" // token expires in 1 hour
    });

    return res.json({
      message: "Login successful!",
      token
    });
  }

  res.status(401).json({ message: "Invalid username or password" });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token after 'Bearer '

  if (!token) {
    return res.status(403).json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    // Attach decoded user info to the request
    req.user = decoded;
    next();
  });
}

// Protected route (only accessible with a valid token)
app.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "Welcome to the protected route!",
    user: req.user
  });
});

// Public route (no token needed)
app.get("/", (req, res) => {
  res.send("Public route: No authentication needed.");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
