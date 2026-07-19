const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// .env load karna
dotenv.config();

// Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // JSON body ko parse karega

// Database connect & seed
connectDB().then(() => {
  const { seedMenuItems } = require('./utils/seeder');
  seedMenuItems();
});

// Routes import
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const path = require('path');

// Serve static assets from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/gallery', galleryRoutes);

// Serve index.html at root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Simple error handler (agar kisi controller se error aaye)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
