const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const app = express();

const PORT = process.env.PORT || 5000;


const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://localhost:3000'], 
    credentials: true, 
};


app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);


app.get('/', (req, res) => {
    res.send('DIM API is running...');
});


app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
