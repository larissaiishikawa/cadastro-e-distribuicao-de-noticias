const newsRoutes = require('./routes/newsRoutes');
const connectDB = require('./config/db');
const express = require('express');

const app = express();

app.use(express.json());

/*----------------------INSERT----------------------*/
app.use('/news', newsRoutes);

app.use((err, req, res, next) => {
    console.error('ERRO GLOBAL:', err.stack);
  
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Ocorreu um erro interno no servidor.' 
      : err.message;
      
    res.status(err.status || 500).json({
      message: 'Algo deu errado!',
      error: errorMessage,
    });
  });

connectDB();

module.exports = app;