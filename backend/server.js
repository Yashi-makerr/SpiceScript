const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect database and start server
connectDB().then(() => {
  const { seedMenuItems } = require('./utils/seeder');
  seedMenuItems();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});