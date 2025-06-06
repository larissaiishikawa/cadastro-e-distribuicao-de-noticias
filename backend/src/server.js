const newsRoutes = require('./routes/newsRoutes');
const connectDB = require('./config/db');
const express = require('express');

const app = express();

app.use(express.json());

/*----------------------INSERT----------------------*/
app.use('/news', newsRoutes);

connectDB();

module.exports = app;