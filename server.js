const express = require('express');
const { body } = require('express-validator');
const connectDB = require('./config/db')

const app = express();

// Database connection
connectDB();

// Init Middleware
app.use(express.json({ extended: false }))

// app.get('/', (req, res) => res.send('API running..'))

// Defining Routes
//getting each route from the file required in each

app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/products', require('./routes/api/products'))
app.use('/api/categories', require('./routes/api/categories'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))