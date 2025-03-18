const express = require('express');

const port = 5000;
const { connectMongoDB } = require('./DB/conn');

const app = express();
connectMongoDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// const port = process.env.PORT || 5000;
const mongoose = require('mongoose');

// Function to connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect("mongodb://localhost:27017/MERN", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Database connected successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}

// Define a Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number
});

// Create a Model
const User = mongoose.model('Demo', userSchema);

// Insert Data Function
async function insertUser() {
    try {
        const newUser = new User({
            name: "Meet",
            email: "Meet@example.com",
            age: 22
        });

        const result = await newUser.save();
        console.log("✅ Data inserted successfully:", result);
    } catch (error) {
        console.error("❌ Failed to insert data:", error);
    }
}

// Call the functions
connectDB().then(insertUser);

app.get("/", async (req, res) => {
    try {
        const insertedUser = await insertUser();  // Insert user and get the result
        res.send(`Server is running. Inserted User: `);
    } catch (error) {
        res.status(500).send("❌ Something went wrong!");
    }
});

app.listen(5000, () => {
    console.log(`Node+Express Server is running on port `);
});
console.log("server start");
app.get("/users", async (req, res) => {
    try {
        const users = await User.find();

        let html = `
        <html>
        <head>
            <title>User List</title>
            <style>
                table { border-collapse: collapse; width: 80%; margin: 20px auto; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f2f2f2; }
                body { font-family: Arial, sans-serif; }
                a { text-decoration: none; color: blue; }
                form { display: inline; }
            </style>
        </head>
        <body>
            <h2 style="text-align: center;">User List</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Age</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.age}</td>
                            <td>
                                <a href="/edit/${user._id}">Edit</a> | 
                                <form action="/delete/${user._id}" method="POST" onsubmit="return confirm('Are you sure you want to delete this user?');">
                                    <button type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send("❌ Failed to fetch users!");
    }
});

// ✅ Route to render the Edit Form
app.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).send("User not found!");

        let html = `
        <html>
        <head>
            <title>Edit User</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; }
                form { display: inline-block; text-align: left; margin-top: 20px; }
                input { margin-bottom: 10px; padding: 8px; width: 300px; }
                button { padding: 8px 16px; }
            </style>
        </head>
        <body>
            <h2>Edit User</h2>
            <form action="/edit/${user._id}" method="POST">
                <input type="text" name="name" value="${user.name}" placeholder="Name" required /><br>
                <input type="email" name="email" value="${user.email}" placeholder="Email" required /><br>
                <input type="number" name="age" value="${user.age}" placeholder="Age" required /><br>
                <button type="submit">Update</button>
            </form>
        </body>
        </html>
        `;

        res.send(html);
    } catch (error) {
        res.status(500).send("❌ Failed to load user data!");
    }
});

// ✅ Route to handle user update
app.post("/edit/:id", async (req, res) => {
    try {
        const { name, email, age } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, age },
            { new: true }
        );

        if (!updatedUser) return res.status(404).send("User not found!");

        console.log("✅ User updated successfully:", updatedUser);
        res.redirect("/users");
    } catch (error) {
        res.status(500).send("❌ Failed to update user!");
    }
});
app.post("/delete/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) return res.status(404).send("User not found!");

        console.log("✅ User deleted successfully:", deletedUser);
        res.redirect("/users");
    } catch (error) {
        res.status(500).send("❌ Failed to delete user!");
    }
});
