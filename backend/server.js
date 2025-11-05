require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

const allowedOrigins = [
  'http://localhost:5173', 
  'https://slot-swapper.vercel.app' 
];

// ✅ Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy: Origin ${origin} not allowed`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/slotswapper');

app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/swaps', require('./routes/swaps'));

app.get('/', (req, res) => res.send('SlotSwapper API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
